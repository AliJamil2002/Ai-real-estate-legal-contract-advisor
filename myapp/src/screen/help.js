import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, LayoutAnimation,
} from 'react-native';
import BottomBar from './bottombar';

const faqs = [
  {
    q: 'How to upload a contract?',
    a: 'Go to Upload tab → Tap on "Upload Contract" box → Choose PDF or Image → Press "Upload & Analyze" button. AI will analyze it automatically.'
  },
  {
    q: 'Does the voice agent work in Urdu?',
    a: 'Yes! Select "Urdu" on the Voice screen. The system uses OpenAI Whisper which understands Urdu speech and can also respond in Urdu.'
  },
  {
    q: 'Is AI advice professional legal advice?',
    a: 'No. This system only provides informational and advisory support. For any legal decision, please consult a professional lawyer.'
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Your documents are transferred with HTTPS encryption. Temporary files are deleted after processing. No data is shared with any third party.'
  },
  {
    q: 'How many pages of documents can be analyzed?',
    a: 'A document up to 10 pages is analyzed in 10-15 seconds. Documents with 30+ pages are processed asynchronously and progress can be tracked.'
  },
];

export default function HelpScreen({ navigation }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
        <TouchableOpacity style={styles.headerBtn}><Text style={{ color: '#fff', fontSize: 18 }}>⋮</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* SOS Card */}
        <View style={styles.sosCard}>
          <Text style={{ fontSize: 50, marginBottom: 12 }}>🆘</Text>
          <Text style={styles.sosTitle}>Help & Support</Text>
          <Text style={styles.sosSub}>
            How to use the AI Contract Advisor? See the guides and FAQs below.
          </Text>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        {faqs.map((faq, i) => (
          <TouchableOpacity key={i} style={styles.faqCard} onPress={() => toggle(i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={[styles.faqArrow, openIndex === i && { color: '#0CC8C8' }]}>
                {openIndex === i ? '▲' : '▼'}
              </Text>
            </View>
            {openIndex === i && (
              <Text style={styles.faqA}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>📞 Support</Text>
          <Text style={styles.contactText}>0320-8808359</Text>
          <Text style={styles.contactText}>0333-6757681</Text>
          <Text style={styles.contactNote}></Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomBar navigation={navigation} active="Help" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060D1F' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 12 },
  headerBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#0D1A2E', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0CC8C8' },
  body: { padding: 16, paddingBottom: 30 },
  sosCard: { backgroundColor: '#0D1A2E', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#1A2D4A' },
  sosTitle: { fontSize: 22, fontWeight: '900', color: '#E2E8F0', marginBottom: 8 },
  sosSub: { fontSize: 13, color: '#5A7A9A', textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#3A5070', letterSpacing: 2, marginBottom: 12 },
  faqCard: { backgroundColor: '#0D1A2E', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1A2D4A' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { fontSize: 14, color: '#E2E8F0', fontWeight: '600', flex: 1, paddingRight: 10 },
  faqArrow: { color: '#3A5070', fontSize: 12 },
  faqA: { color: '#8A9BB0', fontSize: 13, lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1A2D4A' },
  contactCard: { backgroundColor: '#0D1A2E', borderRadius: 16, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#0CC8C833' },
  contactTitle: { fontSize: 14, fontWeight: '800', color: '#0CC8C8', marginBottom: 10 },
  contactText: { color: '#8A9BB0', fontSize: 13, marginBottom: 4 },
  contactNote: { color: '#5A7A9A', fontSize: 12, marginTop: 6 },
});
