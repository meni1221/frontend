# Ishru Frontend

React 18 + Vite admin and guest UI for Ishru.

## Requirements

- Node.js 20+
- A running Ishru backend API

## Environment

Create a local environment file:

```bash
copy .env.example .env
```

Important values:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_LOG_LEVEL=info
VITE_LOG_TO_CONSOLE=false
VITE_COMPONENT_LOGS=true
```

For production, point `VITE_API_BASE_URL` to the deployed backend API origin, including `/api`.

## Development

```bash
npm install
npm run dev
```

Local app URL:

```text
http://localhost:4310
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Backend Contract

The frontend expects the backend to expose the authenticated REST API under `VITE_API_BASE_URL` and the Socket.IO namespace `/whatsapp-ws`.

All authenticated API requests use the JWT stored in local storage after login.
