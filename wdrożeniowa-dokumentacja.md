# PowerPlan — Dokumentacja wdrożeniowa (uruchomienie lokalne)

## 1. Wymagania

### Wymagane narzędzia

- **.NET SDK 8.x**
- **Node.js >= 18**
- **pnpm >= 8**
- (opcjonalnie) Xcode / iOS Simulator lub urządzenie fizyczne z Expo Go

## 2. Instalacja zależności

### Opcja A (zalecana): instalacja wszystkiego z root

W katalogu głównym projektu:

```bash
npm run setup
```

### Opcja B: osobno

Backend:

```bash
cd backend/PowerPlanAPI
dotnet restore
```

Frontend:

```bash
cd frontend
pnpm install
```

## 3. Konfiguracja backendu

### JWT

Plik `backend/PowerPlanAPI/appsettings.json` zawiera domyślną konfigurację JWT.
Na potrzeby dev możesz zostawić wartości domyślne.

Jeśli chcesz nadpisać ustawienia tylko lokalnie, utwórz `appsettings.Development.json` w `backend/PowerPlanAPI`.

### Baza danych

Domyślnie backend używa lokalnego SQLite:

- plik: `backend/PowerPlanAPI/powerplan.db`

Reset bazy (dev):

1. zatrzymaj backend
2. usuń plik `powerplan.db`
3. uruchom backend ponownie (migracje zostaną zastosowane)

## 4. Konfiguracja frontendu (adres API)

Edytuj `frontend/src/config/api.ts` i ustaw poprawny `API_BASE_URL`:

- iOS Simulator:
  - `http://localhost:5226`
- Android Emulator:
  - `http://10.0.2.2:5226`
- Urządzenie fizyczne:
  - `http://TWOJ_IP:5226`

Uwaga: jeżeli używasz urządzenia fizycznego, upewnij się, że backend nasłuchuje na tym samym IP/porcie i że firewall nie blokuje połączeń.

## 5. Uruchomienie

### Jedną komendą (root)

```bash
npm run dev
```

To uruchamia:

- backend: `dotnet watch` (API)
- frontend: `expo start --ios` (domyślnie w skryptach projektu)

### Osobno

Backend:

```bash
cd backend/PowerPlanAPI
dotnet watch
```

Frontend:

```bash
cd frontend
npx expo start --ios
```

## 6. Weryfikacja działania

### Swagger (backend)

Po uruchomieniu backendu wejdź na:

- `http://localhost:5226/swagger`

### Aplikacja

- Zarejestruj użytkownika
- Zaloguj się
- Utwórz plan treningowy i aktywuj go
- Rozpocznij trening i zapisz go
- Sprawdź zakładki: Historia / Postęp

## 7. Najczęstsze problemy

### Aplikacja nie łączy się z backendem

- Sprawdź `frontend/src/config/api.ts` (czy wskazuje właściwy adres)
- Dla urządzenia fizycznego użyj IP komputera, nie `localhost`
- Upewnij się, że backend działa na porcie `5226`

### Błąd autoryzacji (401)

- Upewnij się, że token jest zapisany w AsyncStorage (po loginie)
- Wyloguj się i zaloguj ponownie

### CORS

Backend ma skonfigurowane CORS dla typowych adresów Expo (`localhost`, `127.0.0.1` i przykładowe IP). Jeśli zmieniasz IP, dopisz je w `backend/PowerPlanAPI/Program.cs` w polityce `AllowReactNative`.
