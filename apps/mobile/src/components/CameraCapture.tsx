import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface CameraCaptureProps {
  title: string;
  imageUri: string | null;
  onImageSelected: (uri: string, name: string, type: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ title, imageUri, onImageSelected }) => {
  const handleProcessImage = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    
    try {
      const compressedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      const fileName = asset.fileName || compressedImage.uri.split('/').pop() || 'selfie.jpg';
      onImageSelected(
        compressedImage.uri, 
        fileName, 
        'image/jpeg'
      );
    } catch (err) {
      console.error('Compression error:', err);
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("É necessária a permissão da câmara!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      cameraType: ImagePicker.CameraType.front,
      quality: 1,
    });
    handleProcessImage(result);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Necessário tirar foto agora</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={openCamera}>
        <Text style={styles.buttonText}>Capturar Selfie (Câmara Frontal)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10, padding: 15, backgroundColor: '#fff3e0', borderRadius: 8, borderWidth: 1, borderColor: '#ffb74d' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#e65100' },
  preview: { width: '100%', height: 300, borderRadius: 8, marginBottom: 10, resizeMode: 'cover' },
  placeholder: { width: '100%', height: 150, backgroundColor: '#ffe0b2', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  placeholderText: { color: '#e65100' },
  button: { backgroundColor: '#f57c00', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
