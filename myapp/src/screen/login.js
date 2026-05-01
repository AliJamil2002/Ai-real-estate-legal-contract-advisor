import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { loginUser } from '../services/api';
import { saveToken } from '../services/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      await saveToken(response.data.token, response.data.user);
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>⚖️</Text>
        </View>
        <Text style={styles.appName}>AI Real Estate{'\n'}Legal Advisor</Text>
        <Text style={styles.appSub}>Smart Contract Analysis • Voice AI • RAG</Text>
        <Text style={styles.appTagline}>Your Legal Assistant</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>EMAIL / PHONE</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#3A4A6B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#3A4A6B"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={{ fontSize: 16 }}>{showPass ? '🔐' : '🔑'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogin} disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginBtnText}>Login →</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>OR</Text>
          <View style={styles.divLine} />
        </View>

        <TouchableOpacity style={styles.twilioBtn}>
          <Text style={styles.twilioText}>📞  Continue with Phone (Twilio)</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#060D1F', paddingHorizontal: 24 },
  logoArea:        { alignItems: 'center', paddingTop: 70, paddingBottom: 36 },
  logoBox:         { width: 80, height: 80, borderRadius: 22, backgroundColor: '#0CC8C8', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#0CC8C8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 },
  logoIcon:        { fontSize: 36 },
  appName:         { fontSize: 28, fontWeight: '900', color: '#0CC8C8', textAlign: 'center', lineHeight: 34, letterSpacing: 0.5 },
  appSub:          { fontSize: 12, color: '#5A7A9A', textAlign: 'center', marginTop: 8, letterSpacing: 0.3 },
  appTagline:      { fontSize: 14, color: '#5A7A9A', textAlign: 'center', marginTop: 4 },
  form:            { flex: 1 },
  label:           { color: '#4A6080', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 4 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1A2E', borderRadius: 14, paddingHorizontal: 16, height: 54, marginBottom: 16, borderWidth: 1, borderColor: '#1A2D4A' },
  inputIcon:       { fontSize: 16, marginRight: 10 },
  input:           { flex: 1, color: '#E2E8F0', fontSize: 15 },
  loginBtn:        { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12, backgroundColor: '#0CC8C8', shadowColor: '#0CC8C8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  loginBtnText:    { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  registerBtn:     { height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1A2D4A', marginBottom: 16 },
  registerBtnText: { color: '#8A9BB0', fontSize: 15, fontWeight: '600' },
  divider:         { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divLine:         { flex: 1, height: 1, backgroundColor: '#1A2D4A' },
  divText:         { color: '#3A5070', fontSize: 12, marginHorizontal: 12, fontWeight: '600' },
  twilioBtn:       { height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#0CC8C840' },
  twilioText:      { color: '#0CC8C8', fontSize: 15, fontWeight: '600' },
});