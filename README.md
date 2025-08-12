# Frontegg + Expo (React Native) Sample

A minimal Expo Router app that demonstrates integrating Frontegg OAuth Authentication Flow with a custom URL scheme and deep links.

## Features
- Login via Frontegg hosted login using deep links
- Callback handling (`my-scheme://callback`) and token exchange
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
export FRONTEGG_CLIENT_SECRET=YOUR_CLIENT_SECRET
export SCHEME=fronteggreactnativedemo
```

Then start the app:

```bash
npx expo run:ios   # first time to build the dev client
npx expo start -c
```

Ensure you whitelist the redirect URIs in Frontegg (Authentication -> Login Method ->  Hosted Login settings):
- `fronteggreactnativedemo://callback`
- `fronteggreactnativedemo://logout`

If you change the scheme, update the values above and re-build the iOS dev client.

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


