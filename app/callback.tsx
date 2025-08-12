import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const cfg = {
  baseUrl: Constants.expoConfig?.extra?.fronteggBaseUrl || '',
  clientId: Constants.expoConfig?.extra?.fronteggClientId || '',
  clientSecret: Constants.expoConfig?.extra?.fronteggClientSecret || '',
  redirectUri: Constants.expoConfig?.extra?.fronteggRedirectUri || '',
};

export default function Callback() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    const run = async () => {
      WebBrowser.dismissBrowser();
      if (!code) {
        router.replace('/');
        return;
      }
      try {
        const resp = await fetch(`${cfg.baseUrl}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            code,
            redirect_uri: cfg.redirectUri,
          }).toString(),
        });
        const data = await resp.json();
        if (data.access_token) await SecureStore.setItemAsync('frontegg_access_token', data.access_token);
        if (data.refresh_token) await SecureStore.setItemAsync('frontegg_refresh_token', data.refresh_token);
        if (data.id_token) await SecureStore.setItemAsync('frontegg_id_token', data.id_token);
      } catch {}
      router.replace('/profile');
    };
    run();
  }, [code, router]);

  return null;
}


