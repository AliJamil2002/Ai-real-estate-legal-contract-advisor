import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { encode } from 'base-64';
import BottomBar from './bottombar';

const WS_URL = 'ws://172.60.46.90:8000/voice/ws';

export default function VoiceScreen({ navigation }) {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer]         = useState('');
  const [language, setLanguage]     = useState('English');
  const [status, setStatus]         = useState('⬆️ Tap mic to speak');
  const [loading, setLoading]       = useState(false);

  const ws          = useRef(null);
  const recording   = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    connectWS();
    return () => ws.current?.close();
  }, []);

  const connectWS = () => {
    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => console.log('🔌 WS Connected');

    ws.current.onmessage = async (e) => {
      if (typeof e.data === 'string') {
        const msg = JSON.parse(e.data);

        if (msg.status === 'transcribing') { setStatus('📝 Transcribing...'); setLoading(true); }
        if (msg.status === 'transcribed')  { setTranscript(msg.text); setStatus('🤖 Thinking...'); }
        if (msg.status === 'answered')     { setAnswer(msg.answer); setStatus('🔊 Speaking...'); }
        if (msg.status === 'done')         { await playFullAudio(); setLoading(false); setStatus('⬆️ Tap mic to speak'); }
        if (msg.status === 'error')        { setStatus('❌ Error: ' + msg.message); setLoading(false); }
        if (msg.type === 'audio' && msg.data) { audioChunks.current.push(msg.data); }
      }
    };

    ws.current.onerror = (e) => console.log('❌ WS Error:', e.message);
    ws.current.onclose = () => console.log('🔌 WS Closed');
  };

  const playFullAudio = async () => {
    try {
      if (!audioChunks.current.length) return;

      const decoded = audioChunks.current.map(b64 => atob(b64));
      const totalLen = decoded.reduce((acc, s) => acc + s.length, 0);
      const combined = new Uint8Array(totalLen);
      let offset = 0;
      for (const str of decoded) {
        for (let i = 0; i < str.length; i++) combined[offset++] = str.charCodeAt(i);
      }
      audioChunks.current = [];

      let binary = '';
      for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i]);
      const finalBase64 = encode(binary);

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mpeg;base64,${finalBase64}` },
        { shouldPlay: true }
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch (e) {
      console.log('Audio play error:', e);
    }
  };

  const handleVoiceTap = async () => {
    if (listening) await stopRecording();
    else await startRecording();
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = rec;
      setListening(true);
      setTranscript('');
      setAnswer('');
      audioChunks.current = [];
      setStatus('🔴 Sun raha hoon...');
    } catch (e) {
      console.log('Recording error:', e);
    }
  };

  // ✅ FIX: blob.arrayBuffer() React Native mein kaam nahi karta
  // FileReader use karo instead
  const stopRecording = async () => {
    try {
      setListening(false);
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();

      const response = await fetch(uri);
      const blob = await response.blob();

      // ✅ FileReader se ArrayBuffer nikalo
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(arrayBuffer);
          setStatus('📤 Sending...');
          setLoading(true);
        } else {
          connectWS();
          setStatus('🔄 Reconnecting...');
        }
      };
      reader.onerror = (e) => {
        console.log('FileReader error:', e);
        setStatus('❌ File read error');
        setLoading(false);
      };
      reader.readAsArrayBuffer(blob);

    } catch (e) {
      console.log('Stop recording error:', e);
      setStatus('❌ Recording error');
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice AI</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.langRow}>
        {['Urdu', 'English'].map(lang => (
          <TouchableOpacity
            key={lang}
            style={[styles.langBtn, language === lang && styles.langBtnActive]}
            onPress={() => setLanguage(lang)}
          >
            <Text style={[styles.langText, language === lang && styles.langTextActive]}>
              {lang === 'Urdu' ? '🇵🇰 Urdu' : '🇬🇧 English'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.body}>
        <Text style={styles.voiceTitle}>Voice AI Assistant</Text>
        <Text style={styles.voiceSub}>Tap mic aur apna sawaal bolein</Text>
        <Text style={styles.poweredBy}>Powered by Groq Whisper + ElevenLabs</Text>

        <TouchableOpacity onPress={handleVoiceTap} style={styles.micWrapper} disabled={loading}>
          <View style={styles.micOuter}>
            <View style={styles.micMiddle}>
              <View style={[styles.micBtn, listening && styles.micBtnActive]}>
                <Text style={{ fontSize: 36 }}>{listening ? '⏹️' : '🎙️'}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.waveRow}>
          {[4,8,14,10,16,12,8,14,10,6,12,8].map((h, i) => (
            <View
              key={i}
              style={[styles.wavebar, { height: listening ? h * 2 : h, opacity: listening ? 1 : 0.4 }]}
            />
          ))}
        </View>

        {transcript ? (
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptLabel}>🎤 YOUR QUESTION</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        ) : null}

        {loading && <ActivityIndicator color="#0CC8C8" style={{ marginTop: 20 }} />}

        {answer ? (
          <View style={styles.answerCard}>
            <Text style={styles.answerLabel}>🤖 AI ANSWER</Text>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        ) : null}

        <Text style={styles.statusText}>{status}</Text>
      </View>

      <BottomBar navigation={navigation} active="Voice" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#060D1F' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 12 },
  headerBtn:      { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D1A2E', justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '800', color: '#0CC8C8' },
  langRow:        { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  langBtn:        { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#1A2D4A' },
  langBtnActive:  { backgroundColor: '#0CC8C8', borderColor: '#0CC8C8' },
  langText:       { color: '#5A7A9A', fontSize: 14, fontWeight: '600' },
  langTextActive: { color: '#060D1F', fontWeight: '800' },
  body:           { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  voiceTitle:     { fontSize: 22, fontWeight: '800', color: '#E2E8F0', marginBottom: 6 },
  voiceSub:       { fontSize: 13, color: '#5A7A9A', marginBottom: 4 },
  poweredBy:      { fontSize: 12, color: '#0CC8C8', marginBottom: 30, fontWeight: '600' },
  micWrapper:     { marginBottom: 28 },
  micOuter:       { width: 180, height: 180, borderRadius: 90, backgroundColor: '#0CC8C808', borderWidth: 1, borderColor: '#0CC8C822', justifyContent: 'center', alignItems: 'center' },
  micMiddle:      { width: 140, height: 140, borderRadius: 70, backgroundColor: '#0CC8C815', borderWidth: 1, borderColor: '#0CC8C833', justifyContent: 'center', alignItems: 'center' },
  micBtn:         { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0CC8C8', justifyContent: 'center', alignItems: 'center', shadowColor: '#0CC8C8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 },
  micBtnActive:   { backgroundColor: '#FF4D6A', shadowColor: '#FF4D6A' },
  waveRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24 },
  wavebar:        { width: 4, borderRadius: 2, backgroundColor: '#0CC8C8' },
  transcriptCard: { backgroundColor: '#0D1A2E', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1A2D4A', width: '100%', marginBottom: 12 },
  transcriptLabel:{ fontSize: 10, color: '#3A5070', fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  transcriptText: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  answerCard:     { backgroundColor: '#0D1A2E', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#0CC8C833', width: '100%', marginBottom: 12 },
  answerLabel:    { fontSize: 10, color: '#0CC8C8', fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  answerText:     { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  statusText:     { color: '#3A5070', fontSize: 13, fontWeight: '600', marginTop: 8 },
});