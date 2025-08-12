import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

const cfg = {
  baseUrl: Constants.expoConfig?.extra?.fronteggBaseUrl || '',
  clientId: Constants.expoConfig?.extra?.fronteggClientId || '',
  redirectUri: Constants.expoConfig?.extra?.fronteggRedirectUri || '',
  logoutRedirectUri: Constants.expoConfig?.extra?.fronteggLogoutRedirectUri || '',
};

export default function TabOneScreen() {
  const onLogin = async () => {
    const scope = 'openid profile email';
    const state = Math.random().toString(36).slice(2);
    const url = `${cfg.baseUrl}/oauth/authorize?client_id=${cfg.clientId}&redirect_uri=${cfg.redirectUri}&response_type=code&scope=${scope.replace(/ /g, '%20')}&state=${state}`;
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Frontegg React Native Demo</Text>
      <Text style={styles.subtitle}>Authenticate with Frontegg using a deep-link OAuth flow and view your profile.</Text>
      <View style={styles.separator} />
      <TouchableOpacity style={[styles.button, styles.primary]} onPress={onLogin}>
        <Text style={styles.buttonText}>Login with Frontegg</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About this app</Text>
        <Text style={styles.paragraph}>This sample opens the hosted login, handles the callback via a custom URL scheme, exchanges the authorization code for tokens, and shows a profile screen.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Frontegg setup (iOS)</Text>
        <Text style={styles.bullet}>• Add these redirect URIs in your Frontegg OAuth app:</Text>
        <Text style={styles.code}>- {cfg.redirectUri}</Text>
        <Text style={styles.code}>- {cfg.logoutRedirectUri}</Text>
        <Text style={styles.bullet}>• Ensure the app scheme is <Text style={styles.codeInline}>fronteggreactnativedemo</Text></Text>
        <Text style={styles.bullet}>• Config values are in <Text style={styles.codeInline}>app.json → expo.extra</Text>:</Text>
        <Text style={styles.code}>- fronteggBaseUrl: {cfg.baseUrl}</Text>
        <Text style={styles.code}>- fronteggClientId: {cfg.clientId}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: { marginTop: 10, color: '#555', textAlign: 'center' },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '90%',
    backgroundColor: '#eee'
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 8,
    width: '90%',
    alignItems: 'center'
  },
  primary: { backgroundColor: '#007AFF' },
  buttonText: { color: '#fff', fontWeight: '700' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  paragraph: { color: '#444', lineHeight: 20 },
  bullet: { color: '#444', marginTop: 6 },
  code: { fontFamily: 'Courier', color: '#111', marginLeft: 10, marginTop: 4 },
  codeInline: { fontFamily: 'Courier', color: '#111' }
});
