import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { registerUser } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  // ✅ AXIOS POST → /auth/register
  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Sab fields bharein');
    if (password !== confirm) return Alert.alert('Error', 'Passwords match nahi kar rahe');
    try {
      setLoading(true);
      await registerUser(name, email, password);
      Alert.alert('✅ Success', 'Account ban gaya! Login karein', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.detail || 'Registration fail ho gayi');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon, value, onChange, secure, keyboard }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input} placeholder={label} placeholderTextColor="#3A4A6B"
          secureTextEntry={!!secure} keyboardType={keyboard || 'default'}
          autoCapitalize="none" value={value} onChangeText={onChange}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Wapas</Text>
        </TouchableOpacity>

        <View style={styles.logoArea}>
          <View style={styles.logoBox}><Text style={{ fontSize: 30 }}>⚖️</Text></View>
          <Text style={styles.appName}>Account Banayein</Text>
          <Text style={styles.appSub}>AI Real Estate Legal Advisor</Text>
        </View>

        <View style={styles.card}>
          <Field label="POORA NAAM"       icon="👤" value={name}     onChange={setName} />
          <Field label="EMAIL"            icon="✉️" value={email}    onChange={setEmail} keyboard="email-address" />
          <Field label="PASSWORD"         icon="🔒" value={password} onChange={setPassword} secure />
          <Field label="CONFIRM PASSWORD" icon="🔐" value={confirm}  onChange={setConfirm} secure />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleRegister} disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Register Karein →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={styles.loginLink}>
              Pehle se account hai? <Text style={{ color: '#0CC8C8', fontWeight: '700' }}>Login karein</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#060D1F' },
  scroll:    { padding: 24, paddingTop: 54 },
  backBtn:   { marginBottom: 20 },
  backText:  { color: '#0CC8C8', fontSize: 14, fontWeight: '600' },
  logoArea:  { alignItems: 'center', marginBottom: 28 },
  logoBox:   { width: 68, height: 68, borderRadius: 20, backgroundColor: '#0CC8C8', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#0CC8C8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 },
  appName:   { fontSize: 22, fontWeight: '800', color: '#0CC8C8', letterSpacing: 0.5 },
  appSub:    { fontSize: 12, color: '#5A7A9A', marginTop: 4 },
  card:      { backgroundColor: '#0D1A2E', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: '#1A2D4A' },
  label:     { color: '#4A6080', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#060D1F', borderRadius: 12, borderWidth: 1, borderColor: '#1A2D4A', paddingHorizontal: 14, height: 50 },
  inputIcon: { fontSize: 15, marginRight: 8 },
  input:     { flex: 1, color: '#E2E8F0', fontSize: 14 },
  btn:       { backgroundColor: '#0CC8C8', borderRadius: 14, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  btnText:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  loginLink: { color: '#5A7A9A', fontSize: 13 },
});
