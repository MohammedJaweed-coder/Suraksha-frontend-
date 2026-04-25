import api from './api';
import type {
  ApiResponse,
  AuthenticationOptionsResponse,
  RegistrationOptionsResponse,
  WebAuthnAssertion,
  WebAuthnCredential
} from '../types';

export async function login(email: string, password: string, deviceId: string): Promise<{ token: string }> {
  const payload = { email, password, deviceId };

  try {
    const { data } = await api.post<ApiResponse<{ token: string }>>('/auth/login', payload);
    return data.data;
  } catch (error: any) {
    if (error.response?.status === 415) {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('deviceId', deviceId);

      const { data } = await api.post<ApiResponse<{ token: string }>>('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return data.data;
    }

    throw error;
  }
}

export async function generateRegistrationOptions(deviceId: string): Promise<RegistrationOptionsResponse> {
  const { data } = await api.post<ApiResponse<RegistrationOptionsResponse>>('/auth/webauthn/register/options', { deviceId });
  return data.data;
}

export async function verifyRegistration(credential: WebAuthnCredential): Promise<{ token: string }> {
  const { data } = await api.post<ApiResponse<{ token: string }>>('/auth/webauthn/register/verify', credential);
  return data.data;
}

export async function generateAuthenticationOptions(deviceId: string): Promise<AuthenticationOptionsResponse> {
  const { data } = await api.post<ApiResponse<AuthenticationOptionsResponse>>('/auth/webauthn/authenticate/options', { deviceId });
  return data.data;
}

export async function verifyAuthentication(assertion: WebAuthnAssertion): Promise<{ token: string; requiresRegistration?: boolean }> {
  const { data } = await api.post<ApiResponse<{ token: string; requiresRegistration?: boolean }>>(
    '/auth/webauthn/authenticate/verify',
    assertion
  );
  return data.data;
}
