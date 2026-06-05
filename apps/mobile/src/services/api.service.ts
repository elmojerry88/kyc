import axios from 'axios';

// Em desenvolvimento (Android Emulator) usa 10.0.2.2.
// Para iOS, usa localhost (127.0.0.1) ou o IP local da máquina.
const API_BASE_URL = 'http://10.0.2.2:3000';

export const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // Processamento KYC demora > 30s
});

export interface KycSubmissionResponse {
  submission_id: string;
  status: string;
  message: string;
  details: any;
}

export const submitKyc = async (formData: FormData): Promise<KycSubmissionResponse> => {
  const response = await apiService.post('/kyc/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
