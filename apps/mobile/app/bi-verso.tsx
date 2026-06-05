import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DocumentPicker } from '../src/components/DocumentPicker';

export default function BiVersoScreen() {
  const router = useRouter();
  const { kycData, biFrente } = useLocalSearchParams();
  const [biVerso, setBiVerso] = useState<any>(null);

  const handleImageSelected = (uri: string, name: string, type: string) => {
    setBiVerso({ uri, name, type });
  };

  const handleNext = () => {
    if (!biVerso) return;
    router.push({
      pathname: '/selfie',
      params: { 
        kycData: kycData as string, 
        biFrente: biFrente as string,
        biVerso: JSON.stringify(biVerso) 
      }
    });
  };

  return (
    <View style={styles.container}>
      <DocumentPicker 
        title="Verso do Bilhete de Identidade" 
        imageUri={biVerso?.uri} 
        onImageSelected={handleImageSelected} 
      />
      <TouchableOpacity 
        style={[styles.button, !biVerso && styles.buttonDisabled]} 
        onPress={handleNext} 
        disabled={!biVerso}
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
