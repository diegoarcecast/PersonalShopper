import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AppStackParamList, RED_SOCIAL_OPTIONS } from '../../types';
import { orderService } from '../../services/apiServices';

type Props = { navigation: StackNavigationProp<AppStackParamList, 'OrderForm'>; route: RouteProp<AppStackParamList, 'OrderForm'> };

export default function OrderFormScreen({ navigation, route }: Props) {
    const { dayId, order } = route.params;
    const queryClient = useQueryClient();
    const isEdit = !!order;

    const [nombrePersona, setNombrePersona] = useState(order?.nombrePersona || '');
    const [producto, setProducto] = useState(order?.producto || '');
    const [descripcion, setDescripcion] = useState(order?.descripcion || '');
    const [redSocial, setRedSocial] = useState(order ? RED_SOCIAL_OPTIONS.find(o => o.label === order.redSocial)?.value ?? 0 : 0);
    const [usuarioRedSocial, setUsuarioRedSocial] = useState(order?.usuarioRedSocial || '');
    const [usuarioAsignadoFuturo, setUsuarioAsignadoFuturo] = useState(order?.usuarioAsignadoFuturo || '');
    const [photoUri, setPhotoUri] = useState<string | null>(order?.fotoBase64 ? `data:image/jpeg;base64,${order.fotoBase64}` : null);
    const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('nombrePersona', nombrePersona.trim());
            if (producto.trim()) formData.append('producto', producto.trim());
            if (descripcion.trim()) formData.append('descripcion', descripcion.trim());
            formData.append('redSocial', redSocial.toString());
            if (usuarioRedSocial.trim()) formData.append('usuarioRedSocial', usuarioRedSocial.trim());
            if (usuarioAsignadoFuturo.trim()) formData.append('usuarioAsignadoFuturo', usuarioAsignadoFuturo.trim());
            if (newPhotoUri) {
                const filename = newPhotoUri.split('/').pop() || 'photo.jpg';
                formData.append('foto', { uri: newPhotoUri, name: filename, type: 'image/jpeg' } as any);
            }
            if (isEdit) return orderService.update(order!.id, formData);
            return orderService.create(dayId, formData);
        },
        onSuccess: (res) => {
            if (res.data.success) {
                queryClient.invalidateQueries({ queryKey: ['orders', dayId] });
                Alert.alert('Éxito', isEdit ? 'Orden actualizada' : `Orden creada (ID: ${res.data.data?.id})`, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', res.data.message);
            }
        },
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al guardar'),
    });

    const pickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Error', 'Se necesita permiso para acceder a fotos'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.3,      // compress to ~30%
            base64: false,
            exif: false,
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (!result.canceled && result.assets[0]) {
            setNewPhotoUri(result.assets[0].uri);
            setPhotoUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Error', 'Se necesita permiso para la cámara'); return; }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.3,
            base64: false,
            exif: false,
            allowsEditing: true,
            aspect: [4, 3],
        });
        if (!result.canceled && result.assets[0]) {
            setNewPhotoUri(result.assets[0].uri);
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!nombrePersona.trim()) { Alert.alert('Error', 'El nombre de persona es requerido'); return; }
        if (usuarioAsignadoFuturo.trim() && !/^TDJ\d+$/.test(usuarioAsignadoFuturo.trim())) {
            Alert.alert('Formato inválido', 'El código debe comenzar con TDJ seguido solo de números.\nEjemplo: TDJ0001');
            return;
        }
        mutation.mutate();
    };

    const selectedSocial = RED_SOCIAL_OPTIONS.find(o => o.value === redSocial)?.label;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                <View style={styles.section}>
                    <Text style={styles.label}>Nombre Persona *</Text>
                    <TextInput style={styles.input} value={nombrePersona} onChangeText={setNombrePersona} placeholder="Nombre completo" />

                    <Text style={styles.label}>Producto</Text>
                    <TextInput style={styles.input} value={producto} onChangeText={setProducto} placeholder="Nombre del producto" />

                    <Text style={styles.label}>Descripción</Text>
                    <TextInput style={[styles.input, { height: 80 }]} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción adicional" multiline />

                    <Text style={styles.label}>Red Social</Text>
                    <View style={styles.socialSelector}>
                        {RED_SOCIAL_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[styles.socialChip, redSocial === opt.value && styles.socialChipActive]}
                                onPress={() => setRedSocial(opt.value)}>
                                <Text style={[styles.socialChipText, redSocial === opt.value && styles.socialChipTextActive]}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Usuario @{selectedSocial}</Text>
                    <TextInput style={styles.input} value={usuarioRedSocial} onChangeText={setUsuarioRedSocial} placeholder="@usuario" autoCapitalize="none" />

                    <Text style={styles.label}>Código TDJ (Opcional)</Text>
                    <TextInput
                        style={[styles.input, usuarioAsignadoFuturo && !/^TDJ\d+$/.test(usuarioAsignadoFuturo) ? styles.inputError : {}]}
                        value={usuarioAsignadoFuturo}
                        onChangeText={t => setUsuarioAsignadoFuturo(t.toUpperCase())}
                        placeholder="TDJ0001"
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                    {usuarioAsignadoFuturo !== '' && !/^TDJ\d+$/.test(usuarioAsignadoFuturo) && (
                        <Text style={styles.fieldError}>Formato: TDJ seguido de números (ej. TDJ0001)</Text>
                    )}

                    <Text style={styles.label}>Foto</Text>
                    {photoUri && <Image source={{ uri: photoUri }} style={styles.photoPreview} />}
                    <View style={styles.photoButtons}>
                        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}><Text style={styles.photoBtnText}>🖼️ Galería</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}><Text style={styles.photoBtnText}>📷 Cámara</Text></TouchableOpacity>
                    </View>
                    <Text style={styles.photoHint}>La foto se guarda en baja resolución (quality: 30%)</Text>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={mutation.isPending}>
                        {mutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Actualizar Orden' : 'Crear Orden'}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6ff' },
    section: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
    socialSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    socialChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f5f5f5' },
    socialChipActive: { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
    socialChipText: { fontSize: 13, color: '#555' },
    socialChipTextActive: { color: '#fff', fontWeight: 'bold' },
    photoPreview: { width: '100%', height: 180, borderRadius: 10, marginVertical: 8, resizeMode: 'cover' },
    photoButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
    photoBtn: { flex: 1, borderWidth: 1, borderColor: '#6C47FF', borderRadius: 10, padding: 12, alignItems: 'center' },
    photoBtnText: { color: '#6C47FF', fontSize: 14, fontWeight: '600' },
    photoHint: { fontSize: 11, color: '#aaa', marginTop: 4, marginBottom: 4 },
    saveBtn: { marginTop: 24, backgroundColor: '#6C47FF', borderRadius: 12, padding: 16, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    inputError: { borderColor: '#e53935' },
    fieldError: { fontSize: 11, color: '#e53935', marginTop: 4 },
});
