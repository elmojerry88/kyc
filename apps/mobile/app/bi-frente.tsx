import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DocumentPicker } from '../src/components/DocumentPicker';

export default function BiFrenteScreen() {
  const router = useRouter();
  const { kycData } = useLocalSearchParams();
  const [biFrente, setBiFrente] = useState<any>(null);

  const handleImageSelected = (uri: string, name: string, type: string) => {
    setBiFrente({ uri, name, type });
  };

  const handleNext = () => {
    if (!biFrente) return;
    router.push({
      pathname: '/bi-verso',
      params: { 
        kycData: kycData as string, 
        biFrente: JSON.stringify(biFrente) 
      }
    });
  };

  return (
    <View style={styles.container}>
      <DocumentPicker 
        title="Frente do Bilhete de Identidade" 
        imageUri={biFrente?.uri} 
        onImageSelected={handleImageSelected} 
      />
      <TouchableOpacity 
        style={[styles.button, !biFrente && styles.buttonDisabled]} 
        onPress={handleNext} 
        disabled={!biFrente}
      >
        <Text style={styles.buttonText}>Próximo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
