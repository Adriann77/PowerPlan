# PowerPlan — Dokumentacja techniczna

## 1. Cel systemu

PowerPlan to aplikacja mobilna do tworzenia planów treningowych (bloki tygodniowe), prowadzenia sesji treningowych, zapisywania obciążeń oraz podglądu historii i progresu.

## 2. Architektura (wysoki poziom)

System jest podzielony na dwa główne komponenty:

- **Backend (API)**: ASP.NET Core Web API (REST)
- **Frontend (mobile)**: React Native (Expo) + Expo Router

Komunikacja odbywa się przez HTTP/JSON. Autoryzacja oparta jest o token JWT przesyłany w nagłówku `Authorization: Bearer <token>`.

## 3. Stos technologiczny

### Backend

- **.NET 8 (ASP.NET Core Web API)**
- **Entity Framework Core 8**
- **SQLite** jako baza danych w trybie lokalnym deweloperskim (plik `powerplan.db` w `backend/PowerPlanAPI`)
- **JWT** (Microsoft.AspNetCore.Authentication.JwtBearer)
- **Swagger/OpenAPI** w środowisku developerskim

### Frontend

- **React Native** (Expo)
- **Expo Router** (routing / folder-based navigation)
- **TypeScript**
- **NativeWind / Tailwind** (style utility-first)
- **AsyncStorage** (przechowywanie tokenu JWT)

### Narzędzia i uruchamianie

- Node.js + pnpm
- `dotnet watch` (hot reload backendu)
- `expo start` (dev server frontendu)
- `concurrently` (uruchamianie backend + frontend jedną komendą z root)

## 4. Modele domenowe (skrót)

Poniżej najważniejsze encje (backend/EF Core):

- **User** — użytkownik
- **WorkoutPlan** — plan treningowy (z `WeekDuration`, `IsActive`, `CreatedAt`)
- **TrainingDay** — dzień treningowy w ramach planu
- **Exercise** — ćwiczenie w ramach dnia treningowego
- **WorkoutSession** — instancja treningu (dzień treningowy w konkretnym tygodniu)
- **ExerciseLog** — log ćwiczenia w ramach sesji (np. `StartingWeight`, `IsCompleted`, preferencja na kolejny tydzień)

## 5. Zasady tygodni i progresji

### Wyznaczanie bieżącego tygodnia

Bieżący tydzień jest liczony na podstawie daty utworzenia planu (`WorkoutPlan.CreatedAt`).

Definicja:

- Zakres 7 dni = 1 tydzień
- `Week 1` obejmuje dni od `CreatedAt` (włącznie) do `CreatedAt + 6 dni`
- `Week 2` to kolejne 7 dni itd.
- Tydzień jest ograniczony do `WeekDuration` (np. 5 tygodni)

Backend liczy to przy starcie sesji, a frontend pokazuje bieżący tydzień na ekranie głównym.

### Sugerowane obciążenia (poprzedni tydzień)

Podczas rozpoczęcia treningu frontend pobiera sugestie obciążeń z backendu:

- Najpierw próbuje znaleźć wagę z **poprzedniego tygodnia** (`weekNumber - 1`)
- Jeśli brak danych, bierze **ostatnią dostępną wagę z wcześniejszych tygodni**

## 6. Kluczowe endpointy API (skrót)

### Auth

- `POST /auth/register` — rejestracja (zwraca token)
- `POST /auth/login` — logowanie (zwraca token)
- `GET /auth/me` — weryfikacja tokenu
- `POST /auth/logout` — wylogowanie

### Plany i konfiguracja

- `GET /api/workoutplans` — lista planów użytkownika
- `POST /api/workoutplans` — tworzenie planu
- `PUT /api/workoutplans/{id}` — edycja/aktywacja planu

### Sesje treningowe

- `POST /api/sessions/start` — start sesji (backend wylicza `WeekNumber`)
- `POST /api/sessions/complete/{id}` — zapis logów ćwiczeń + zakończenie sesji
- `GET /api/sessions/history` — historia zakończonych sesji
- `GET /api/sessions/suggest-weights` — sugestie obciążeń na podstawie wcześniejszych tygodni

## 7. Bezpieczeństwo i autoryzacja

- Token JWT jest generowany na backendzie.
- Frontend przechowuje token w AsyncStorage.
- Każde żądanie do chronionych endpointów dodaje nagłówek `Authorization: Bearer <token>`.

## 8. Konfiguracja

### Backend

- `backend/PowerPlanAPI/appsettings.json` zawiera sekcję `Jwt` (secret/issuer/audience).
- Lokalna baza danych to SQLite (`powerplan.db`).

### Frontend

- Adres API ustawiany jest w `frontend/src/config/api.ts`.

## 9. Uwagi projektowe

- Dokumentacja w root README zawiera również sekcje procesowe (zakres, DoD, harmonogram, ryzyka).
- W repozytorium mogą występować ślady konfiguracji `Postgres/Supabase` w plikach konfiguracyjnych, ale aktualna implementacja backendu w dev używa SQLite.
