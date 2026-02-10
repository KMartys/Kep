# 📤 Instrukcja wrzucenia projektu na GitHub

## 🎯 Struktura plików do wrzucenia

Utwórz następującą strukturę folderów i plików:

```
Kep/
├── .gitignore                    # ✅ Skopiuj z artefaktu
├── README.md                     # ✅ Skopiuj z artefaktu
├── install.bat                   # ✅ Skopiuj z artefaktu
├── backend/
│   ├── app.py                    # ✅ Skopiuj z artefaktu "Kepware Backend API"
│   └── requirements.txt          # ✅ Skopiuj z artefaktu
└── frontend/
    ├── public/
    │   └── index.html            # ✅ Skopiuj z artefaktu
    ├── src/
    │   ├── App.js                # ✅ Skopiuj z artefaktu "Kepware Config Manager"
    │   ├── index.js              # ✅ Skopiuj z artefaktu
    │   └── index.css             # ✅ Skopiuj z artefaktu
    └── package.json              # ✅ Skopiuj z artefaktu
```

## 📝 Krok po kroku

### 1. Usuń stare pliki z repo

W Twoim obecnym repo `https://github.com/KMartys/Kep`:

```bash
cd Kep
git rm kepware-backend.py
git rm kepware-config-manager.tsx
git commit -m "Usuń stare pliki przed reorganizacją"
git push
```

### 2. Utwórz lokalną strukturę folderów

```bash
# W głównym folderze Kep
mkdir backend
mkdir frontend
mkdir frontend\src
mkdir frontend\public
```

### 3. Skopiuj pliki z artefaktów

#### Główny folder:
- `.gitignore` → kopiuj całość z artefaktu
- `README.md` → kopiuj całość z artefaktu  
- `install.bat` → kopiuj całość z artefaktu

#### Folder `backend/`:
- `app.py` → skopiuj z artefaktu **"Kepware Backend API (Flask)"**
- `requirements.txt` → skopiuj z artefaktu **"backend/requirements.txt"**

#### Folder `frontend/`:
- `package.json` → skopiuj z artefaktu **"frontend/package.json"**

#### Folder `frontend/public/`:
- `index.html` → skopiuj z artefaktu **"frontend/public/index.html"**

#### Folder `frontend/src/`:
- `App.js` → skopiuj z artefaktu **"Kepware Config Manager"**
- `index.js` → skopiuj z artefaktu **"frontend/src/index.js"**
- `index.css` → skopiuj z artefaktu **"frontend/src/index.css"**

### 4. Dodaj pliki do Git

```bash
git add .
git status  # Sprawdź co zostanie dodane
```

Powinno pokazać:
```
new file:   .gitignore
new file:   README.md
new file:   install.bat
new file:   backend/app.py
new file:   backend/requirements.txt
new file:   frontend/package.json
new file:   frontend/public/index.html
new file:   frontend/src/App.js
new file:   frontend/src/index.js
new file:   frontend/src/index.css
```

### 5. Commit i push

```bash
git commit -m "Kompletna struktura projektu z instalatorem"
git push origin main
```

### 6. Sprawdź na GitHub

Otwórz https://github.com/KMartys/Kep i sprawdź czy wszystkie pliki są na miejscu.

## ✅ Checklist przed pushem

- [ ] `.gitignore` istnieje (ignoruje venv/, node_modules/, etc.)
- [ ] `README.md` ma pełną dokumentację
- [ ] `install.bat` to najnowsza wersja ze skryptem klonowania
- [ ] `backend/app.py` zawiera pełny kod API (nie skróconą wersję)
- [ ] `backend/requirements.txt` zawiera wszystkie zależności
- [ ] `frontend/package.json` jest kompletny
- [ ] `frontend/src/App.js` używa PRAWDZIWEGO API (nie mockAPI)
- [ ] Wszystkie pliki są w odpowiednich folderach

## 🔄 Aktualizacja App.js - WAŻNE!

Przed pushowaniem upewnij się, że `frontend/src/App.js` używa **prawdziwych wywołań API**, a nie `mockAPI`!

W pliku `App.js` zamień:
```javascript
const mockAPI = { ... }
```

Na:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
  },
  // ... reszta endpointów
};
```

I zamień wszystkie `mockAPI.` na `api.`

## 🚀 Po pushowaniu

Po wrzuceniu na GitHub, użytkownicy będą mogli zainstalować projekt jedną komendą:

```bash
git clone https://github.com/KMartys/Kep.git
cd Kep
install.bat
```

## 🐛 Troubleshooting

### Git nie widzi nowych folderów
```bash
git add --all
git status
```

### Chcę zacząć od nowa
```bash
# UWAGA: To usunie lokalne zmiany!
git reset --hard HEAD
git clean -fd
```

### Chcę zobaczyć co się zmieniło
```bash
git diff
git status
```

## 📞 Potrzebujesz pomocy?

Jeśli coś nie działa:
1. Sprawdź `git status` - co jest staged
2. Sprawdź `.gitignore` - czy nie ignoruje potrzebnych plików
3. Sprawdź strukturę folderów - czy wszystko jest na miejscu
4. Uruchom `git add --all` i spróbuj ponownie