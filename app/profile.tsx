import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

type User = {
  // Basic profile info
  name?: string;
  email?: string;
  sub?: string;
  profilePictureUrl?: string;
  email_verified?: boolean;
  
  // Additional profile fields
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
  
  // Timestamps
  iat?: number; // issued at
  exp?: number; // expiration
  auth_time?: number; // authentication time
  
  // Frontegg specific fields
  tenant_id?: string;
  user_id?: string;
  roles?: string[];
  permissions?: string[];
  
  // OAuth fields
  aud?: string; // audience
  iss?: string; // issuer
  azp?: string; // authorized party
  
  // Any other fields that might be present
  [key: string]: any;
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
  const logoutRedirect = Platform.OS === 'web' ? `${window.location.origin}/logout` : (Constants.expoConfig?.extra as any)?.fronteggLogoutRedirectUri as string;

  const onLogout = async () => {
    const url = `${baseUrl}/oauth/logout?client_id=${clientId}&post_logout_redirect_uri=${logoutRedirect}`;
    if (Platform.OS === 'web') {
      window.location.assign(url);
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  useEffect(() => {
    (async () => {
      console.log('Profile page - checking for ID token...');
      if (Platform.OS === 'web') {
        const idToken = localStorage.getItem('frontegg_id_token');
        console.log('Profile page - ID token from localStorage:', idToken ? 'found' : 'not found');
        if (idToken) {
          const userData = decodeJwt(idToken);
          console.log('Profile page - decoded user data:', userData);
          setUser(userData);
        }
        return;
      }
      const idToken = await SecureStore.getItemAsync('frontegg_id_token');
      if (idToken) setUser(decodeJwt(idToken));
    })();
  }, []);

  if (!user) {
    return (
      <View style={styles.center}> 
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // Helper function to format timestamp
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Helper function to format array values
  const formatArray = (arr?: any[]) => {
    if (!arr || !Array.isArray(arr)) return 'N/A';
    return arr.join(', ');
  };

  // Get the best available profile picture
  const profilePicture = user.profilePictureUrl || user.picture;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Profile Picture */}
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        {/* Basic Info */}
        <Text style={styles.name}>{user.name || user.given_name || 'Unknown User'}</Text>
        <Text style={styles.email}>{user.email || ''}</Text>
        
        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.row}><Text style={styles.label}>User ID</Text><Text style={styles.value}>{user.sub || user.user_id || 'N/A'}</Text></View>
          {user.given_name && <View style={styles.row}><Text style={styles.label}>First Name</Text><Text style={styles.value}>{user.given_name}</Text></View>}
          {user.family_name && <View style={styles.row}><Text style={styles.label}>Last Name</Text><Text style={styles.value}>{user.family_name}</Text></View>}
          {user.nickname && <View style={styles.row}><Text style={styles.label}>Nickname</Text><Text style={styles.value}>{user.nickname}</Text></View>}
          <View style={styles.row}><Text style={styles.label}>Email Verified</Text><Text style={styles.value}>{user.email_verified ? 'Yes' : 'No'}</Text></View>
        </View>

        {/* Frontegg Specific Info */}
        {(user.tenant_id || user.roles || user.permissions) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            {user.tenant_id && <View style={styles.row}><Text style={styles.label}>Tenant ID</Text><Text style={styles.value}>{user.tenant_id}</Text></View>}
            {user.roles && <View style={styles.row}><Text style={styles.label}>Roles</Text><Text style={styles.value}>{formatArray(user.roles)}</Text></View>}
            {user.permissions && <View style={styles.row}><Text style={styles.label}>Permissions</Text><Text style={styles.value}>{formatArray(user.permissions)}</Text></View>}
          </View>
        )}

        {/* Token Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Information</Text>
          <View style={styles.row}><Text style={styles.label}>Issued At</Text><Text style={styles.value}>{formatTimestamp(user.iat)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Expires At</Text><Text style={styles.value}>{formatTimestamp(user.exp)}</Text></View>
          {user.auth_time && <View style={styles.row}><Text style={styles.label}>Authenticated</Text><Text style={styles.value}>{formatTimestamp(user.auth_time)}</Text></View>}
          {user.iss && <View style={styles.row}><Text style={styles.label}>Issuer</Text><Text style={styles.value}>{user.iss}</Text></View>}
          {user.aud && <View style={styles.row}><Text style={styles.label}>Audience</Text><Text style={styles.value}>{user.aud}</Text></View>}
        </View>

        {/* Additional Fields */}
        {Object.keys(user).filter(key => 
          !['name', 'email', 'sub', 'profilePictureUrl', 'picture', 'email_verified', 
            'given_name', 'family_name', 'nickname', 'iat', 'exp', 'auth_time', 
            'tenant_id', 'user_id', 'roles', 'permissions', 'iss', 'aud', 'azp'].includes(key)
        ).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {Object.entries(user).map(([key, value]) => {
              if (['name', 'email', 'sub', 'profilePictureUrl', 'picture', 'email_verified', 
                   'given_name', 'family_name', 'nickname', 'iat', 'exp', 'auth_time', 
                   'tenant_id', 'user_id', 'roles', 'permissions', 'iss', 'aud', 'azp'].includes(key)) {
                return null;
              }
              return (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                  <Text style={styles.value}>
                    {Array.isArray(value) ? formatArray(value) : String(value || 'N/A')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
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
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, marginBottom: 16, borderWidth: 2, borderColor: '#007AFF', backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 48, fontWeight: 'bold', color: '#007AFF' },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  email: { fontSize: 16, color: '#666', marginBottom: 20 },
  section: { width: '100%', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
  row: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  label: { color: '#555', fontWeight: '600', flex: 1 },
  value: { color: '#111', fontWeight: '600', flex: 2, textAlign: 'right' },
  button: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, width: '100%', alignItems: 'center' },
  secondary: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontWeight: '700' }
});


