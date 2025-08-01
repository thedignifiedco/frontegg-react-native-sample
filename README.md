# Frontegg React Native Authentication Demo

A csimple React Native application demonstrating Frontegg authentication integration using Expo Router and web-based OAuth flow.

## Features

- ✅ **Frontegg Authentication**: Complete login/logout flow with web-based OAuth
- ✅ **User Information Display**: Shows real user data from Frontegg tokens
- ✅ **Expo Router**: Modern file-based routing
- ✅ **TypeScript**: Full type safety
- ✅ **Clean Architecture**: Professional code structure

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your Frontegg configuration:
   ```env
   FRONTEGG_BASE_URL=https://your-tenant.frontegg.com
   FRONTEGG_CLIENT_ID=your-client-id
   FRONTEGG_CLIENT_SECRET=your-client-secret
   FRONTEGG_REDIRECT_URI=your-app://callback
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Configuration

The app uses environment variables for Frontegg configuration. Create a `.env` file in the root directory:

```env
FRONTEGG_BASE_URL=https://your-tenant.frontegg.com
FRONTEGG_CLIENT_ID=your-client-id
FRONTEGG_CLIENT_SECRET=your-client-secret
FRONTEGG_REDIRECT_URI=your-app://callback
```

**Important:** Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Architecture

- **Expo Router**: File-based routing with `app/` directory
- **Web-based OAuth**: Uses `expo-web-browser` for authentication
- **Deep Linking**: Handles authentication callbacks
- **TypeScript**: Full type safety throughout

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/
│       ├── _layout.tsx      # Tab layout
│       └── index.tsx        # Main authentication screen
├── components/              # Reusable components
├── constants/               # App constants
└── hooks/                   # Custom hooks
```

## License

MIT
