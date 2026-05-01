import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const tabs = [
  { name: 'Dashboard', label: 'Home',   icon: '🏠' },
  { name: 'Upload',    label: 'Upload', icon: '📤' },
  { name: 'Chat',      label: 'Chat',   icon: '💬' },
  { name: 'Voice',     label: 'Voice',  icon: '🎙️' },
  { name: 'Help',      label: 'Help',   icon: '❓' },
];

export default function BottomBar({ navigation, active }) {
  return (
    <View style={styles.bar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => navigation.navigate(tab.name)}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[styles.label, active === tab.name && styles.activeLabel]}>
            {tab.label}
          </Text>
          {active === tab.name && <View style={styles.dot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar:         { flexDirection: 'row', backgroundColor: '#0D1A2E', borderTopWidth: 1, borderTopColor: '#1A2D4A', paddingBottom: 20, paddingTop: 10 },
  tab:         { flex: 1, alignItems: 'center', gap: 3 },
  icon:        { fontSize: 22 },
  label:       { fontSize: 10, color: '#4A6080', fontWeight: '600' },
  activeLabel: { color: '#0CC8C8' },
  dot:         { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0CC8C8', marginTop: 2 },
});
