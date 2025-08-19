import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const cfg = {
  baseUrl: Constants.expoConfig?.extra?.fronteggBaseUrl || '',
  clientId: Constants.expoConfig?.extra?.fronteggClientId || '',
  redirectUri: Constants.expoConfig?.extra?.fronteggRedirectUri || '',
};

export default function Callback() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    const run = async () => {
      if (Platform.OS !== 'web') {
        WebBrowser.dismissBrowser();
      }
      if (!code) {
        router.replace('/');
        return;
      }
      try {
        // Get code_verifier from appropriate storage based on platform
        let codeVerifier = '';
        if (Platform.OS === 'web') {
          codeVerifier = localStorage.getItem('pkce_code_verifier') || '';
        } else {
          codeVerifier = await SecureStore.getItemAsync('pkce_code_verifier') || '';
        }
        
        console.log('Token exchange - code:', code);
        console.log('Token exchange - code_verifier length:', codeVerifier.length);
        
        const resp = await fetch(`${cfg.baseUrl}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: cfg.clientId,
            code,
            redirect_uri: Platform.OS === 'web' ? `${window.location.origin}/callback` : cfg.redirectUri,
            code_verifier: codeVerifier,
          }).toString(),
        });
        
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('Token exchange failed:', resp.status, errorText);
          router.replace('/');
          return;
        }
        
        const data = await resp.json();
        console.log('Token exchange successful, storing tokens...');
        
        if (Platform.OS === 'web') {
          if (data.access_token) localStorage.setItem('frontegg_access_token', data.access_token);
          if (data.refresh_token) localStorage.setItem('frontegg_refresh_token', data.refresh_token);
          if (data.id_token) localStorage.setItem('frontegg_id_token', data.id_token);
          localStorage.removeItem('pkce_code_verifier');
          console.log('Tokens stored in localStorage');
        } else {
          if (data.access_token) await SecureStore.setItemAsync('frontegg_access_token', data.access_token);
          if (data.refresh_token) await SecureStore.setItemAsync('frontegg_refresh_token', data.refresh_token);
          if (data.id_token) await SecureStore.setItemAsync('frontegg_id_token', data.id_token);
          await SecureStore.deleteItemAsync('pkce_code_verifier');
        }
      } catch (error) {
        console.error('Token exchange error:', error);
        setTimeout(() => {
          try {
            router.replace('/');
          } catch (navError) {
            console.error('Navigation error:', navError);
            if (Platform.OS === 'web') {
              window.location.href = '/';
            }
          }
        }, 100);
        return;
      }
      
      // Add a small delay to ensure the layout is mounted before navigation
      setTimeout(() => {
        try {
          router.replace('/profile');
        } catch (error) {
          console.error('Navigation error:', error);
          if (Platform.OS === 'web') {
            window.location.href = '/profile';
          }
        }
      }, 100);
    };
    run();
  }, [code, router]);

  return null;
}


