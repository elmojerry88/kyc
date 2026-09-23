import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffffff',
          },
          headerTintColor: '#000000ff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Página inicial' }} />
        <Stack.Screen name="form" options={{ title: 'Dados Pessoais' }} />
        <Stack.Screen name="bi-frente" options={{ title: 'Frente do BI' }} />
        <Stack.Screen name="bi-verso" options={{ title: 'Verso do BI' }} />
        <Stack.Screen name="selfie" options={{ title: 'Selfie' }} />
        <Stack.Screen name="confirm" options={{ title: 'Revisão e Envio' }} />
        <Stack.Screen name="result" options={{ title: 'Resultado', headerBackVisible: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
