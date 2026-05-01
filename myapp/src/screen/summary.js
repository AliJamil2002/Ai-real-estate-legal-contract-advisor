import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import BottomBar from './bottombar';

export default function SummaryScreen({ navigation, route }) {
  const { contractId, summary, clauses, fileName } = route.params || {};

  const displaySummary = summary ||
   '';

  const displayClauses = clauses || [
   
  ];

  const colors = { danger: '#FF4D6A', warning: '#FFB800', info: '#4A9EFF', safe: '#00C896' };
  const icons  = { danger: '🚨',      warning: '⚠️',      info: 'ℹ️',     safe: '✅' };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Analysis</Text>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => navigation.navigate('Chat', { contractId, contractName: fileName })}
        >
          <Text style={styles.chatBtnText}>Chat 💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.fileRow}>
          <View style={styles.fileIcon}><Text style={{ fontSize: 18 }}>📄</Text></View>
          <Text style={styles.fileName} numberOfLines={1}>{fileName || 'DHA_Lease_Agreement.pdf'}</Text>
          <View style={styles.analyzedBadge}><Text style={styles.analyzedText}>Analyzed ✓</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 AI Summary</Text>
          <Text style={styles.summaryText}>{displaySummary}</Text>
        </View>

        <Text style={[styles.cardTitle, { marginBottom: 12 }]}>⚖️ Key Clauses</Text>
        {displayClauses.map((c, i) => (
          <View key={i} style={[styles.clauseCard, { borderLeftColor: colors[c.type] }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ fontSize: 16 }}>{icons[c.type]}</Text>
              <Text style={[styles.clauseTitle, { color: colors[c.type] }]}>{c.title}</Text>
            </View>
            <Text style={styles.clauseText}>{c.text}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.askBtn}
          onPress={() => navigation.navigate('Chat', { contractId, contractName: fileName })}
        >
          <Text style={styles.askBtnText}>💬 Sawaal Poochein →</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar navigation={navigation} active="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#060D1F' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 12 },
  headerBtn:     { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D1A2E', justifyContent: 'center', alignItems: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#0CC8C8' },
  chatBtn:       { backgroundColor: '#0D1A2E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#0CC8C855' },
  chatBtnText:   { color: '#0CC8C8', fontSize: 13, fontWeight: '700' },
  fileRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0D1A2E', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#1A2D4A' },
  fileIcon:      { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1A2D4A', justifyContent: 'center', alignItems: 'center' },
  fileName:      { flex: 1, color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  analyzedBadge: { backgroundColor: '#00C89622', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#00C89655' },
  analyzedText:  { color: '#00C896', fontSize: 10, fontWeight: '800' },
  card:          { backgroundColor: '#0D1A2E', borderRadius: 16, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#1A2D4A' },
  cardTitle:     { fontSize: 14, fontWeight: '800', color: '#E2E8F0', marginBottom: 10 },
  summaryText:   { color: '#8A9BB0', fontSize: 14, lineHeight: 22 },
  clauseCard:    { backgroundColor: '#0D1A2E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1A2D4A', borderLeftWidth: 3 },
  clauseTitle:   { fontSize: 13, fontWeight: '800' },
  clauseText:    { color: '#8A9BB0', fontSize: 13, lineHeight: 20 },
  askBtn:        { backgroundColor: '#0CC8C8', borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  askBtnText:    { color: '#060D1F', fontSize: 15, fontWeight: '800' },
});
