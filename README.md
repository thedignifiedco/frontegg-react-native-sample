# Frontegg React Native Authentication Demo

A sample Expo app using the Frontegg React Native SDK. The app demonstrates a simple login flow using a custom deep link with web-based OAuth authentication.

## Features

- ✅ **Frontegg Authentication**: Complete login/logout flow with web-based OAuth
- ✅ **User Information Display**: Shows real user data from Frontegg tokens
- ✅ **Profile Picture**: Displays user avatar from Frontegg
- ✅ **Expo Router**: Modern file-based routing
- ✅ **TypeScript**: Full type safety
- ✅ **Environment Variables**: Secure credential management
- ✅ **Clean Architecture**: Professional code structure

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator
- Frontegg account and tenant

## Getting Started

### 1. Create a Frontegg Application

1. **Create a new Application in the Frontegg Portal**
   - Go to your Frontegg Admin Portal
   - Navigate to **Applications** → **Create Application**
   - You can enter any valid http or https URL as the APP URL
   - Ensure the application is marked as **Auto-assigned** and set as **Default**

2. **Configure your custom redirect URI**
   - Go to **Authentication** → **Login Method** → **Hosted Login**
   - Add `myapp://callback` as an **Allowed Redirect URL**
   - Navigate to **Keys & Domains** → **Domains**
   - Add `myapp://callback` under **Allowed Origins**

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Then edit `.env` with your Frontegg configuration:
```env
FRONTEGG_BASE_URL=https://your-tenant.frontegg.com
FRONTEGG_CLIENT_ID=your-client-id
FRONTEGG_CLIENT_SECRET=your-client-secret
FRONTEGG_REDIRECT_URI=myapp://callback
```

### 4. Start the Development Server

```bash
npm start
```

## Configuration

The app uses environment variables for Frontegg configuration. Create a `.env` file in the root directory:

```env
FRONTEGG_BASE_URL=https://your-tenant.frontegg.com
FRONTEGG_CLIENT_ID=your-client-id
FRONTEGG_CLIENT_SECRET=your-client-secret
FRONTEGG_REDIRECT_URI=myapp://callback
```

**Important:** Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Frontegg Portal Setup

### Required Configuration Steps:

1. **Application Setup**
   - Create a new application in Frontegg Portal
   - Set any valid URL as APP URL
   - Mark as Auto-assigned and Default

2. **Authentication Configuration**
   - Go to **Authentication** → **Login Method** → **Hosted Login**
   - Add `myapp://callback` to **Allowed Redirect URLs**

3. **Domain Configuration**
   - Navigate to **Keys & Domains** → **Domains**
   - Add `myapp://callback` to **Allowed Origins**

4. **OAuth Configuration**
   - Ensure your application has OAuth enabled
   - Configure the redirect URI in OAuth settings

## Architecture

- **Expo Router**: File-based routing with `app/` directory
- **Web-based OAuth**: Uses `expo-web-browser` for authentication
- **Deep Linking**: Handles authentication callbacks with `myapp://callback`
- **TypeScript**: Full type safety throughout
- **Environment Variables**: Secure credential management

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/
│       ├── _layout.tsx      # Tab layout
│       └── index.tsx        # Main authentication screen
├── components/              # Reusable components
├── constants/               # App constants
├── hooks/                   # Custom hooks
├── .env                     # Environment variables (not in git)
├── .env.example            # Environment template
├── babel.config.js         # Babel configuration
└── env.d.ts                # TypeScript declarations
```

## Deep Link Configuration

The app uses the custom scheme `myapp://callback` for handling authentication callbacks. This scheme is configured in:

- `app.json` - Expo configuration
- `.env` - Environment variables
- Deep link handling in `app/(tabs)/index.tsx`

## License

MIT
