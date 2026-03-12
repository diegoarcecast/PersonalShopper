import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, RefreshControl, Switch } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { AppStackParamList, Order } from '../../types';
import { orderService } from '../../services/apiServices';
import { api } from '../../services/api';

type Props = { navigation: StackNavigationProp<AppStackParamList, 'DayDetail'>; route: RouteProp<AppStackParamList, 'DayDetail'> };

export default function DayDetailScreen({ navigation, route }: Props) {
    const { dayId, dayNumber } = route.params;
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [conTdj, setConTdj] = useState<boolean | null>(null); // null=todos, true=con TDJ, false=sin TDJ
    const [exporting, setExporting] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['orders', dayId, search, conTdj],
        queryFn: () => orderService.getByDay(dayId, 1, 50, search || undefined, conTdj).then(r => r.data.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => orderService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders', dayId] }),
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al eliminar'),
    });

    const handleDelete = (o: Order) => Alert.alert('Eliminar', `¿Eliminar orden de "${o.nombrePersona}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(o.id) },
    ]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            const baseUrl = api.defaults.baseURL?.replace('/api/v1', '') || '';
            const url = `${baseUrl}/api/v1/days/${dayId}/orders/export`;
            const destFile = new File(Paths.cache, `ordenes-dia-${dayId}.xlsx`);
            const file = await File.downloadFileAsync(url, destFile, {
                headers: { Authorization: `Bearer ${token || ''}` },
                idempotent: true,
            });
            const uri = file.uri;
            if (uri && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: `Ordenes Dia #${dayNumber}`,
                });
            } else {
                Alert.alert('Exito', `Archivo del dia #${dayNumber} guardado`);
            }
        } catch (e: any) {
            Alert.alert('Error', 'Error al exportar: ' + e.message);
        } finally {
            setExporting(false);
        }
    };

    const orders = data?.items || [];

    return (
        <View style={styles.container}>
            {/* Search + Export row */}
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Buscar por nombre o producto..."
                    value={search}
                    onChangeText={setSearch}
                    clearButtonMode="while-editing"
                />
                <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting}>
                    {exporting ? <ActivityIndicator color="#6C47FF" size="small" /> : <Text style={styles.exportBtnText}>📊 Excel</Text>}
                </TouchableOpacity>
            </View>
            {/* TDJ filter toggle */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterChip, conTdj === null && styles.filterChipActive]}
                    onPress={() => setConTdj(null)}>
                    <Text style={[styles.filterChipText, conTdj === null && styles.filterChipTextActive]}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterChip, conTdj === true && styles.filterChipActive]}
                    onPress={() => setConTdj(true)}>
                    <Text style={[styles.filterChipText, conTdj === true && styles.filterChipTextActive]}>✅ Con TDJ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterChip, conTdj === false && styles.filterChipActive, conTdj === false && styles.filterChipSin]}
                    onPress={() => setConTdj(false)}>
                    <Text style={[styles.filterChipText, conTdj === false && styles.filterChipTextActive]}>❌ Sin TDJ</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? <ActivityIndicator size="large" color="#6C47FF" style={{ marginTop: 40 }} /> :
                orders.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{search ? 'Sin resultados' : 'Sin órdenes'}</Text>
                        <Text style={styles.emptySubtext}>{search ? 'Intenta otra búsqueda' : 'Toca + para crear una orden'}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        keyExtractor={i => i.id.toString()}
                        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderForm', { dayId, order: item })}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderId}>#{item.id}</Text>
                                    <View style={[styles.socialBadge, { backgroundColor: getSocialColor(item.redSocial) }]}>
                                        <Text style={styles.socialBadgeText}>{item.redSocial}</Text>
                                    </View>
                                </View>
                                <Text style={styles.nombrePersona}>{item.nombrePersona}</Text>
                                {item.producto && <Text style={styles.cardDetail}>📦 {item.producto}</Text>}
                                {item.usuarioRedSocial && <Text style={styles.cardDetail}>@{item.usuarioRedSocial}</Text>}
                                <View style={styles.cardActions}>
                                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                                        <Text style={styles.deleteBtnText}>🗑️ Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('OrderForm', { dayId })}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
        </View>
    );
}

function getSocialColor(red: string) {
    const map: Record<string, string> = { TikTok: '#000', Instagram: '#E1306C', WhatsApp: '#25D366', Facebook: '#1877F2', Otro: '#888' };
    return map[red] || '#888';
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6ff' },
    searchRow: { flexDirection: 'row', margin: 12, gap: 8, alignItems: 'center' },
    searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#e0e0e0' },
    exportBtn: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#6C47FF' },
    exportBtnText: { color: '#6C47FF', fontWeight: 'bold', fontSize: 13 },
    card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 14, padding: 16, elevation: 2 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    orderId: { fontSize: 12, color: '#999', fontWeight: '600' },
    socialBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    socialBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    nombrePersona: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    cardDetail: { fontSize: 13, color: '#555', marginTop: 2 },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    deleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff0f0', borderWidth: 1, borderColor: '#ffcccc' },
    deleteBtnText: { color: '#e44', fontSize: 13 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, color: '#333', fontWeight: '600' },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
    fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#6C47FF', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
    filterRow: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f5f5f5' },
    filterChipActive: { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
    filterChipSin: { backgroundColor: '#e53935', borderColor: '#e53935' },
    filterChipText: { fontSize: 13, color: '#555', fontWeight: '600' },
    filterChipTextActive: { color: '#fff' },
});

