import { useCallback, useState } from 'react';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthentication,
  verifyRegistration
} from '../lib/auth.api';
import type {
  AuthenticationOptionsResponse,
  RegistrationOptionsResponse,
  WebAuthnAssertion,
  WebAuthnCredential
} from '../types';

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = window.atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) {
    return '';
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function mapRegistrationOptions(options: RegistrationOptionsResponse): CredentialCreationOptions {
  return {
    publicKey: {
      ...options,
      challenge: base64UrlToBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64UrlToBuffer(options.user.id)
      },
      excludeCredentials: options.excludeCredentials?.map((credential) => ({
        ...credential,
        id: base64UrlToBuffer(credential.id)
      }))
    }
  };
}

function mapAuthenticationOptions(options: AuthenticationOptionsResponse): CredentialRequestOptions {
  return {
    publicKey: {
      ...options,
      challenge: base64UrlToBuffer(options.challenge),
      allowCredentials: options.allowCredentials?.map((credential) => ({
        ...credential,
        id: base64UrlToBuffer(credential.id)
      }))
    }
  };
}

function serializeRegistrationCredential(credential: PublicKeyCredential): WebAuthnCredential {
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports: response.getTransports?.() ?? []
    },
    clientExtensionResults: credential.getClientExtensionResults()
  };
}

function serializeAssertionCredential(credential: PublicKeyCredential): WebAuthnAssertion {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null
    },
    clientExtensionResults: credential.getClientExtensionResults()
  };
}

export function useWebAuthn(): {
  register: (deviceId: string) => Promise<string>;
  authenticate: (deviceId: string) => Promise<{ token: string; requiresRegistration?: boolean }>;
  isLoading: boolean;
  error: string | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const options = await generateRegistrationOptions(deviceId);
      const credential = (await navigator.credentials.create(
        mapRegistrationOptions(options)
      )) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('Registration failed');
      }

      const verification = await verifyRegistration(serializeRegistrationCredential(credential));
      return verification.token;
    } catch {
      setError('Biometric login failed. Try again.');
      throw new Error('Biometric login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const options = await generateAuthenticationOptions(deviceId);
      const credential = (await navigator.credentials.get(
        mapAuthenticationOptions(options)
      )) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('Authentication failed');
      }

      return await verifyAuthentication(serializeAssertionCredential(credential));
    } catch {
      setError('Biometric login failed. Try again.');
      throw new Error('Biometric login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    register,
    authenticate,
    isLoading,
    error
  };
}
