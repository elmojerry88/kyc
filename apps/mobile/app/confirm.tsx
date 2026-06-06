import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { submitKyc } from '../src/services/api.service';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const kycData = useMemo(() => JSON.parse(params.kycData as string), [params.kycData]);
  const biFrente = useMemo(() => JSON.parse(params.biFrente as string), [params.biFrente]);
  const biVerso = useMemo(() => JSON.parse(params.biVerso as string), [params.biVerso]);
  const selfie = useMemo(() => JSON.parse(params.selfie as string), [params.selfie]);

  const handleSubmit = async () => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('nome', kycData.nome);
    formData.append('data_nascimento', kycData.data_nascimento);
    formData.append('nif', kycData.nif);
    
    formData.append('bi_frente', biFrente as any);
    formData.append('bi_verso', biVerso as any);
    formData.append('selfie', selfie as any);

    try {
      const response = await submitKyc(formData);
      router.push({
        pathname: '/result',
        params: { success: 'true', message: response.message }
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Erro de conexão';
      router.push({
        pathname: '/result',
        params: { success: 'false', message: errorMsg }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>A processar a validação KYC...</Text>
        <Text style={styles.loadingSubtext}>Este processo pode demorar até 40 segundos.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Revisão dos Dados</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Nome: <Text style={styles.value}>{kycData.nome}</Text></Text>
        <Text style={styles.label}>Data Nasc: <Text style={styles.value}>{kycData.data_nascimento}</Text></Text>
        <Text style={styles.label}>NIF / Nº BI: <Text style={styles.value}>{kycData.nif}</Text></Text>
      </View>

      <Text style={styles.subtitle}>Frente do BI</Text>
      <Image source={{ uri: biFrente.uri }} style={styles.imagePreview} />

      <Text style={styles.subtitle}>Verso do BI</Text>
      <Image source={{ uri: biVerso.uri }} style={styles.imagePreview} />

      <Text style={styles.subtitle}>Selfie</Text>
      <Image source={{ uri: selfie.uri }} style={styles.imagePreview} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Confirmar e Enviar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  loadingText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#333' },
  loadingSubtext: { marginTop: 10, fontSize: 14, color: '#666', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  card: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 10 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  value: { color: '#000', fontWeight: '500' },
  imagePreview: { width: '100%', height: 150, borderRadius: 8, resizeMode: 'cover', marginBottom: 10 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
