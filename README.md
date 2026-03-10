# Personal Shopper – MVP Módulo 1

Sistema de gestión de órdenes para Personal Shoppers. Jerarquía: **Proyecto → Viaje → Día → Órdenes**.

## Stack

| Capa | Tech |
|------|------|
| Mobile | React Native + Expo Go (TypeScript) |
| Backend | .NET 9 Web API (C#) |
| Base de datos | SQL Server Express (local) |
| Conectividad remota | Tailscale |

---

## Setup en Windows (paso a paso)

### 1. Requisitos previos
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [SQL Server Express](https://www.microsoft.com/es-es/sql-server/sql-server-downloads) (instancia `SQLEXPRESS`)
- [Node.js 18+](https://nodejs.org)
- [Expo Go](https://expo.dev/go) en tu celular
- `dotnet-ef` tool: `dotnet tool install --global dotnet-ef`

### 2. Base de datos

SQL Server Express debe estar corriendo con la instancia `SQLEXPRESS`.
La cadena de conexión está en `backend/PersonalShopper.Api/appsettings.json`:
```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=PersonalShopperDb;Trusted_Connection=True;TrustServerCertificate=True;"
```

> La base de datos se crea automáticamente al iniciar la API (EF Core auto-migration).

Para aplicar migraciones manualmente:
```powershell
cd backend
dotnet ef database update --project PersonalShopper.Infrastructure --startup-project PersonalShopper.Api
```

### 3. Correr el Backend

```powershell
cd backend/PersonalShopper.Api
dotnet run
```

La API corre en: `http://localhost:5000`  
Swagger UI en: `http://localhost:5000/swagger`

> Al iniciar, se crea automáticamente la DB, las tablas, y el rol `Admin`.

### 4. Correr la App Mobile

```powershell
cd mobile
# Editar .env con la IP correcta (ver sección Tailscale)
npx expo start
```

Escanear el QR con **Expo Go** en tu celular.

---

## Configuración de Tailscale

Tailscale permite acceder a la API desde tu móvil sin necesidad de estar en la misma red Wifi.

### En la PC (servidor):
1. Instalar [Tailscale](https://tailscale.com/download/windows) e iniciar sesión
2. Anotar el **IP de Tailscale** de tu máquina (algo como `100.x.x.x`) desde el panel de Tailscale
3. Asegurarte de que el firewall permite conexiones en el puerto `5000`:
   ```powershell
   netsh advfirewall firewall add rule name="PersonalShopper API" dir=in action=allow protocol=TCP localport=5000
   ```

### En el móvil:
1. Instalar Tailscale en el celular e iniciar sesión con la misma cuenta
2. Editar `mobile/.env`:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://100.x.x.x:5000
   ```
   (reemplaza `100.x.x.x` con la IP Tailscale de tu PC)

### Alternativa (misma red WiFi):
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:5000
```

---

## Estructura del Proyecto

```
PersonalShopper/
├── backend/
│   ├── PersonalShopper.sln
│   ├── PersonalShopper.Domain/       ← Entidades, interfaces, enums
│   ├── PersonalShopper.Application/  ← DTOs, servicios, lógica de negocio
│   ├── PersonalShopper.Infrastructure/ ← EF Core, repos, Identity, JWT, Export
│   └── PersonalShopper.Api/          ← Controllers, middleware, Program.cs
└── mobile/
    ├── App.tsx
    ├── .env                          ← API_BASE_URL
    └── src/
        ├── navigation/               ← RootNavigator
        ├── screens/
        │   ├── auth/                 ← Login, Register
        │   ├── projects/             ← ProjectsScreen, ProjectDetailScreen
        │   ├── trips/                ← TripDetailScreen
        │   ├── days/                 ← DayDetailScreen (órdenes + export)
        │   └── orders/               ← OrderFormScreen
        ├── services/                 ← api.ts (Axios+JWT), apiServices.ts
        ├── store/                    ← authStore.ts (Zustand)
        └── types/                    ← index.ts (DTOs TypeScript)
```

---

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Crear cuenta admin |
| POST | `/api/v1/auth/login` | Login → token JWT |
| GET/POST | `/api/v1/projects` | Listar / Crear proyectos |
| GET/PUT/DELETE | `/api/v1/projects/{id}` | Detalle / Editar / Eliminar |
| GET/POST | `/api/v1/projects/{id}/trips` | Viajes de un proyecto |
| GET/PUT/DELETE | `/api/v1/trips/{id}` | Detalle / Editar / Eliminar viaje |
| GET/POST | `/api/v1/trips/{id}/days` | Días de un viaje |
| GET/PUT/DELETE | `/api/v1/days/{id}` | Detalle / Editar / Eliminar día |
| GET | `/api/v1/days/{id}/orders?search=` | Listar + filtrar órdenes |
| POST | `/api/v1/days/{id}/orders` | Crear orden (multipart/form-data) |
| GET/PUT/DELETE | `/api/v1/orders/{id}` | Detalle / Editar / Eliminar orden |
| GET | `/api/v1/days/{id}/orders/export` | Descargar XLSX con órdenes del día |

---

## Seguridad

- Passwords: **ASP.NET Identity** (bcrypt automático)
- JWT: token de **7 días**, HS256, requiere `Bearer {token}` en header
- Campos `RefreshToken` y `RefreshTokenExpiry` en `ApplicationUser` listos para implementación futura
- CORS: abierto para desarrollo (restringir en producción)

---

## Checklist de pruebas manuales

### Backend (Swagger en `/swagger`)
- [ ] `POST /auth/register` con email y password → recibir token
- [ ] `POST /auth/login` → copiar JWT → clic "Authorize" en Swagger
- [ ] `POST /projects` → crear proyecto
- [ ] `POST /projects/{id}/trips` → crear viaje
- [ ] `POST /trips/{id}/days` con `dayNumber: 1` → crear día
- [ ] Intentar crear Day con mismo número → debe recibir 400 con error
- [ ] `POST /days/{id}/orders` con `nombrePersona` → orden creada
- [ ] `GET /days/{id}/orders?search=nombre` → filtrar
- [ ] `GET /days/{id}/orders/export` → descargar XLSX

### Mobile (Expo Go)
- [ ] Registro de nuevo usuario
- [ ] Login → llega a pantalla de Proyectos
- [ ] Crear Proyecto → crear Viaje → crear Día
- [ ] Crear Orden con foto (galería o cámara)
- [ ] Buscar orden por nombre
- [ ] Botón "📊 Excel" → archivo compartible en celular
- [ ] Eliminar orden, día, viaje, proyecto con confirmación
- [ ] Cerrar sesión → regresa al login

---

## Fotos

- Se comprimen al **30% de calidad** con máx 800px antes de subir (Expo ImagePicker `quality: 0.3`)
- Se envían como `multipart/form-data` → se guardan como `VARBINARY(MAX)` en SQL Server
- Se sirven como `base64` en los GETs de órdenes

## ¿Por qué no archivos en disco?

Para el MVP, guardar en DB es más simple: sin gestión de carpetas, sin rutas rotas, sin backup separado. La foto ya viene comprimida desde el móvil (≤150KB típicamente), por lo que el impacto en la DB es manejable.
