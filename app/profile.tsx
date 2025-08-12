import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

type User = {
  name?: string;
  email?: string;
  sub?: string;
  profilePictureUrl?: string;
  email_verified?: boolean;
};

function decodeJwt(token: string): User | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(Array.from(json).map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')));
  } catch {
    return null;
  }
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const baseUrl = Constants.expoConfig?.extra?.fronteggBaseUrl as string;
  const clientId = Constants.expoConfig?.extra?.fronteggClientId as string;
  const logoutRedirect = (Constants.expoConfig?.extra as any)?.fronteggLogoutRedirectUri as string;

  const onLogout = async () => {
    const url = `${baseUrl}/oauth/logout?client_id=${clientId}&post_logout_redirect_uri=${logoutRedirect}`;
    await WebBrowser.openBrowserAsync(url);
  };

  useEffect(() => {
    (async () => {
      const idToken = await SecureStore.getItemAsync('frontegg_id_token');
      if (idToken) {
        setUser(decodeJwt(idToken));
      }
    })();
  }, []);

  if (!user) {
    return (
      <View style={styles.center}> 
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {user.profilePictureUrl ? (
          <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
        ) : null}
        <Text style={styles.name}>{user.name || 'Unknown User'}</Text>
        <Text style={styles.email}>{user.email || ''}</Text>
        <View style={styles.row}><Text style={styles.label}>User ID</Text><Text style={styles.value}>{user.sub}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Email Verified</Text><Text style={styles.value}>{user.email_verified ? 'Yes' : 'No'}</Text></View>
      </View>
      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flexGrow: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20, paddingBottom: 60 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3, alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16, borderWidth: 2, borderColor: '#007AFF' },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  email: { fontSize: 16, color: '#666', marginBottom: 20 },
  row: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  label: { color: '#555', fontWeight: '600' },
  value: { color: '#111', fontWeight: '600' },
  button: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, width: '100%', alignItems: 'center' },
  secondary: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontWeight: '700' }
});


