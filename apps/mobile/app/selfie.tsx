import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraCapture } from '../src/components/CameraCapture';

export default function SelfieScreen() {
  const router = useRouter();
  const { kycData, biFrente, biVerso } = useLocalSearchParams();
  const [selfie, setSelfie] = useState<any>(null);

  const handleImageSelected = (uri: string, name: string, type: string) => {
    setSelfie({ uri, name, type });
  };

  const handleNext = () => {
    if (!selfie) return;
    router.push({
      pathname: '/confirm',
      params: { 
        kycData: kycData as string, 
        biFrente: biFrente as string,
        biVerso: biVerso as string,
        selfie: JSON.stringify(selfie)
      }
    });
  };

  return (
    <View style={styles.container}>
      <CameraCapture 
        title="Fotografia de Rosto (Selfie)" 
        imageUri={selfie?.uri} 
        onImageSelected={handleImageSelected} 
      />
      <TouchableOpacity 
        style={[styles.button, !selfie && styles.buttonDisabled]} 
        onPress={handleNext} 
        disabled={!selfie}
      >
        <Text style={styles.buttonText}>Avançar para Revisão</Text>
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
