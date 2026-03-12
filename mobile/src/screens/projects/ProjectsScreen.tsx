import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, Project } from '../../types';
import { projectService } from '../../services/apiServices';
import { useAuthStore } from '../../store/authStore';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../services/api';

type Props = { navigation: StackNavigationProp<AppStackParamList, 'Projects'> };

export default function ProjectsScreen({ navigation }: Props) {
    const queryClient = useQueryClient();
    const { logout } = useAuthStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [exportingId, setExportingId] = useState<number | null>(null);

    const handleExportProject = async (project: Project) => {
        setExportingId(project.id);
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            const baseUrl = api.defaults.baseURL?.replace('/api/v1', '') || '';
            const url = `${baseUrl}/api/v1/projects/${project.id}/export`;
            const destFile = new File(Paths.cache, `proyecto-${project.id}.xlsx`);
            const file = await File.downloadFileAsync(url, destFile, {
                headers: { Authorization: `Bearer ${token || ''}` },
                idempotent: true,
            });
            const uri = file.uri;
            if (uri && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: `${project.name} Export`,
                });
            } else {
                Alert.alert('Exito', 'Archivo generado');
            }
        } catch (e: any) {
            Alert.alert('Error', 'Error al exportar: ' + e.message);
        } finally {
            setExportingId(null);
        }
    };

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.getAll().then(r => r.data.data),
    });

    const createMutation = useMutation({
        mutationFn: (d: { name: string; description?: string }) => projectService.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); closeModal(); },
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al crear'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => projectService.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); closeModal(); },
        onError: (e: any) => Alert.alert('Error', e.response?.data?.message || 'Error al actualizar'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => projectService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    });

    const openCreate = () => { setEditProject(null); setName(''); setDescription(''); setModalVisible(true); };
    const openEdit = (p: Project) => { setEditProject(p); setName(p.name); setDescription(p.description || ''); setModalVisible(true); };
    const closeModal = () => { setModalVisible(false); setEditProject(null); };

    const handleSave = () => {
        if (!name.trim()) { Alert.alert('Error', 'El nombre es requerido'); return; }
        if (editProject) updateMutation.mutate({ id: editProject.id, data: { name: name.trim(), description: description.trim() || undefined } });
        else createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
    };

    const handleDelete = (p: Project) => {
        Alert.alert('Eliminar', `¿Eliminar "${p.name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(p.id) },
        ]);
    };

    const projects = data?.items || [];

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#6C47FF" style={{ marginTop: 40 }} />
            ) : projects.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No hay proyectos aún</Text>
                    <Text style={styles.emptySubtext}>Toca + para crear tu primer proyecto</Text>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    keyExtractor={i => i.id.toString()}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id, projectName: item.name })}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                {item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
                                <Text style={styles.cardMeta}>{item.tripCount} viaje{item.tripCount !== 1 ? 's' : ''}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}><Text style={styles.editBtnText}>✏️</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleExportProject(item)} style={styles.editBtn}>
                                    {exportingId === item.id ? <ActivityIndicator size="small" color="#6C47FF" /> : <Text style={styles.editBtnText}>📊</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}><Text style={styles.deleteBtnText}>🗑️</Text></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
            <View style={styles.fab}>
                <TouchableOpacity style={styles.fabBtn} onPress={openCreate}><Text style={styles.fabText}>＋</Text></TouchableOpacity>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutText}>Salir</Text></TouchableOpacity>
            </View>
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{editProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</Text>
                        <TextInput style={styles.modalInput} placeholder="Nombre *" value={name} onChangeText={setName} />
                        <TextInput style={[styles.modalInput, { height: 80 }]} placeholder="Descripción (opcional)" value={description} onChangeText={setDescription} multiline />
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
    cardActions: { flexDirection: 'row', gap: 8 },
    editBtn: { padding: 6 },
    editBtnText: { fontSize: 18 },
    deleteBtn: { padding: 6 },
    deleteBtnText: { fontSize: 18 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
    emptyText: { fontSize: 18, color: '#333', fontWeight: '600' },
    emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 },
    fab: { position: 'absolute', bottom: 24, right: 16, alignItems: 'flex-end', gap: 8 },
    fabBtn: { backgroundColor: '#6C47FF', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
    logoutBtn: { backgroundColor: '#ff4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, elevation: 2 },
    logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: '#0006', justifyContent: 'center', padding: 24 },
    modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#222' },
    modalInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
    cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#6C47FF', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: 'bold' },
});

