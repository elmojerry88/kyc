import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { KycSubmissionSchema } from '@kyc/shared';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function FormScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numeroBi, setNumeroBi] = useState('');
  const [nif, setNif] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDataNascimento(`${day}/${month}/${year}`);
    }
  };
  const handleNext = () => {
    const data = { nome, data_nascimento: dataNascimento, numero_bi: numeroBi, nif };
    const result = KycSubmissionSchema.safeParse(data);
    
    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => e.message).join('\\n');
      Alert.alert('Dados Inválidos', errorMsg);
      return;
    }

    router.push({
      pathname: '/bi-frente',
      params: { kycData: JSON.stringify(data) }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dados Pessoais</Text>
      
      <Text style={styles.label}>Nome Completo</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: João da Silva" />

      <Text style={styles.label}>Data de Nascimento (DD/MM/AAAA)</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <View pointerEvents="none">
          <TextInput style={styles.input} value={dataNascimento} placeholder="Ex: 01/01/1990" editable={false} />
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Número do BI</Text>
      <TextInput style={styles.input} value={numeroBi} onChangeText={setNumeroBi} placeholder="Ex: 123456789LA012" autoCapitalize="characters" />

      <Text style={styles.label}>NIF</Text>
      <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="Ex: 1234567890" keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Próximo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
