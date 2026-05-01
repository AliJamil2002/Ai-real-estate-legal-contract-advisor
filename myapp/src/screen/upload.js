import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';   // ✅ NEW
import { uploadContract } from '../services/api';
import BottomBar from './bottombar';

const BASE_URL = 'http://172.60.46.90:8000'; // ✅ // ← apna IP yahan likho

export default function UploadScreen({ navigation }) {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);

  const recentUploads = [];

  // ── Normal file pick (PDF / image) ──────────────────────────────
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.length > 0) setFile(result.assets[0]);
  };

  // ── Camera Scan ──────────────────────────────────────────────────
  const handleCameraScan = async () => {
    // 1. Permission maango
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Chahiye',
        'Settings mein ja ke camera allow karo',
        [{ text: 'OK' }]
      );
      return;
    }

    // 2. Camera kholo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    // 3. Photo li? File state set karo
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setFile({
        uri:      asset.uri,
        name:     'camera_scan_' + Date.now() + '.jpg',
        mimeType: 'image/jpeg',
        size:     asset.fileSize || 0,
      });
      Alert.alert('✅ Photo Li Gayi', 'Ab "Upload & Analyze" dabao');
    }
  };

const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      
      // ✅ Web + Mobile dono fix
      if (file.file instanceof File) {
        formData.append('file', file.file);  // Web browser
      } else {
        formData.append('file', {            // Mobile
          uri:  file.uri,
          name: file.name || 'contract.pdf',
          type: file.mimeType || 'application/pdf',
        });
      }

      const res = await fetch(`${BASE_URL}/contract/upload`, {
        method: 'POST',
        body:   formData,
      });

      const data = await res.json();

      navigation.navigate('Summary', {
        contractId: data.contract_id,
        summary:    data.summary,
        clauses:    data.clauses,
        fileName:   file.name,
      });

    } catch (err) {
      console.log(err);
      Alert.alert('Upload Failed', 'Server error ya file issue hai');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Contract</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Upload Box */}
        <TouchableOpacity
          style={[styles.uploadBox, file && styles.uploadBoxActive]}
          onPress={pickFile}
        >
          <Text style={{ fontSize: 52, marginBottom: 16 }}>{file ? '📄' : '📁'}</Text>
          {file ? (
            <>
              <Text style={styles.uploadTitle}>{file.name}</Text>
              <Text style={styles.uploadSub}>
                {file.size ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : ''}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.uploadTitle}>Upload Contract</Text>
              <Text style={styles.uploadSub}>
                Tap to select a file or drag & drop your legal document here
              </Text>
              <View style={styles.formatsRow}>
                {['PDF', 'JPG', 'PNG'].map(f => (
                  <View key={f} style={styles.formatBadge}>
                    <Text style={styles.formatText}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Camera & Cloud */}
        <View style={styles.optionsRow}>

          {/* ✅ FIXED: onPress lagaya */}
          <TouchableOpacity style={styles.optionCard} onPress={handleCameraScan}>
            <Text style={{ fontSize: 30, marginBottom: 8 }}>📷</Text>
            <Text style={styles.optionText}>Camera Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={{ fontSize: 30, marginBottom: 8 }}>☁️</Text>
            <Text style={styles.optionText}>Cloud Import</Text>
          </TouchableOpacity>

        </View>

        {/* Upload Button — file select hone ke baad dikhega */}
        {file && (
          <TouchableOpacity
            style={[styles.uploadBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.uploadBtnText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.uploadBtnText}>Upload & Analyze →</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Recent Uploads */}
        <Text style={styles.sectionTitle}>RECENT UPLOADS</Text>
        {recentUploads.map((u, i) => (
          <View key={i} style={styles.recentCard}>
            <View style={styles.recentIcon}><Text style={{ fontSize: 18 }}>📄</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recentName}>{u.name}</Text>
              <Text style={styles.recentMeta}>{u.size} • {u.pages}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
            </View>
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>{u.status}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar navigation={navigation} active="Upload" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#060D1F' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 12 },
  headerBtn:       { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D1A2E', justifyContent: 'center', alignItems: 'center' },
  headerTitle:     { fontSize: 18, fontWeight: '800', color: '#0CC8C8' },
  body:            { padding: 16, paddingBottom: 30 },
  uploadBox:       { borderWidth: 2, borderColor: '#1A2D4A', borderStyle: 'dashed', borderRadius: 20, padding: 36, alignItems: 'center', backgroundColor: '#0D1A2E', marginBottom: 16 },
  uploadBoxActive: { borderColor: '#0CC8C8', borderStyle: 'solid' },
  uploadTitle:     { fontSize: 18, fontWeight: '700', color: '#E2E8F0', marginBottom: 8, textAlign: 'center' },
  uploadSub:       { fontSize: 13, color: '#5A7A9A', textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  formatsRow:      { flexDirection: 'row', gap: 8 },
  formatBadge:     { borderRadius: 20, borderWidth: 1, borderColor: '#2A3D5A', paddingHorizontal: 14, paddingVertical: 5 },
  formatText:      { color: '#8A9BB0', fontSize: 12, fontWeight: '600' },
  optionsRow:      { flexDirection: 'row', gap: 12, marginBottom: 16 },
  optionCard:      { flex: 1, backgroundColor: '#0D1A2E', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1A2D4A' },
  optionText:      { color: '#8A9BB0', fontSize: 13, fontWeight: '600' },
  uploadBtn:       { backgroundColor: '#0CC8C8', borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  uploadBtnText:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  sectionTitle:    { fontSize: 11, fontWeight: '800', color: '#3A5070', letterSpacing: 2, marginBottom: 12 },
  recentCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1A2E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1A2D4A' },
  recentIcon:      { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1A2D4A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recentName:      { fontSize: 13, fontWeight: '700', color: '#E2E8F0', marginBottom: 2 },
  recentMeta:      { fontSize: 11, color: '#3A5070', marginBottom: 6 },
  progressBar:     { height: 3, backgroundColor: '#1A2D4A', borderRadius: 2 },
  progressFill:    { height: 3, backgroundColor: '#0CC8C8', borderRadius: 2 },
  doneBadge:       { backgroundColor: '#0CC8C822', borderRadius: 8, borderWidth: 1, borderColor: '#0CC8C855', paddingHorizontal: 10, paddingVertical: 4 },
  doneText:        { color: '#0CC8C8', fontSize: 11, fontWeight: '800' },
});