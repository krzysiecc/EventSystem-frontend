# EventHub — wdrożenie systemu motywów (Light / Dark / Mono)

Ten pakiet podmienia **wygląd całej aplikacji** (paleta + fonty + zaokrąglenia)
bez przepisywania komponentów. Działa, bo nowe motywy używają **tych samych
nazw tokenów** co Twój dotychczasowy `index.css`, tylko z nową paletą. Dochodzi
trzeci motyw **Mono** (czarno-szaro-żółto-biały) i przełącznik motywów.

> Przeprojektowanie konkretnych ekranów (ostre karty edytorialne, scroll-story
> Studenta, panel Admina itd.) robimy osobno, etapami: **Admin → Organizator →
> Student**. Ten krok to fundament wizualny pod całą resztę.

---

## Zawartość pakietu

```
src/styles/index.css              ← ZASTĘPUJE Twój obecny plik
src/store/useThemeStore.ts        ← nowy store motywu (zustand)
src/components/ui/ThemeSwitcher.tsx← nowy komponent przełącznika
```

---

## Krok 1 — Fonty

Trzy darmowe kroje: **Syne** (display), **General Sans** (tekst), **Space Mono** (mono).
Wklej w `index.html` w `<head>` (najlepsza wydajność):

```html
<link rel="preconnect" href="https://api.fontshare.com" />
<link
  href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
  rel="stylesheet"
/>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Space+Mono:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

> Wolisz self-hosting (bez CDN)? Pobierz Syne + Space Mono z fonts.google.com,
> General Sans z fontshare.com, wrzuć do `public/fonts/` i podmień powyższe
> linki na lokalny `@font-face`. Nazwy rodzin zostają te same.

---

## Krok 2 — index.css

Podmień całą zawartość `src/styles/index.css` na plik z tego pakietu.
Co dostajesz:

- **3 motywy** jako `:root[data-theme="dark|light|mono"]` (dark = domyślny),
- tokeny typografii → klasy `font-display`, `font-sans`, `font-mono`,
- **globalne ostrzejsze rogi**: nadpisana skala `--radius-*`, więc każde
  istniejące `rounded-xl` / `rounded-lg` od razu staje się rustykalne (4–6px),
  **bez ruszania komponentów**,
- pomocnicze animacje wejścia: `.animate-rise`, `.animate-fade-in`
  (respektują `prefers-reduced-motion`).

---

## Krok 3 — lucide-react (ikony zamiast emoji)

```bash
npm i lucide-react
```

Przykład zamiany emoji na ikonę:

```tsx
// było:  <p>📅 {date}</p>
import { CalendarDays } from "lucide-react";
<p className="flex items-center gap-2">
  <CalendarDays size={15} className="text-accent-primary" /> {date}
</p>;
```

---

## Krok 4 — store + przełącznik

Skopiuj `useThemeStore.ts` i `ThemeSwitcher.tsx` do ścieżek jak wyżej
(alias `@/` masz już skonfigurowany).

---

## Krok 5 — inicjalizacja (anty-FOUC)

Żeby motyw był ustawiony **przed pierwszym malowaniem** (brak mignięcia),
dodaj malutki skrypt w `index.html`, w `<head>` **przed** `<body>`:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("eh-theme") || "dark";
      document.documentElement.setAttribute("data-theme", t);
    } catch (e) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  })();
</script>
```

I zsynchronizuj store przy starcie w `src/main.tsx` (obok auth):

```ts
import { useThemeStore } from "@/store/useThemeStore";

useAuthStore.getState().initializeFromStorage();
useThemeStore.getState().initializeFromStorage(); // ← dodaj
```

---

## Krok 6 — wstaw przełącznik do layoutów

W `DashboardLayout.tsx` — w pasku/górze obok „Wyloguj się”, oraz
w `AuthLayout.tsx` — w rogu ekranu logowania:

```tsx
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

// gdziekolwiek w nagłówku:
<ThemeSwitcher />;
```

---

## Gotowe ✅

Po tych krokach cała aplikacja chodzi w nowej palecie, z trzema motywami
i ostrzejszymi rogami. Wybór motywu zapisuje się między sesjami.

### Co dalej (kolejne pakiety kodu)

1. **Etap 1 — Admin**: nowe `Dashboard`, `ManageUsers` (tabela edytorialna),
   `AdminTokens`, `SystemLogs` (mono), `AllEvents`.
2. **Etap 2 — Organizator**: dashboard, kreator/edycja wydarzeń, lista
   uczestników, skaner.
3. **Etap 3 — Student**: scroll-story (GSAP), duże karty wydarzeń, bilet/QR,
   profil + ekran Auth z animowaną geometrią.

> Dla animacji scrolla Studenta dojdzie `npm i gsap` (+ `framer-motion`
> do mikrointerakcji, jeśli chcesz) — opiszę w pakiecie Etapu 3.
