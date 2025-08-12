import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    WebBrowser.dismissBrowser();
    (async () => {
      try {
        await SecureStore.deleteItemAsync('frontegg_access_token');
        await SecureStore.deleteItemAsync('frontegg_refresh_token');
        await SecureStore.deleteItemAsync('frontegg_id_token');
      } catch {}
      router.replace('/');
    })();
  }, [router]);
  return null;
}


