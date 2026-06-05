import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface DocumentPickerProps {
  title: string;
  imageUri: string | null;
  onImageSelected: (uri: string, name: string, type: string) => void;
}

export const DocumentPicker: React.FC<DocumentPickerProps> = ({ title, imageUri, onImageSelected }) => {
  const handleProcessImage = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    
    try {
      const compressedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      const fileName = asset.fileName || compressedImage.uri.split('/').pop() || 'document.jpg';
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
      quality: 1,
    });
    handleProcessImage(result);
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("É necessária a permissão da galeria!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
          <Text style={styles.placeholderText}>Nenhuma imagem seleccionada</Text>
        </View>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Tirar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openGallery}>
          <Text style={styles.buttonText}>Escolher Galeria</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10, resizeMode: 'cover' },
  placeholder: { width: '100%', height: 150, backgroundColor: '#e0e0e0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  placeholderText: { color: '#757575' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
