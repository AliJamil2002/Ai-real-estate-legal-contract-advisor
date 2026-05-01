import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { askQuestion } from '../services/api';
import BottomBar from './bottombar';

export default function ChatScreen({ navigation, route }) {
  const { contractId, contractName } = route.params || {};
  const [messages, setMessages] = useState([{
    id: '0', role: 'ai',
    text: 'Assalam o Alaikum! Main contract ke baare mein aapke sawaalon ka jawab de sakta hoon.',
    source: null,
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef               = useRef(null);

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 200);
  }, [messages]);

  // ✅ AXIOS POST → /contract/query
  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: q, time }]);
    setLoading(true);
    try {
      const res = await askQuestion(q, contractId || 'demo');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai',
        text:   res.data.answer,
        source: res.data.source || null,
        time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai',
        text: 'Dost ka backend abhi ready nahi hua. Jab FastAPI start ho toh kaam karega! 🚀',
        source: null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMsg = ({ item }) => (
    <View style={[styles.msgRow, item.role === 'user' ? styles.userRow : styles.aiRow]}>
      {item.role === 'ai' && (
        <View style={styles.avatar}><Text style={{ fontSize: 16 }}>🤖</Text></View>
      )}
      <View style={{ maxWidth: '78%' }}>
        <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>
            {item.text}
          </Text>
          {item.source && (
            <TouchableOpacity style={styles.sourceBadge}>
              <Text style={styles.sourceText}>🔗 Source: {item.source}</Text>
            </TouchableOpacity>
          )}
        </View>
        {item.time && <Text style={[styles.timeText, item.role === 'user' && { textAlign: 'right' }]}>{item.time}</Text>}
      </View>
      {item.role === 'user' && (
        <View style={styles.userAvatar}><Text style={{ fontSize: 16 }}>👤</Text></View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Chat</Text>
        <TouchableOpacity style={styles.headerBtn}><Text style={{ color: '#fff', fontSize: 18 }}>⋮</Text></TouchableOpacity>
      </View>

      {/* Active Document */}
      {contractName && (
        <View style={styles.docBanner}>
          <Text style={{ fontSize: 16 }}>📄</Text>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.docBannerLabel}>Active Document</Text>
            <Text style={styles.docBannerName}>{contractName}</Text>
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMsg}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={[styles.aiRow, { paddingHorizontal: 16, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
          <View style={styles.avatar}><Text style={{ fontSize: 16 }}>🤖</Text></View>
          <View style={styles.aiBubble}><ActivityIndicator color="#0CC8C8" size="small" /></View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Apna legal sawaal likhein..."
          placeholderTextColor="#3A5070"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={300}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Text style={{ fontSize: 18, color: '#060D1F' }}>➤</Text>
        </TouchableOpacity>
      </View>

      <BottomBar navigation={navigation} active="Chat" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#060D1F' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 12 },
  headerBtn:       { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D1A2E', justifyContent: 'center', alignItems: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: '800', color: '#0CC8C8' },
  docBanner:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1A2E', marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1A2D4A' },
  docBannerLabel:  { fontSize: 10, color: '#5A7A9A', fontWeight: '600' },
  docBannerName:   { fontSize: 13, color: '#E2E8F0', fontWeight: '700' },
  msgList:         { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 4 },
  msgRow:          { flexDirection: 'row', marginVertical: 6, alignItems: 'flex-end', gap: 8 },
  userRow:         { justifyContent: 'flex-end' },
  aiRow:           { justifyContent: 'flex-start' },
  avatar:          { width: 34, height: 34, borderRadius: 10, backgroundColor: '#0CC8C822', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#0CC8C855' },
  userAvatar:      { width: 34, height: 34, borderRadius: 10, backgroundColor: '#1A2D4A', justifyContent: 'center', alignItems: 'center' },
  bubble:          { borderRadius: 16, padding: 12 },
  aiBubble:        { backgroundColor: '#0D1A2E', borderWidth: 1, borderColor: '#1A2D4A' },
  userBubble:      { backgroundColor: '#0CC8C8' },
  bubbleText:      { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  userBubbleText:  { color: '#060D1F', fontWeight: '600' },
  sourceBadge:     { marginTop: 8, backgroundColor: '#1A2D4A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  sourceText:      { color: '#0CC8C8', fontSize: 12, fontWeight: '600' },
  timeText:        { color: '#3A5070', fontSize: 10, marginTop: 4, paddingHorizontal: 4 },
  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1A2D4A' },
  textInput:       { flex: 1, backgroundColor: '#0D1A2E', borderRadius: 14, borderWidth: 1, borderColor: '#1A2D4A', paddingHorizontal: 14, paddingVertical: 10, color: '#E2E8F0', fontSize: 14, maxHeight: 100 },
  sendBtn:         { width: 44, height: 44, borderRadius: 12, backgroundColor: '#0CC8C8', justifyContent: 'center', alignItems: 'center' },
});
