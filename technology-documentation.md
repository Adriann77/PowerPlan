# PowerPlan - Technology Documentation

## Overview

PowerPlan is a full-stack workout planning application built with modern technologies. The application allows users to create workout plans, track training sessions, and monitor progress over time.

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **.NET** | 8.0 | Runtime and SDK |
| **ASP.NET Core** | 8.0 | Web API framework |
| **Entity Framework Core** | 8.0.8 | ORM for database operations |
| **SQLite** | - | Database engine |
| **JWT Bearer Authentication** | 8.0.10 | Token-based authentication |
| **BCrypt.Net-Next** | 4.0.3 | Password hashing |
| **Swashbuckle (Swagger)** | 10.0.1 | API documentation |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Cross-platform mobile framework |
| **Expo** | 54.0.31 | React Native development platform |
| **Expo Router** | 6.0.21 | File-based routing |
| **TypeScript** | - | Type-safe JavaScript |
| **NativeWind** | 4.2.1 | Tailwind CSS for React Native |
| **React Hook Form** | 7.66.1 | Form management |
| **React Navigation** | 7.x | Navigation library |
| **AsyncStorage** | 2.2.0 | Local data persistence |

---

## Backend Architecture

### Project Structure

```
backend/PowerPlanAPI/
├── Controllers/          # API endpoints
│   ├── AuthController.cs
│   ├── ExercisesController.cs
│   ├── HealthController.cs
│   ├── TrainingDaysController.cs
│   ├── WorkoutPlansController.cs
│   └── WorkoutSessionsController.cs
├── Data/
│   └── AppDbContext.cs   # EF Core database context
├── DTOs/                 # Data Transfer Objects
│   ├── Exercise/
│   ├── TrainingDay/
│   ├── WorkoutPlan/
│   └── WorkoutSession/
├── Extensions/
│   └── ClaimsPrincipalExtensions.cs
├── Migrations/           # EF Core migrations
├── models/               # Entity models
│   ├── Exercise.cs
│   ├── ExerciseLog.cs
│   ├── Session.cs
│   ├── TrainingDay.cs
│   ├── User.cs
│   ├── WorkoutPlan.cs
│   └── WorkoutSession.cs
├── Services/
│   ├── AuthService.cs
│   └── IAuthService.cs
├── Program.cs            # Application entry point
└── appsettings.json      # Configuration
```

### Data Models

#### User
- `Id` (GUID) - Primary key
- `Username` (string) - Unique username
- `Email` (string) - User email
- `PasswordHash` (string) - BCrypt hashed password
- `CreatedAt` (DateTime) - Account creation timestamp

#### WorkoutPlan
- `Id` (string) - Primary key
- `Name` (string) - Plan name
- `Description` (string) - Optional description
- `IsActive` (bool) - Active plan flag
- `UserId` (GUID) - Foreign key to User
- `TrainingDays` - Navigation property

#### TrainingDay
- `Id` (string) - Primary key
- `Name` (string) - Day name (e.g., "Push Day")
- `Order` (int) - Display order
- `WorkoutPlanId` (string) - Foreign key
- `Exercises` - Navigation property

#### Exercise
- `Id` (string) - Primary key
- `Name` (string) - Exercise name
- `Sets` (int) - Number of sets
- `Reps` (int) - Target repetitions
- `Weight` (decimal) - Target weight
- `Order` (int) - Display order
- `TrainingDayId` (string) - Foreign key

#### WorkoutSession
- `Id` (string) - Primary key
- `UserId` (GUID) - Foreign key to User
- `TrainingDayId` (string) - Foreign key
- `StartTime` (DateTime) - Session start
- `EndTime` (DateTime?) - Session end
- `ExerciseLogs` - Navigation property

#### ExerciseLog
- `Id` (string) - Primary key
- `ExerciseId` (string) - Foreign key
- `WorkoutSessionId` (string) - Foreign key
- `Sets` (int) - Completed sets
- `Reps` (int) - Completed reps
- `Weight` (decimal) - Used weight

### Authentication

The application uses JWT (JSON Web Token) authentication:

1. **Token Generation**: Tokens are generated on successful login with configurable expiration
2. **Token Validation**: Validates issuer, audience, lifetime, and signing key
3. **Token Storage**: 
   - React Native: Stored in AsyncStorage with Bearer header
   - Web: Stored in HTTP-only cookies (fallback)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/workoutplans` | GET | Get user's workout plans |
| `/api/workoutplans` | POST | Create workout plan |
| `/api/workoutplans/{id}` | PUT | Update workout plan |
| `/api/workoutplans/{id}` | DELETE | Delete workout plan |
| `/api/workoutplans/{id}/activate` | POST | Activate plan |
| `/api/trainingdays/{id}` | GET | Get training day |
| `/api/trainingdays/{id}` | PUT | Update training day |
| `/api/exercises/{id}` | PUT | Update exercise |
| `/api/workoutsessions` | GET | Get workout sessions |
| `/api/workoutsessions` | POST | Create workout session |
| `/api/health` | GET | Health check |

---

## Frontend Architecture

### Project Structure

```
frontend/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home
│   │   ├── plans.tsx      # Workout plans
│   │   ├── history.tsx    # Workout history
│   │   └── progress.tsx   # Progress tracking
│   ├── day-exercise/
│   ├── manage-plan/
│   ├── workout-session/
│   └── create-plan.tsx
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/
│   │   └── api.ts        # API configuration
│   ├── hooks/            # Custom React hooks
│   ├── providers/        # Context providers
│   ├── screens/          # Screen components
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── assets/               # Static assets
```

### Styling

The application uses **NativeWind** (Tailwind CSS for React Native):

- Utility-first CSS approach
- Consistent design system
- Dark theme with purple accent colors
- Responsive design patterns

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#030014` | Main background |
| Card | `slate-800` | Card backgrounds |
| Primary | `#AB8BFF` | Accent color, active states |
| Text Primary | `white` | Main text |
| Text Secondary | `#9ca4ab` | Secondary text |
| Success | `green-600` | Success states |
| Error | `red-600` | Error states |

### State Management

- **React Context**: Global state (Auth, User data)
- **React Hook Form**: Form state management
- **Local State**: Component-level state with useState
- **AsyncStorage**: Persistent local storage

### Navigation

Using **Expo Router** with file-based routing:

- `(auth)` - Authentication group (login, register)
- `(tabs)` - Main app tab navigation
- Dynamic routes: `[id].tsx` pattern for parameterized routes

---

## Security Considerations

1. **Password Hashing**: BCrypt with salt
2. **JWT Tokens**: Short expiration, signed with secret key
3. **CORS**: Configured for specific origins
4. **Input Validation**: Server-side validation with ModelState
5. **Secure Storage**: AsyncStorage for tokens (consider SecureStore for production)

---

## Development Tools

### Backend
- Visual Studio / VS Code
- .NET CLI
- Entity Framework CLI
- Swagger UI (development)

### Frontend
- VS Code
- Expo CLI
- Metro Bundler
- React Native Debugger

---

## Database

### SQLite Configuration

The application uses SQLite for data persistence:

```csharp
var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "powerplan.db");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));
```

### Migrations

Entity Framework Core migrations are used for database schema management:

```bash
# Create migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update
```
