# Frontegg + Expo (React Native) Sample

A minimal Expo Router app that demonstrates integrating Frontegg OAuth Authentication Flow (Authorization Code + PKCE) with a custom URL scheme and deep links.

## Features
- Login via Frontegg hosted login using deep links
- Callback handling (`my-scheme://callback`) and token exchange (PKCE, no client secret)
- Token storage with `expo-secure-store`
- Profile page that decodes the ID token and shows user info
- Logout flow with `my-scheme://logout`

## Prerequisites
- Node 18+
- Xcode (for iOS dev client)
- An existing Frontegg workspace

## Configure
Set the values via environment variables used by `app.json`:

```bash
export FRONTEGG_BASE_URL=https://YOUR_SUBDOMAIN.frontegg.com
export FRONTEGG_CLIENT_ID=YOUR_CLIENT_ID
export SCHEME=fronteggreactnativedemo
```

Then start the app:

```bash
npx expo run:ios   # first time to build the dev client
npx expo start -c
```

Ensure you whitelist the redirect URIs in Frontegg (Authentication → Login Method → Hosted Login):
- `fronteggreactnativedemo://callback`
- `fronteggreactnativedemo://logout`

If you change the scheme, update the values above and re-build the iOS dev client.

### Why no SDK?
- This sample uses standards-based OAuth 2.0/OIDC with PKCE directly (hosted login → code → token), which is sufficient for many apps.
- No client secret is shipped; the app is a public client. PKCE binds the code to the device.
- You can add a Frontegg SDK for higher-level features (UI widgets, session helpers) later if desired.

## Project structure
- `app/(tabs)/index.tsx`: Home page with explanation and Login button
- `app/callback.tsx`: Handles the OAuth callback and token exchange, then navigates to `/profile`
- `app/profile.tsx`: Displays user info from the ID token
- `app/logout.tsx`: Clears tokens and navigates back to home
- `app.json`: Expo config; reads secrets from environment variables under `expo.extra`

## Notes
- This sample avoids checking secrets into Git by reading from environment variables in `app.json`.
- For production, prefer per-environment `app.config.ts` or EAS Secrets.

## License
MIT


