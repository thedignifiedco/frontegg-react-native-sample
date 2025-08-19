import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS !== 'web') {
      WebBrowser.dismissBrowser();
    }
    (async () => {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem('frontegg_access_token');
          localStorage.removeItem('frontegg_refresh_token');
          localStorage.removeItem('frontegg_id_token');
        } else {
          await SecureStore.deleteItemAsync('frontegg_access_token');
          await SecureStore.deleteItemAsync('frontegg_refresh_token');
          await SecureStore.deleteItemAsync('frontegg_id_token');
        }
      } catch {}
      
      // Add a small delay to ensure the layout is mounted before navigation
      setTimeout(() => {
        try {
          router.replace('/');
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback: try to navigate to home page directly
          if (Platform.OS === 'web') {
            window.location.href = '/';
          }
        }
      }, 100);
    })();
  }, [router]);
  return null;
}


