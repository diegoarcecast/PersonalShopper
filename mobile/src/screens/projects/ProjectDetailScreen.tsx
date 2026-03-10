import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList, Trip } from '../../types';
import { tripService } from '../../services/apiServices';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../services/api';

type Props = { navigation: StackNavigationProp<AppStackParamList, 'ProjectDetail'>; route: RouteProp<AppStackParamList, 'ProjectDetail'> };

export default function ProjectDetailScreen({ navigation, route }: Props) {
    const { projectId } = route.params;
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [editTrip, setEditTrip] = useState<Trip | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [exportingTripId, setExportingTripId] = useState<number | null>(null);

    const handleExportTrip = async (trip: Trip) => {
        setExportingTripId(trip.id);
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            const baseUrl = api.defaults.baseURL?.replace('/api/v1', '') || '';
            const url = `${baseUrl}/api/v1/trips/${trip.id}/export`;
            const dest = (FileSystem.cacheDirectory ?? '') + `viaje-${trip.id}.xlsx`;
            const result = await FileSystem.downloadAsync(url, dest, {
                headers: { Authorization: `Bearer ${token || ''}` },
            });
            if (result.status === 200 && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(result.uri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: `${trip.name} — Export`,
                });
            } else {
                Alert.alert('Éxito', 'Archivo generado');
            }
        } catch (e: any) {
            Alert.alert('Error', 'Error al exportar: ' + e.message);
        } finally {
            setExportingTripId(null);
        }
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['trips', projectId],
        queryFn: () => tripService.getByProject(projectId).then(r => r.data.data),
    });

    const createMutation = useMutation({
        mutationFn: (d: any) => tripService.create(projectId, d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips', projectId] }); closeModal(); },
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al crear'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => tripService.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips', projectId] }); closeModal(); },
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al actualizar'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => tripService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', projectId] }),
    });

    const openCreate = () => { setEditTrip(null); setName(''); setDescription(''); setModalVisible(true); };
    const openEdit = (t: Trip) => { setEditTrip(t); setName(t.name); setDescription(t.description || ''); setModalVisible(true); };
    const closeModal = () => { setModalVisible(false); setEditTrip(null); };
    const handleSave = () => {
        if (!name.trim()) { Alert.alert('Error', 'El nombre es requerido'); return; }
        if (editTrip) updateMutation.mutate({ id: editTrip.id, data: { name: name.trim(), description: description.trim() || undefined } });
        else createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
    };
    const handleDelete = (t: Trip) => Alert.alert('Eliminar', `¿Eliminar "${t.name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(t.id) },
    ]);

    const trips = data?.items || [];

    return (
        <View style={styles.container}>
            {isLoading ? <ActivityIndicator size="large" color="#6C47FF" style={{ marginTop: 40 }} /> :
                trips.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Sin viajes</Text>
                        <Text style={styles.emptySubtext}>Toca + para agregar un viaje</Text>
                    </View>
                ) : (
                    <FlatList data={trips} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TripDetail', { tripId: item.id, tripName: item.name })}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                {item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
                                <Text style={styles.cardMeta}>{item.dayCount} día{item.dayCount !== 1 ? 's' : ''}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity onPress={() => openEdit(item)}><Text style={{ fontSize: 18 }}>✏️</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleExportTrip(item)}>
                                    {exportingTripId === item.id ? <ActivityIndicator size="small" color="#6C47FF" /> : <Text style={{ fontSize: 18 }}>📊</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item)}><Text style={{ fontSize: 18 }}>🗑️</Text></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )} />
                )}
            <TouchableOpacity style={styles.fab} onPress={openCreate}><Text style={styles.fabText}>＋</Text></TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{editTrip ? 'Editar Viaje' : 'Nuevo Viaje'}</Text>
                        <TextInput style={styles.modalInput} placeholder="Nombre *" value={name} onChangeText={setName} />
                        <TextInput style={[styles.modalInput, { height: 80 }]} placeholder="Descripción" value={description} onChangeText={setDescription} multiline />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}><Text>Cancelar</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                {createMutation.isPending || updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6ff' },
    card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 16, elevation: 2, alignItems: 'center' },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#222' },
    cardDesc: { fontSize: 13, color: '#666', marginTop: 2 },
    cardMeta: { fontSize: 12, color: '#6C47FF', marginTop: 6, fontWeight: '600' },
    cardActions: { flexDirection: 'row', gap: 10 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, color: '#333', fontWeight: '600' },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
    fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#6C47FF', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
    modalOverlay: { flex: 1, backgroundColor: '#0006', justifyContent: 'center', padding: 24 },
    modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#222' },
    modalInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#6C47FF', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
