import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/apiServices';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Ingresa tu email y contraseña');
            return;
        }
        setLoading(true);
        try {
            const res = await authService.login(email.trim(), password);
            if (res.data.success && res.data.data) {
                await setAuth(res.data.data.token, res.data.data.email);
            } else {
                Alert.alert('Error', res.data.message || 'Login fallido');
            }
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'No se pudo conectar al servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.title}>Personal Shopper</Text>
                    <Text style={styles.subtitle}>Inicia sesión</Text>
                    <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
                    <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#6C47FF' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#6C47FF', marginBottom: 4, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
    button: { backgroundColor: '#6C47FF', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link: { color: '#6C47FF', textAlign: 'center', fontSize: 14 },
});
