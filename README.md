# PersonalShopper

Sistema para administrar trabajo de personal shopper con esta jerarquia:

`Proyecto -> Viaje -> Dia -> Orden`

El repo es un monorepo con backend en .NET y app movil en Expo React Native.

## Estado actual

- Backend local en Windows con SQL Server Express.
- App Android compilada con EAS.
- Conexion remota al backend por Tailscale.
- La app usa JWT para autenticacion.
- La app Android permite trafico HTTP hacia la IP de Tailscale del servidor.

## Arquitectura

### Backend

Ubicacion: [backend](C:/Users/diego/OneDrive/Documents/PersonalShopper/backend)

- Tecnologia: .NET 9 Web API
- Base de datos: SQL Server Express
- ORM: Entity Framework Core
- Auth: ASP.NET Identity + JWT
- Swagger habilitado
- CORS abierto para desarrollo
- URL actual: `http://0.0.0.0:5000`

Capas:

- `PersonalShopper.Api`: controllers, middleware, bootstrap
- `PersonalShopper.Application`: DTOs, servicios, reglas de negocio
- `PersonalShopper.Domain`: entidades, enums, contratos
- `PersonalShopper.Infrastructure`: EF Core, auth, repositorios, exportacion

### Mobile

Ubicacion: [mobile](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile)

- Tecnologia: Expo SDK 54 + React Native 0.81 + TypeScript
- Estado global: Zustand
- Data fetching: Axios + React Query
- Navegacion: React Navigation stack
- Persistencia local de auth: `expo-secure-store`
- Exportacion de archivos: `expo-file-system` + `expo-sharing`
- Build Android: EAS Build

## Flujo funcional

### Autenticacion

- Registro: `POST /api/v1/auth/register`
- Login: `POST /api/v1/auth/login`
- Si login o registro responden con `success=true`, la app guarda:
  - `auth_token`
  - `auth_email`
- El token se adjunta automaticamente en cada request via interceptor de Axios.

### Estructura de negocio

- Un Proyecto tiene muchos Viajes.
- Un Viaje tiene muchos Dias.
- Un Dia tiene muchas Ordenes.
- Las Ordenes pueden incluir foto.
- Hay exportacion a Excel para:
  - Proyecto
  - Viaje
  - Dia / Ordenes del dia

### App movil

Pantallas principales:

- Auth
  - Login
  - Register
- App
  - Projects
  - ProjectDetail
  - TripDetail
  - DayDetail
  - OrderForm

### Fotos y exportacion

- Las ordenes pueden adjuntar una foto desde galeria o camara.
- La app comprime la imagen con `expo-image-picker` usando `quality: 0.3`.
- Las ordenes se envian como `multipart/form-data`.
- El backend expone exportacion a Excel para proyecto, viaje y dia.
- En mobile, la descarga y comparticion se hace con `expo-file-system` y `expo-sharing`.

## Configuracion real importante

### Backend escuchando en toda la maquina

Archivo: [appsettings.json](C:/Users/diego/OneDrive/Documents/PersonalShopper/backend/PersonalShopper.Api/appsettings.json)

La API esta configurada con:

```json
"Urls": "http://0.0.0.0:5000"
```

Eso permite acceso desde:

- `localhost:5000`
- LAN
- Tailscale

### URL base de la app movil

Archivo: [api.ts](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/src/services/api.ts)

La app usa:

```ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';
```

La base final de Axios es:

```text
${EXPO_PUBLIC_API_BASE_URL}/api/v1
```

### Variable actual para Tailscale

Archivo: [mobile/.env](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/.env)

Actualmente se usa una IP Tailscale del servidor, por ejemplo:

```env
EXPO_PUBLIC_API_BASE_URL=http://100.113.148.2:5000
```

### Android y trafico HTTP

Archivo: [mobile/app.json](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/app.json)

La app Android necesita permitir HTTP porque el backend actual usa `http://` y no `https://`.

Eso esta configurado con el plugin:

- `expo-build-properties`

y con:

```json
[
  "expo-build-properties",
  {
    "android": {
      "usesCleartextTraffic": true
    }
  }
]
```

## Tailscale

### Objetivo

Permitir que el telefono se conecte al backend casero aunque no este en la misma red local.

### Requisitos

- Tailscale instalado en el servidor Windows
- Tailscale instalado en el telefono
- Ambos equipos dentro de la misma tailnet

### Validaciones utiles

En el telefono, si Tailscale esta bien y la API esta levantada:

- `http://100.x.x.x:5000/swagger` debe abrir
- `http://100.x.x.x:5000/api/v1` puede responder `404` y eso es normal

El endpoint base `/api/v1` no necesariamente existe. Lo importante es que los endpoints reales si funcionen, por ejemplo:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`

### Verificar que la API esta escuchando

En el servidor:

```powershell
netstat -ano | findstr :5000
```

Esperado:

- `0.0.0.0:5000 LISTENING`
- conexiones `ESTABLISHED` desde IPs `100.x.x.x`

## Setup local

### Requisitos

- .NET 9 SDK
- SQL Server Express
- Node.js 20 recomendado
- `dotnet-ef` global tool

### Backend

```powershell
cd backend/PersonalShopper.Api
dotnet run
```

URLs utiles:

- API: [http://localhost:5000](http://localhost:5000)
- Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger)

### Mobile para desarrollo local

```powershell
cd mobile
npm install
npx expo start
```

## Build Android

Archivo: [mobile/eas.json](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/eas.json)

Perfiles actuales:

- `preview`: genera APK
- `production`: genera App Bundle

Comandos:

```powershell
cd mobile
npx eas build -p android --profile preview --clear-cache
```

```powershell
cd mobile
npx eas build -p android --profile production --clear-cache
```

## Dependencias clave del mobile

Ademas de Expo base, hoy hay varias dependencias importantes para que el build funcione:

- `babel-preset-expo`
- `expo-build-properties`
- `react-native-worklets`
- `expo-secure-store`
- `expo-file-system`
- `expo-sharing`

Si faltan, EAS puede fallar en `expo doctor`, Metro o bundle JS.

## Problemas reales ya encontrados

### 1. No compilar dentro de OneDrive para EAS

El empaquetado del proyecto fallo cuando el build se lanzo desde una carpeta sincronizada por OneDrive.

Recomendacion operativa:

- usar una copia fuera de OneDrive para correr `eas build`
- ejemplo: `C:\dev\PersonalShopper`

### 2. Android bloquea HTTP por defecto

La APK compilaba pero no conectaba al backend aunque Tailscale y Swagger funcionaban.

Causa:

- Android estaba bloqueando trafico cleartext `http://`

Solucion aplicada:

- `expo-build-properties`
- `android.usesCleartextTraffic=true`

### 3. `expo-file-system/build/ExpoFileSystem` no es estable

La app tenia imports internos de `expo-file-system/build/ExpoFileSystem`.

Eso se reemplazo por la API publica:

- `File`
- `Paths`

## Endpoints principales

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Projects

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `PUT /api/v1/projects/{id}`
- `DELETE /api/v1/projects/{id}`
- `GET /api/v1/projects/{id}/export`

### Trips

- `GET /api/v1/projects/{projectId}/trips`
- `POST /api/v1/projects/{projectId}/trips`
- `GET /api/v1/trips/{id}`
- `PUT /api/v1/trips/{id}`
- `DELETE /api/v1/trips/{id}`
- `GET /api/v1/trips/{id}/export`

### Days

- `GET /api/v1/trips/{tripId}/days`
- `POST /api/v1/trips/{tripId}/days`
- `GET /api/v1/days/{id}`
- `PUT /api/v1/days/{id}`
- `DELETE /api/v1/days/{id}`

### Orders

- `GET /api/v1/days/{dayId}/orders`
- `POST /api/v1/days/{dayId}/orders`
- `GET /api/v1/orders/{id}`
- `PUT /api/v1/orders/{id}`
- `DELETE /api/v1/orders/{id}`
- `GET /api/v1/days/{dayId}/orders/export`

## Checklist manual rapido

### Backend

- Registrar un usuario en Swagger
- Loguear un usuario en Swagger
- Crear un proyecto
- Crear un viaje dentro del proyecto
- Crear un dia dentro del viaje
- Crear una orden dentro del dia
- Probar exportacion Excel desde proyecto, viaje y dia

### Mobile

- Registro y login exitosos
- Persistencia del token entre aperturas
- Crear proyecto, viaje y dia
- Crear orden con foto
- Buscar orden por nombre o producto
- Exportar Excel y compartirlo desde el telefono
- Cerrar sesion y volver a login

## Datos y auth que la app espera

### Register request

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

### Login request

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Auth response

La app espera algo como:

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "...",
    "email": "user@example.com",
    "expiresAt": "2026-03-11T00:00:00Z"
  }
}
```

## Archivos importantes para entender el sistema

- [backend/PersonalShopper.Api/Program.cs](C:/Users/diego/OneDrive/Documents/PersonalShopper/backend/PersonalShopper.Api/Program.cs)
- [backend/PersonalShopper.Api/appsettings.json](C:/Users/diego/OneDrive/Documents/PersonalShopper/backend/PersonalShopper.Api/appsettings.json)
- [mobile/app.json](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/app.json)
- [mobile/eas.json](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/eas.json)
- [mobile/package.json](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/package.json)
- [mobile/src/services/api.ts](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/src/services/api.ts)
- [mobile/src/services/apiServices.ts](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/src/services/apiServices.ts)
- [mobile/src/store/authStore.ts](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/src/store/authStore.ts)
- [mobile/src/navigation/RootNavigator.tsx](C:/Users/diego/OneDrive/Documents/PersonalShopper/mobile/src/navigation/RootNavigator.tsx)

## Nota para futuros modelos o mantenedores

Antes de asumir que "la app no conecta":

1. confirmar que Tailscale esta conectado en ambos equipos
2. abrir `/swagger` desde el telefono
3. confirmar `netstat -ano | findstr :5000` en el servidor
4. verificar `EXPO_PUBLIC_API_BASE_URL` en `mobile/.env`
5. recordar que `/api/v1` puede dar `404` y eso no implica que el backend este roto
6. si la APK no conecta pero Swagger si, revisar cleartext HTTP en Android

Antes de cambiar infraestructura:

1. el backend actual esta pensado para correr en una PC Windows casera
2. la conectividad remota actual depende de Tailscale, no de un hosting publico
3. la app hoy depende de `http://100.x.x.x:5000`, no de `https://`
