# PowerPlan - Implementation Documentation

## Overview

This document describes the implementation details of the PowerPlan workout planning application, including setup instructions, development workflow, and deployment guidelines.

---

## Prerequisites

### Backend Requirements

- .NET 8.0 SDK
- SQLite (bundled)

### Frontend Requirements

- Node.js 18+
- pnpm (package manager)
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd powerplan
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend/PowerPlanAPI

# Restore packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the application
dotnet run
```

The API will be available at:

- HTTP: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger` (development only)

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm start
```

### 4. API Configuration

Update the API base URL in `frontend/src/config/api.ts`:

```typescript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:5000';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000';

// For Physical Device (use your computer's IP)
const API_BASE_URL = 'http://192.168.x.x:5000';
```

---

## Project Configuration

### Backend Configuration (appsettings.json)

```json
{
  "Jwt": {
    "Secret": "<your-secret-key>",
    "Issuer": "PowerPlanAPI",
    "Audience": "PowerPlanApp",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend Configuration

#### Expo (app.json)

- App name and slug configuration
- Platform-specific settings
- Build configuration

#### Tailwind (tailwind.config.js)

- Custom theme colors
- Content paths for NativeWind

#### TypeScript (tsconfig.json)

- Path aliases (`@/` for `src/`)
- Strict mode enabled

---

## Development Workflow

### Backend Development

#### Adding a New Entity

1. Create model in `models/`:

```csharp
public class NewEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    // Add properties
}
```

2. Add DbSet to `AppDbContext.cs`:

```csharp
public DbSet<NewEntity> NewEntities { get; set; }
```

3. Create and apply migration:

```bash
dotnet ef migrations add AddNewEntity
dotnet ef database update
```

4. Create DTOs for data transfer

5. Create Controller with endpoints

#### Adding a New API Endpoint

1. Create DTO classes for request/response
2. Add endpoint to appropriate controller:

```csharp
[HttpPost]
[Authorize]
public async Task<IActionResult> CreateResource([FromBody] CreateResourceDto dto)
{
    var userId = User.GetUserId();
    // Implementation
    return Ok(result);
}
```

### Frontend Development

#### Adding a New Screen

1. Create screen file in appropriate directory:

```
app/(tabs)/newscreen.tsx     # For tab screen
app/newscreen.tsx            # For standalone screen
app/[id].tsx                 # For dynamic route
```

2. Implement the screen component:

```tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewScreen() {
  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <View className='p-6'>
        <Text className='text-white text-2xl font-bold'>New Screen</Text>
      </View>
    </SafeAreaView>
  );
}
```

#### Adding a New API Service

Create service in `src/services/`:

```typescript
import { apiClient } from '@/config/api';

export const newService = {
  async getAll() {
    const response = await apiClient.get('/api/resources');
    return response.data;
  },

  async create(data: CreateResourceDto) {
    const response = await apiClient.post('/api/resources', data);
    return response.data;
  },
};
```

#### Adding a Custom Hook

Create hook in `src/hooks/`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { newService } from '@/services/newService';

export function useResources() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await newService.getAll();
      setData(result);
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refresh: fetch };
}
```

---

## UI Components

### Available Components (src/components/ui.tsx)

| Component        | Props                                                        | Description               |
| ---------------- | ------------------------------------------------------------ | ------------------------- |
| `LoadingOverlay` | `visible`, `message`                                         | Full-screen loading modal |
| `LoadingSpinner` | `message`, `size`                                            | Inline loading indicator  |
| `ErrorState`     | `message`, `onRetry`, `retryLabel`                           | Error display with retry  |
| `EmptyState`     | `title`, `message`, `actionLabel`, `onAction`                | Empty data state          |
| `Card`           | `variant`, `onPress`, `className`                            | Container card            |
| `Badge`          | `label`, `variant`                                           | Status badge              |
| `Button`         | `label`, `onPress`, `variant`, `size`, `disabled`, `loading` | Action button             |
| `ProgressBar`    | `progress`, `color`, `height`, `showLabel`                   | Progress indicator        |
| `StatCard`       | `label`, `value`, `subtitle`, `trend`, `trendValue`          | Statistics display        |
| `FilterChip`     | `label`, `selected`, `onPress`                               | Filter toggle             |
| `SectionHeader`  | `title`, `subtitle`, `rightElement`                          | Section heading           |

### Usage Example

```tsx
import { Card, Button, EmptyState, LoadingSpinner } from '@/components/ui';

function MyComponent() {
  const { data, isLoading, error } = useMyData();

  if (isLoading) return <LoadingSpinner message='Loading...' />;
  if (error) return <ErrorState message={error} />;
  if (!data.length) return <EmptyState message='No data found' />;

  return (
    <Card variant='default'>
      {/* Content */}
      <Button
        label='Action'
        onPress={handleAction}
        variant='primary'
      />
    </Card>
  );
}
```

---

## Authentication Flow

### Registration

1. User submits registration form
2. Frontend validates input (react-hook-form)
3. POST to `/api/auth/register`
4. Backend validates, hashes password, creates user
5. Returns user data (without password)
6. Frontend redirects to login

### Login

1. User submits login form
2. POST to `/api/auth/login`
3. Backend validates credentials
4. Generates JWT token
5. Returns token and user data
6. Frontend stores token in AsyncStorage
7. AuthProvider updates state
8. User redirected to main app

### Protected Routes

```tsx
// app/(tabs)/_layout.tsx
export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href='/login' />;
  }

  return <Tabs>{/* ... */}</Tabs>;
}
```

---

## API Communication

### API Client Configuration

```typescript
// src/config/api.ts
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  },
);
```

---

## Testing

### Backend Testing

```bash
# Run tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Testing

```bash
# Run linting
pnpm lint

# Type checking
pnpm tsc --noEmit
```

---

## Building for Production

### Backend

```bash
# Build release
dotnet publish -c Release -o ./publish

# Run published app
cd publish
dotnet PowerPlanAPI.dll
```

### Frontend

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build APK locally
eas build --platform android --profile preview --local
```

---

## Environment Variables

### Backend

| Variable                 | Description      | Default      |
| ------------------------ | ---------------- | ------------ |
| `ASPNETCORE_ENVIRONMENT` | Environment name | Development  |
| `Jwt__Secret`            | JWT signing key  | Required     |
| `Jwt__Issuer`            | JWT issuer       | PowerPlanAPI |
| `Jwt__Audience`          | JWT audience     | PowerPlanApp |

### Frontend

Configure in `app.json` or `.env`:

- `API_URL` - Backend API URL

---

## Troubleshooting

### Common Issues

#### CORS Errors

- Ensure backend CORS policy includes your frontend origin
- Check that credentials are properly configured

#### JWT Token Expired

- Token expiration is configurable in appsettings.json
- Frontend should handle 401 responses and redirect to login

#### Database Migration Errors

```bash
# Reset database
rm powerplan.db
dotnet ef database update
```

#### Metro Bundler Issues

```bash
# Clear cache
pnpm start --clear

# Reset Metro cache
npx expo start -c
```

#### iOS Simulator Network Issues

- Use `localhost` instead of `127.0.0.1`
- Ensure backend is running on correct port

#### Android Emulator Network Issues

- Use `10.0.2.2` instead of `localhost`
- Check that the backend allows the emulator's IP

---

## Code Style Guidelines

### Backend (C#)

- Use async/await for I/O operations
- Follow Microsoft naming conventions
- Use DTOs for API contracts
- Keep controllers thin, logic in services

### Frontend (TypeScript)

- Use functional components with hooks
- Organize imports: React, libraries, local
- Use TypeScript strict mode
- Follow component file naming conventions

---

## Version Control

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring

### Commit Messages

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `style:` - Formatting changes
