import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList, Day } from '../../types';
import { dayService } from '../../services/apiServices';

type Props = { navigation: StackNavigationProp<AppStackParamList, 'TripDetail'>; route: RouteProp<AppStackParamList, 'TripDetail'> };

export default function TripDetailScreen({ navigation, route }: Props) {
    const { tripId } = route.params;
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [editDay, setEditDay] = useState<Day | null>(null);
    const [dayNumber, setDayNumber] = useState('');
    const [notes, setNotes] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['days', tripId],
        queryFn: () => dayService.getByTrip(tripId).then(r => r.data.data),
    });

    const createMutation = useMutation({
        mutationFn: (d: any) => dayService.create(tripId, d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['days', tripId] }); closeModal(); },
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al crear'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => dayService.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['days', tripId] }); closeModal(); },
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al actualizar'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => dayService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['days', tripId] }),
    });

    const openCreate = () => { setEditDay(null); setDayNumber(''); setNotes(''); setModalVisible(true); };
    const openEdit = (d: Day) => { setEditDay(d); setDayNumber(d.dayNumber.toString()); setNotes(d.notes || ''); setModalVisible(true); };
    const closeModal = () => { setModalVisible(false); setEditDay(null); };
    const handleSave = () => {
        const num = parseInt(dayNumber);
        if (isNaN(num) || num < 1) { Alert.alert('Error', 'El número de día debe ser mayor a 0'); return; }
        if (editDay) updateMutation.mutate({ id: editDay.id, data: { dayNumber: num, notes: notes.trim() || undefined } });
        else createMutation.mutate({ dayNumber: num, notes: notes.trim() || undefined });
    };
    const handleDelete = (d: Day) => Alert.alert('Eliminar', `¿Eliminar Día #${d.dayNumber}?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(d.id) },
    ]);

    const days = data?.items || [];

    return (
        <View style={styles.container}>
            {isLoading ? <ActivityIndicator size="large" color="#6C47FF" style={{ marginTop: 40 }} /> :
                days.length === 0 ? (
                    <View style={styles.empty}><Text style={styles.emptyText}>Sin días</Text><Text style={styles.emptySubtext}>Toca + para agregar un día</Text></View>
                ) : (
                    <FlatList data={days} keyExtractor={i => i.id.toString()} renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DayDetail', { dayId: item.id, dayNumber: item.dayNumber })}>
                            <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>#{item.dayNumber}</Text></View>
                            <View style={styles.cardContent}>
                                {item.notes && <Text style={styles.cardDesc}>{item.notes}</Text>}
                                <Text style={styles.cardMeta}>{item.orderCount} orden{item.orderCount !== 1 ? 'es' : ''}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity onPress={() => openEdit(item)}><Text style={{ fontSize: 18 }}>✏️</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item)}><Text style={{ fontSize: 18 }}>🗑️</Text></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )} />
                )}
            <TouchableOpacity style={styles.fab} onPress={openCreate}><Text style={styles.fabText}>＋</Text></TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{editDay ? 'Editar Día' : 'Nuevo Día'}</Text>
                        <TextInput style={styles.modalInput} placeholder="Número de día *" keyboardType="numeric" value={dayNumber} onChangeText={setDayNumber} />
                        <TextInput style={[styles.modalInput, { height: 80 }]} placeholder="Notas (opcional)" value={notes} onChangeText={setNotes} multiline />
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
    card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 16, elevation: 2, alignItems: 'center', gap: 12 },
    dayBadge: { backgroundColor: '#6C47FF', width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
    dayBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    cardContent: { flex: 1 },
    cardDesc: { fontSize: 13, color: '#555' },
    cardMeta: { fontSize: 12, color: '#6C47FF', fontWeight: '600', marginTop: 4 },
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
