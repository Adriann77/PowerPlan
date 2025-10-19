# PowerPlan — System do zarządzania planem treningowym i monitorowania progresji

**Politechnika Częstochowska**  
Katedra Informatyki — Laboratorium z przedmiotu Projekt zespołowy  
Rok akademicki: 2025/2026  
Grupa: 2

---

## Table of Contents

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

| Data       | Ereignis                                                     |
| ---------- | ------------------------------------------------------------ |
| 19.10.2025 | Wstępne opracowanie opisu projektu aplikacji                 |


---



## Dokumentacja i zasoby

- **Repozytorium GitHub:** https://github.com/Adriann77/PowerPlan
- **Tablica JIRA:** https://mikolajgradecki00.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog
- **Dokumentacja techniczna:** do uzupełnienia 


---

## Kontakt – Autorzy

| Osoba            | Rola                         
| ---------------- | ---------------------------- 
| Adrian Klimas    | Frontend, kierownik projektu 
| Mikołaj Grądecki | Backend, baza danych         
| Sebastian Nowak  | Backend, baza danych         
