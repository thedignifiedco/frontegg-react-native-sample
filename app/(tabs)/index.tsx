import {
  FRONTEGG_BASE_URL,
  FRONTEGG_CLIENT_ID,
  FRONTEGG_CLIENT_SECRET,
  FRONTEGG_REDIRECT_URI,
} from '@env';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Frontegg configuration from environment variables
const FRONTEGG_CONFIG = {
  baseUrl: FRONTEGG_BASE_URL,
  clientId: FRONTEGG_CLIENT_ID,
  clientSecret: FRONTEGG_CLIENT_SECRET,
  redirectUri: FRONTEGG_REDIRECT_URI,
};

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle deep linking for authentication callback
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      
      // Parse the URL to extract authentication data
      if (url.includes('myapp://callback')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error) {
          const errorMessage = errorDescription || error;
          Alert.alert('Authentication Error', `Error: ${errorMessage}`);
          setIsLoading(false);
          return;
        }
        
        if (code) {
          // Handle successful authentication
          handleAuthSuccess(code);
        }
      }
    };

    // Set up deep link listener
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleAuthSuccess = async (code: string) => {
    try {
      setIsLoading(true);
      
      // Exchange authorization code for tokens
      const tokenResponse = await fetch(`${FRONTEGG_CONFIG.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: FRONTEGG_CONFIG.clientId,
          client_secret: FRONTEGG_CONFIG.clientSecret,
          code: code,
          redirect_uri: FRONTEGG_CONFIG.redirectUri,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', tokenResponse.status, errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Extract user information from the ID token
      if (tokenData.id_token) {
        const userInfo = decodeJwtToken(tokenData.id_token);
        
        setUserInfo({
          name: userInfo.name,
          email: userInfo.email,
          tenantId: userInfo.tenantId,
          tenantIds: userInfo.tenantIds,
          id: userInfo.sub,
          picture: userInfo.profilePictureUrl,
          emailVerified: userInfo.email_verified,
          roles: userInfo.roles,
          permissions: userInfo.permissions,
          customClaims: userInfo.customClaims,
          applicationId: userInfo.applicationId,
          type: userInfo.type,
        });
      } else {
        // Fallback to access token if ID token is not available
        const userInfoResponse = await fetch(`${FRONTEGG_CONFIG.baseUrl}/oauth/resources/auth/v1/userinfo`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          
          setUserInfo({
            name: userInfo.name,
            email: userInfo.email,
            tenantId: userInfo.tenantId,
            tenantIds: userInfo.tenantIds,
            id: userInfo.sub,
            picture: userInfo.profilePictureUrl,
            emailVerified: userInfo.email_verified,
            roles: userInfo.roles,
            permissions: userInfo.permissions,
            customClaims: userInfo.customClaims,
            applicationId: userInfo.applicationId,
            type: userInfo.type,
          });
        } else {
          throw new Error('Failed to fetch user information');
        }
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
      
      Alert.alert('Success!', 'You have been successfully authenticated with Frontegg!');
      
    } catch (error) {
      console.error('Auth success error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to complete authentication: ' + (error as Error).message);
    }
  };

  // Helper function to decode JWT token
  const decodeJwtToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      return decoded;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      console.error('Token length:', token.length);
      console.error('Token preview:', token.substring(0, 50) + '...');
      return {};
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Construct Frontegg authentication URL
      // Note: Don't encode the redirect_uri as Frontegg expects the raw URL
      const authUrl = `${FRONTEGG_CONFIG.baseUrl}/oauth/authorize?` +
        `client_id=${FRONTEGG_CONFIG.clientId}&` +
        `redirect_uri=${FRONTEGG_CONFIG.redirectUri}&` +
        `response_type=code&` +
        `scope=openid profile email&` +
        `state=${Math.random().toString(36).substring(7)}`;
      
      // Open Frontegg authentication in web browser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        FRONTEGG_CONFIG.redirectUri,
        {
          preferEphemeralSession: true
        }
      );

      if (result.type === 'success') {
        // Handle the redirect URL
        const url = result.url;
        if (url) {
          const urlParams = new URLSearchParams(url.split('?')[1]);
          const code = urlParams.get('code');
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');

          if (error) {
            const errorMessage = errorDescription || error;
            Alert.alert('Authentication Error', `Error: ${errorMessage}`);
            setIsLoading(false);
            return;
          }

          if (code) {
            await handleAuthSuccess(code);
          }
        }
      } else if (result.type === 'cancel') {
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      Alert.alert('Login Error', 'Failed to initiate login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Use web-based logout
      const logoutUrl = `${FRONTEGG_CONFIG.baseUrl}/oauth/logout?` +
        `client_id=${FRONTEGG_CONFIG.clientId}&` +
        `post_logout_redirect_uri=${FRONTEGG_CONFIG.redirectUri}`;

      // Open logout URL in web browser to end the session
      const result = await WebBrowser.openAuthSessionAsync(
        logoutUrl,
        FRONTEGG_CONFIG.redirectUri,
        {
          preferEphemeralSession: true
        }
      );

      if (result.type === 'cancel') {
        setIsLoading(false);
      }

      // Clear authentication state
      setUserInfo(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      Alert.alert('Logged Out', 'You have been successfully logged out from Frontegg.');

    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
      Alert.alert('Logout Error', `Failed to logout: ${(error as Error).message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Expo App</Text>
        <Text style={styles.subtitle}>Frontegg React Native Authentication Demo</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, isAuthenticated ? styles.statusAuthenticated : styles.statusUnauthenticated]}>
          <Text style={styles.statusText}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </Text>
        </View>
      </View>

      {userInfo && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoTitle}>User Profile</Text>
          
          {userInfo.picture && (
            <View style={styles.profilePictureContainer}>
              <Image source={{ uri: userInfo.picture }} style={styles.profilePicture} />
            </View>
          )}
          
          <View style={styles.userInfoGrid}>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Name:</Text>
              <Text style={styles.userInfoValue}>{userInfo.name || 'N/A'}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Email:</Text>
              <Text style={styles.userInfoValue}>{userInfo.email || 'N/A'}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>User ID:</Text>
              <Text style={styles.userInfoValue}>{userInfo.id || 'N/A'}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Tenant:</Text>
              <Text style={styles.userInfoValue}>{userInfo.tenantId || 'N/A'}</Text>
            </View>
            {userInfo.emailVerified !== undefined && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Email Verified:</Text>
                <Text style={[styles.userInfoValue, userInfo.emailVerified ? styles.verified : styles.unverified]}>
                  {userInfo.emailVerified ? '✅ Yes' : '❌ No'}
                </Text>
              </View>
            )}
            {userInfo.type && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Token Type:</Text>
                <Text style={styles.userInfoValue}>{userInfo.type}</Text>
              </View>
            )}
            {userInfo.applicationId && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>App ID:</Text>
                <Text style={styles.userInfoValue}>{userInfo.applicationId}</Text>
              </View>
            )}
            {userInfo.roles && userInfo.roles.length > 0 && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Roles:</Text>
                <Text style={styles.userInfoValue}>{userInfo.roles.join(', ')}</Text>
              </View>
            )}
            {userInfo.tenantIds && userInfo.tenantIds.length > 1 && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>All Tenants:</Text>
                <Text style={styles.userInfoValue}>{userInfo.tenantIds.length} total</Text>
              </View>
            )}
            {userInfo.permissions && userInfo.permissions.length > 0 && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Permissions:</Text>
                <Text style={styles.userInfoValue}>{userInfo.permissions.length} total</Text>
              </View>
            )}
            {userInfo.customClaims && Object.keys(userInfo.customClaims).length > 0 && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Company:</Text>
                <Text style={styles.userInfoValue}>{userInfo.customClaims.Company || 'N/A'}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!isAuthenticated ? (
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Authenticating..." : "Login with Frontegg"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Logging out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footerText}>
        A simple React Native application demonstrating Frontegg authentication integration using Expo Router and web-based OAuth flow.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, // Extra padding for status bar
    paddingBottom: 100, // Extra padding for tab bar
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusAuthenticated: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  statusUnauthenticated: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E8B57',
    textAlign: 'center',
  },
  userInfoGrid: {
    width: '100%',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  userInfoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  userInfoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E8B57',
    flex: 2,
    textAlign: 'right',
  },
  verified: {
    color: '#4CAF50',
  },
  unverified: {
    color: '#F44336',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#FF3B30',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});
