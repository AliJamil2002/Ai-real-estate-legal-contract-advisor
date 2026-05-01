import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { getContracts } from '../services/api';
import BottomBar from './bottombar';

export default function DashboardScreen({ navigation }) {
  const [contracts, setContracts]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await getContracts();
      setContracts(res.data.contracts || []); // ← backend se real data
    } catch (err) {
      console.log('Error:', err);
      setContracts([]); // ← dummy data hata diya
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchContracts(); };

  const quickActions = [
    { icon: '📤', title: 'Upload Contract', sub: 'Upload PDF / Image scan',    color: '#00C896', screen: 'Upload' },
    { icon: '💬', title: 'Ask AI',          sub: 'Ask questions from contract', color: '#4A9EFF', screen: 'Chat' },
    { icon: '🎙️', title: 'Voice Agent',     sub: 'Speak, AI will listen',      color: '#FFB800', screen: 'Voice' },
    { icon: '⚠️', title: 'Risk Analysis',   sub: 'View contract risks',         color: '#FF4D6A', screen: 'Summary' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0CC8C8" />}
      >
        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeSub}>Welcome back,</Text>
          <Text style={styles.welcomeName}>Ali <Text style={{ color: '#0CC8C8' }}>Jamil</Text> 👋</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { num: contracts.length, label: 'Contracts', color: '#0CC8C8' },
            { num: 0,                label: 'Risks',     color: '#FF4D6A' },
            { num: 0,                label: 'Queries',   color: '#0CC8C8' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity
              key={i} style={styles.actionCard}
              onPress={() => navigation.navigate(a.screen)}
            >
              <View style={[styles.actionTop, { backgroundColor: a.color }]} />
              <View style={styles.actionBody}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={styles.actionTitle}>{a.title}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Documents */}
        <Text style={styles.sectionTitle}>RECENT DOCUMENTS</Text>
        {loading
          ? <ActivityIndicator color="#0CC8C8" style={{ marginTop: 20 }} />
          : contracts.length === 0
            ? <Text style={styles.emptyText}>Koi contract nahi mila</Text>
            : contracts.map(c => (
              <TouchableOpacity
                key={c.contract_id}
                style={styles.docCard}
                onPress={() => navigation.navigate('Chat', {
                  contractId:   c.contract_id,
                  contractName: c.filename
                })}
              >
                <View style={styles.docIcon}>
                  <Text style={{ fontSize: 20 }}>📄</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{c.filename}</Text>
                  <Text style={styles.docDate}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
        }
        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar navigation={navigation} active="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#060D1F' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 12 },
  headerBtn:    { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D1A2E', justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#0CC8C8' },
  welcomeCard:  { marginHorizontal: 16, marginTop: 8, marginBottom: 16, backgroundColor: '#0D1A2E', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#1A2D4A' },
  welcomeSub:   { fontSize: 13, color: '#5A7A9A', marginBottom: 4 },
  welcomeName:  { fontSize: 24, fontWeight: '900', color: '#E2E8F0' },
  statsRow:     { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
  statCard:     { flex: 1, backgroundColor: '#0D1A2E', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#1A2D4A', alignItems: 'center' },
  statNum:      { fontSize: 26, fontWeight: '900' },
  statLabel:    { fontSize: 11, color: '#5A7A9A', marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#3A5070', letterSpacing: 2, marginHorizontal: 16, marginBottom: 12 },
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 16, marginBottom: 20 },
  actionCard:   { width: '47%', backgroundColor: '#0D1A2E', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1A2D4A' },
  actionTop:    { height: 4 },
  actionBody:   { padding: 16 },
  actionIcon:   { fontSize: 28, marginBottom: 10 },
  actionTitle:  { fontSize: 15, fontWeight: '800', color: '#E2E8F0', marginBottom: 4 },
  actionSub:    { fontSize: 12, color: '#5A7A9A' },
  docCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1A2E', borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1A2D4A' },
  docIcon:      { width: 42, height: 42, borderRadius: 10, backgroundColor: '#1A2D4A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  docName:      { fontSize: 13, fontWeight: '700', color: '#E2E8F0', marginBottom: 3 },
  docDate:      { fontSize: 11, color: '#3A5070' },
  emptyText:    { color: '#5A7A9A', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
 