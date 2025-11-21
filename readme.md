# PowerPlan — System do zarządzania planem treningowym i monitorowania progresji

**Politechnika Częstochowska**  
Katedra Informatyki — Laboratorium z przedmiotu Projekt zespołowy  
Rok akademicki: 2025/2026  
Grupa: 2

---

## Spis treści

- [Wymagania systemowe](#wymagania-systemowe)
- [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
- [Uruchamianie projektu](#uruchamianie-projektu)
- [Konfiguracja](#konfiguracja)
- [Rozwiązywanie problemów](#rozwiązywanie-problemów)
- [Podsumowanie](#podsumowanie)
- [Zakres funkcjonalny](#zakres-funkcjonalny)
  - [Podstawowe funkcjonalności](#podstawowe-funkcjonalności-must-have)
  - [Opcjonalne funkcjonalności](#opcjonalne-funkcjonalności-nice-to-have)
- [Definicje ukończenia](#definicje-ukończenia-definition-of-done--dod)
- [Wymagania niefunkcjonalne](#wymagania-niefunkcjonalne)
- [Architektura i stos technologiczny](#architektura-i-stos-technologiczny)
- [Role i odpowiedzialności](#role-i-odpowiedzialności)
- [Proces wytwarzania i narzędzia](#proces-wytwarzania-i-narzędzia)
- [Harmonogram](#harmonogram--ważne-daty)
- [Zarządzanie ryzykiem](#zarządzanie-ryzykiem)
- [Dokumentacja i zasoby](#dokumentacja-i-zasoby)
- [Kontakt](#kontakt--autorzy)

---

## Wymagania systemowe

Przed rozpoczęciem pracy upewnij się, że masz zainstalowane następujące narzędzia:

### Wymagania dla Backendu

- **.NET SDK**: Wersja 8.0.416 lub nowsza
  - Pobierz z: [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
- **PostgreSQL**: Dostęp do bazy danych PostgreSQL (lokalna lub zdalna)
- **C#**: Wersja 10 lub nowsza (zawarta w .NET SDK)

### Wymagania dla Frontendu

- **Node.js**: Wersja 18.0.0 lub nowsza
  - Pobierz z: [https://nodejs.org/](https://nodejs.org/)
- **pnpm**: Wersja 8.0.0 lub nowsza
  - Instalacja: `npm install -g pnpm` lub [https://pnpm.io/installation](https://pnpm.io/installation)
- **Expo CLI**: Instalowany automatycznie wraz z zależnościami projektu

### Szybka instalacja wszystkiego

```bash
# Instalacja wszystkich zależności (backend + frontend)
npm run setup

# Uruchomienie obu serwerów jednocześnie
npm run dev
```

---

## Instalacja i konfiguracja

### Krok 1: Instalacja zależności

#### Opcja A: Instalacja wszystkiego naraz (zalecane)

Z głównego katalogu projektu wykonaj:

```bash
npm run setup
```

To polecenie automatycznie:

- Zainstaluje zależności backendu (`dotnet restore`)
- Zainstaluje zależności frontendu (`pnpm install`)

#### Opcja B: Instalacja osobno

**Backend:**

```bash
cd backend/PowerPlanAPI
dotnet restore
```

**Frontend:**

```bash
cd frontend
pnpm install
```

### Krok 2: Konfiguracja Backendu

1. Przejdź do katalogu backendu:

   ```bash
   cd backend/PowerPlanAPI
   ```

2. Utwórz plik `appsettings.Development.json` (jeśli nie istnieje):

   ```bash
   cp appsettings.json appsettings.Development.json
   ```

3. Edytuj plik `appsettings.Development.json` i wypełnij wymagane wartości:

   ```json
   {
     "Jwt": {
       "Secret": "twoj-super-tajny-klucz-jwt-minimum-32-znaki-dlugosci",
       "Issuer": "PowerPlanAPI",
       "Audience": "PowerPlanApp"
     },
     "ConnectionStrings": {
       "Postgres": "Host=twoj-host;Port=5432;Database=twoja-baza;Username=twoj-user;Password=twoje-haslo;SSL Mode=Require;Trust Server Certificate=true;Pooling=true;Keepalive=60;Command Timeout=300;"
     }
   }
   ```

   **Ważne:**

   - Klucz JWT Secret musi mieć minimum 32 znaki (128 bitów) ze względów bezpieczeństwa
   - Możesz wygenerować bezpieczny klucz używając: `openssl rand -base64 32`

### Krok 3: Konfiguracja Frontendu

1. Przejdź do katalogu frontendu:

   ```bash
   cd frontend
   ```

2. Edytuj plik `src/config/api.ts` i zaktualizuj adres URL API w zależności od środowiska:

   **Dla iOS Simulator:**

   ```typescript
   return 'http://localhost:5226';
   ```

   **Dla Android Emulator:**

   ```typescript
   return 'http://10.0.2.2:5226';
   ```

   **Dla urządzenia fizycznego:**

   ```typescript
   // Zastąp adresem IP Twojego komputera
   return 'http://192.168.1.100:5226';
   ```

   Aby znaleźć adres IP Twojego komputera:

   - **macOS/Linux:** Użyj `ifconfig` lub `ip addr`
   - **Windows:** Użyj `ipconfig`

### Krok 4: Kompilacja Backendu (opcjonalne)

```bash
npm run build:backend
```

---

## Uruchamianie projektu

### Opcja 1: Uruchomienie obu serwerów jednocześnie (zalecane)

Z głównego katalogu projektu:

```bash
npm run dev
```

To uruchomi:

- Backend API na `http://localhost:5226` (lub `https://localhost:7286`)
- Frontend Expo dev server z automatycznym otwarciem w przeglądarce (`--web`)

### Opcja 2: Uruchomienie osobno

**Tylko Backend:**

```bash
npm run dev:backend
# lub
cd backend/PowerPlanAPI && dotnet watch
```

**Tylko Frontend:**

```bash
npm run dev:frontend
# lub
cd frontend && npx expo start --web
```

### Dostępne skrypty

| Polecenie                  | Opis                                                      |
| -------------------------- | --------------------------------------------------------- |
| `npm run setup`            | Instalacja wszystkich zależności (backend + frontend)     |
| `npm run dev`              | Uruchomienie obu serwerów w trybie deweloperskim          |
| `npm run dev:backend`      | Uruchomienie tylko backendu API                           |
| `npm run dev:frontend`     | Uruchomienie tylko frontendu (z otwarciem w przeglądarce) |
| `npm run build:backend`    | Kompilacja projektu backendu                              |
| `npm run install:all`      | Instalacja zależności dla obu projektów                   |
| `npm run install:backend`  | Instalacja zależności tylko dla backendu                  |
| `npm run install:frontend` | Instalacja zależności tylko dla frontendu                 |

---

## Konfiguracja

### Konfiguracja Backendu

Pliki konfiguracyjne backendu znajdują się w:

- `backend/PowerPlanAPI/appsettings.json` - Konfiguracja bazowa
- `backend/PowerPlanAPI/appsettings.Development.json` - Nadpisania dla środowiska deweloperskiego

**Wymagane ustawienia:**

- `Jwt:Secret` - Klucz podpisywania JWT (minimum 32 znaki)
- `Jwt:Issuer` - Nazwa wydawcy JWT
- `Jwt:Audience` - Nazwa odbiorcy JWT
- `ConnectionStrings:Postgres` - String połączenia z PostgreSQL

### Konfiguracja Frontendu

Konfiguracja API frontendu znajduje się w:

- `frontend/src/config/api.ts`

Zaktualizuj `API_BASE_URL` w zależności od środowiska deweloperskiego (patrz Krok 3 powyżej).

### Konfiguracja CORS

Backend jest skonfigurowany do akceptowania żądań z następujących źródeł:

- `http://localhost:8081`
- `http://localhost:19006`
- `http://127.0.0.1:8081`
- `http://127.0.0.1:19006`
- `exp://localhost:8081`
- `exp://127.0.0.1:8081`

Jeśli potrzebujesz dodać więcej źródeł, edytuj `backend/PowerPlanAPI/Program.cs` i zaktualizuj politykę CORS.

---

## Rozwiązywanie problemów

### Problemy z Backendem

**Problem: "JWT Secret not configured"**

- **Rozwiązanie:** Upewnij się, że plik `appsettings.Development.json` istnieje i zawiera prawidłowy `Jwt:Secret` (minimum 32 znaki)

**Problem: Błędy połączenia z bazą danych**

- **Rozwiązanie:**
  - Sprawdź string połączenia PostgreSQL w `appsettings.Development.json`
  - Upewnij się, że serwer bazy danych jest uruchomiony i dostępny

**Problem: Port już w użyciu**

- **Rozwiązanie:** Zmień port w `Properties/launchSettings.json` lub zatrzymaj proces używający portu

### Problemy z Frontendem

**Problem: "Network request failed" lub "Connection refused"**

- **Rozwiązanie:**
  - Sprawdź, czy backend działa na właściwym porcie
  - Sprawdź adres URL API w `frontend/src/config/api.ts`
  - Dla urządzeń fizycznych upewnij się, że używasz adresu IP komputera, a nie `localhost`

**Problem: Błędy parsowania JSON "Unexpected token"**

- **Rozwiązanie:** To zwykle oznacza, że backend zwrócił odpowiedź nie-JSON. Sprawdź:
  - Czy backend działa i jest dostępny
  - Czy CORS jest prawidłowo skonfigurowany
  - Czy obsługa błędów backendu działa (powinna zwracać błędy w formacie JSON)

**Problem: Problemy z Expo/metro bundler**

- **Rozwiązanie:**
  ```bash
  cd frontend
  npx expo start --clear
  ```

### Częste problemy

**Problem: Zależności się nie instalują**

- **Rozwiązanie:**
  - Backend: Upewnij się, że .NET SDK 8.0+ jest zainstalowany
  - Frontend: Upewnij się, że Node.js 18+ i pnpm 8+ są zainstalowane
  - Spróbuj usunąć `node_modules` i zainstalować ponownie

**Problem: Uwierzytelnianie nie działa**

- **Rozwiązanie:**
  - Sprawdź konfigurację JWT w backendzie
  - Sprawdź, czy tokeny są przechowywane w AsyncStorage
  - Sprawdź, czy adres URL API odpowiada Twojemu środowisku

---

## Podsumowanie

PowerPlan to mobilna aplikacja wspierająca planowanie treningów i monitorowanie progresji użytkowników siłowni. Umożliwia tworzenie spersonalizowanych planów treningowych, korzystanie z gotowych planów, rejestrowanie wykonanych ćwiczeń oraz śledzenie postępów (np. zmiany ciężarów, liczby powtórzeń, masy ciała) w formie tabel i wykresów. Celem projektu jest dostarczenie intuicyjnego, responsywnego i bezpiecznego narzędzia, które zwiększy efektywność i motywację użytkowników.

---

## Zakres funkcjonalny

### Podstawowe funkcjonalności (must-have)

#### Rejestracja i logowanie

- Użytkownik może utworzyć konto (email + hasło) i zalogować się
- Hasła są przechowywane w bezpieczny sposób (np. haszowanie)
- Walidacja danych wejściowych

#### Tworzenie planu treningowego

- Użytkownik/trener może zdefiniować plan: ćwiczenia, serie, powtórzenia, ciężary, dni treningowe
- Możliwość zapisu planu i przypisania go do użytkownika

#### Przegląd i edycja planu treningowego

- Użytkownik może przeglądać własne plany

#### Rejestracja wykonanych treningów

- Zapisywanie wykonanych ćwiczeń z parametrami (ciężar, powtórzenia, uwagi, data)

#### Przechowywanie danych historycznych

- Historia treningów dostępna do przeglądu i analizy

### Opcjonalne funkcjonalności (nice-to-have)

- Historia treningów z filtrowaniem (np. po dacie, ćwiczeniu)
- Monitorowanie progresji i wizualizacje: tabele i wykresy pokazujące progresję (np. wzrost ciężaru, liczby powtórzeń, zmiana masy ciała)
- Gotowe szablony planów treningowych udostępniane przez system
- Eksport/import planów (np. JSON/CSV)

---

## Definicje ukończenia (Definition of Done – DoD)

Dla każdego zadania/epika powinniśmy potwierdzić następujące kryteria:

- **Implementacja backendu i API:** endpointy przetestowane, dokumentacja
- **Frontend:** ekran rejestracji/logowania, ekran planu treningowego, ekran rejestracji treningu
- **Wydajność:** odpowiedzi API na typowe zapytania (np. logowanie, zapis treningu) poniżej 2 sekund przy normalnym obciążeniu (w miarę możliwości testów)
- **Dokumentacja:** instrukcja uruchomienia (README), link do repozytorium, podstawowa dokumentacja techniczna

---

## Wymagania niefunkcjonalne

- Responsywność i poprawne wyświetlanie UI na urządzeniach mobilnych i tabletach
- Czas odpowiedzi API: poniżej 2 sekund dla standardowych operacji przy normalnym obciążeniu
- Dostępność zgodna z ogólnymi zasadami WCAG (gdzie to możliwe w aplikacji mobilnej)
- Bezpieczeństwo danych użytkownika: szyfrowanie haseł, podstawowa polityka autoryzacji
- Skalowalność: separacja backendu i bazy danych (PostgreSQL) z myślą o przyszłym rozwoju

---

## Architektura i stos technologiczny

### Backend

- **Język:** C# / .NET
- **Baza danych:** PostgreSQL

### Frontend

- **Framework:** React Native
- **Stylowanie:** Tailwind
- **Zarządzanie danymi:** TanStack Query

### Infrastruktura

- **Repozytorium:** monorepo

---

## Role i odpowiedzialności

Zespół liczy 3 osoby:

| Osoba            | Rola                  | Odpowiedzialność                                                                               |
| ---------------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| Adrian Klimas    | Kierownik projektu    | Frontend (React Native + Tailwind + TanStack Query), przygotowanie części UI, integracja z API |
| Mikołaj Grądecki | Backend + baza danych | Projektowanie API, logika biznesowa, model danych (C# .NET + PostgreSQL)                       |
| Sebastian Nowak  | Backend + baza danych | Współpraca w implementacji API, migracje, bezpieczeństwo danych (C# .NET + PostgreSQL)         |

---

## Proces wytwarzania i narzędzia

- **Metodyka:** SCRUM (iteracje/sprinty, backlog, spotkania stand-up)
- **Zarządzanie zadaniami i backlogiem:** JIRA (projekt SCRUM)
- **Kontrola wersji:** Git + GitHub
- **Komunikacja:** Discord

---

## Harmonogram – ważne daty

| Data       | Ereignis                                     |
| ---------- | -------------------------------------------- |
| 19.10.2025 | Wstępne opracowanie opisu projektu aplikacji |

---

## Dokumentacja i zasoby

- **Repozytorium GitHub:** https://github.com/Adriann77/PowerPlan
- **Tablica JIRA:** https://mikolajgradecki00.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog
- **Dokumentacja techniczna:** do uzupełnienia

---

## Kontakt – Autorzy

| Osoba            | Rola                         |
| ---------------- | ---------------------------- |
| Adrian Klimas    | Frontend, kierownik projektu |
| Mikołaj Grądecki | Backend, baza danych         |
| Sebastian Nowak  | Backend, baza danych         |

# Project Task Plan (JIRA)

## Sprint 1: 20.10.2025 – 20.11.2025

### Epic: Database

- Design database schemas (SQL)
- Create initial migrations
- Implement database connection in backend
- Document database structure

### Epic: Backend

- Initialize backend project (.NET)
- Implement user registration API
- Implement user login API
- Input data validation
- Integrate with database (models, repositories)
- Unit tests for registration/login

### Epic: Frontend

- Initialize mobile project (React Native)
- Create UI for login screen
- Create UI for registration screen
- Integrate registration/login with API
- Form validation on frontend

---

## Sprint 2: 21.11.2025 – 21.12.2025

### Epic: Backend

- Implement API for creating training plans
- Implement API for editing and viewing training plans
- Implement API for logging completed workouts
- Store and provide training history
- Unit and integration tests for new endpoints
- API documentation (Swagger/OpenAPI)

### Epic: Frontend

- Create UI for training plan screen
- Create UI for workout logging screen
- Create UI for training history
- Integrate training plans and workouts with API
- Ensure responsiveness and test on multiple devices

---

## Sprint 3: 22.12.2025 – 22.01.2026

### Epic: Backend

- Implement API for progress visualization (tables, charts)
- Add ready-made training plan templates
- Implement export/import of plans (JSON/CSV)
- Optimize API performance
- Finalize technical documentation

### Epic: Frontend

- Create UI for progress visualization (tables, charts)
- Add support for training plan templates
- Add export/import functionality for plans
- Finalize user documentation
- Final testing and bug fixes
