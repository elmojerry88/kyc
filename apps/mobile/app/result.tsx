import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ResultScreen() {
  const router = useRouter();
  const { success, message } = useLocalSearchParams();
  const isSuccess = success === 'true';

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, isSuccess ? styles.successText : styles.errorText]}>
        {isSuccess ? '✅' : '❌'}
      </Text>
      
      <Text style={styles.title}>
        {isSuccess ? 'Validação Concluída' : 'Validação Falhou'}
      </Text>
      
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.dismissAll()}
      >
        <Text style={styles.buttonText}>Voltar ao Início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 80, marginBottom: 20 },
  successText: { color: '#28a745' },
  errorText: { color: '#dc3545' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
