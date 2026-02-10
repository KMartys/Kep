# Kepware Config Manager

Aplikacja webowa do zarządzania konfiguracją Kepware Server przez Configuration API. Umożliwia dodawanie, modyfikację i usuwanie channeli Modbus, urządzeń, grup tagów i tagów.

## 📋 Funkcje

- ✅ Zarządzanie **Channels** (Modbus TCP/IP, Modbus RTU, Simulator)
- ✅ Zarządzanie **Devices** (urządzenia z IP + Slave ID)
- ✅ Zarządzanie **Tag Groups** (grupy organizacyjne)
- ✅ Zarządzanie **Tags** (tagi z adresami Modbus i typami danych)
- ✅ Hierarchiczna nawigacja: Channel → Device → Tag Group → Tag
- ✅ Intuicyjny interfejs React
- ✅ REST API w Python/Flask
- ✅ Integracja z Kepware Configuration API

## 🚀 Szybki start

### Automatyczna instalacja (Windows)

```batch
git clone https://github.com/KMartys/Kep.git
cd Kep
install.bat
```

Skrypt automatycznie:
- Pobierze i zainstaluje Python 3.11+ (jeśli brakuje)
- Pobierze i zainstaluje Node.js 20+ (jeśli brakuje)
- Utworzy środowisko wirtualne Python
- Zainstaluje wszystkie zależności
- Przygotuje projekt do uruchomienia

### Uruchomienie

```batch
start_all.bat
```

Aplikacja będzie dostępna na:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📦 Wymagania

- **Python 3.9+** (automatycznie instalowany przez skrypt)
- **Node.js 16+** (automatycznie instalowany przez skrypt)
- **Kepware Server** (ThingWorx Kepware Server lub KEPServerEX) z włączonym Configuration API

## ⚙️ Konfiguracja Kepware

1. Uruchom Kepware Server
2. Przejdź do **Settings** → **Configuration API Service**
3. Zaznacz **Enable Configuration API Service**
4. Ustaw port (domyślnie **57412** dla HTTP, **57512** dla HTTPS)
5. Zapisz i zrestartuj Kepware
6. Zaloguj się w aplikacji używając credentials z Kepware (domyślnie: `Administrator` bez hasła)

## 📁 Struktura projektu

```
Kep/
├── backend/
│   ├── app.py              # Backend Flask z REST API
│   ├── requirements.txt    # Zależności Python
│   └── venv/              # Środowisko wirtualne (generowane)
├── frontend/
│   ├── src/
│   │   ├── App.js         # Główna aplikacja React
│   │   └── index.js       # Entry point
│   ├── public/
│   ├── package.json       # Konfiguracja React
│   └── node_modules/      # Zależności (generowane)
├── install.bat            # Skrypt instalacyjny
├── start_backend.bat      # Uruchom backend
├── start_frontend.bat     # Uruchom frontend
├── start_all.bat          # Uruchom wszystko
├── update_code.bat        # Pomoc w aktualizacji
├── .gitignore
└── README.md
```

## 🔧 Ręczna instalacja

### Backend (Python + Flask)

```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend (React)

```batch
cd frontend
npm install
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/login` - Logowanie do Kepware

### Channels
- `GET /api/channels` - Lista channeli
- `POST /api/channels` - Dodaj channel
- `PUT /api/channels/{name}` - Aktualizuj channel
- `DELETE /api/channels/{name}` - Usuń channel

### Devices
- `GET /api/channels/{channel}/devices` - Lista devices
- `POST /api/channels/{channel}/devices` - Dodaj device
- `PUT /api/channels/{channel}/devices/{device}` - Aktualizuj device
- `DELETE /api/channels/{channel}/devices/{device}` - Usuń device

### Tag Groups
- `GET /api/channels/{channel}/devices/{device}/taggroups` - Lista grup
- `POST /api/channels/{channel}/devices/{device}/taggroups` - Dodaj grupę
- `DELETE /api/channels/{channel}/devices/{device}/taggroups/{group}` - Usuń grupę

### Tags
- `GET /api/channels/{channel}/devices/{device}/taggroups/{group}/tags` - Lista tagów
- `POST /api/channels/{channel}/devices/{device}/taggroups/{group}/tags` - Dodaj tag
- `PUT /api/channels/{channel}/devices/{device}/taggroups/{group}/tags/{tag}` - Aktualizuj tag
- `DELETE /api/channels/{channel}/devices/{device}/taggroups/{group}/tags/{tag}` - Usuń tag

### Health
- `GET /api/health` - Status aplikacji

## 🐛 Troubleshooting

### Backend nie może połączyć się z Kepware
- Sprawdź czy Kepware Server jest uruchomiony
- Sprawdź czy Configuration API jest włączone w ustawieniach
- Sprawdź port (domyślnie 57412)
- Sprawdź firewall - port musi być otwarty
- Sprawdź credentials użytkownika

### Frontend nie łączy się z backendem
- Sprawdź czy backend działa: http://localhost:5000/api/health
- Sprawdź czy w konsoli przeglądarki nie ma błędów CORS
- Sprawdź czy oba serwery są uruchomione

### Python/Node.js nie został zainstalowany
- Uruchom ponownie terminal/CMD
- Sprawdź zmienne środowiskowe PATH
- Zrestartuj komputer
- Zainstaluj ręcznie z oficjalnych stron

### Błędy związane z kepconfig
- Upewnij się że używasz Python 3.9+
- Zaktualizuj: `pip install --upgrade kepconfig`
- Sprawdź połączenie z internetem podczas instalacji

## 📚 Dokumentacja

- [Kepware ConfigAPI SDK](https://ptcinc.github.io/Kepware-ConfigAPI-SDK-Python/)
- [Kepware Support](https://www.ptc.com/en/support)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)

## 🔐 Bezpieczeństwo

- Aplikacja działa lokalnie (localhost)
- Backend i Kepware powinny być na tym samym serwerze
- Dla produkcji rozważ użycie HTTPS i autoryzacji
- Nie udostępniaj credentials Kepware publicznie

## 🤝 Wkład

Zgłoszenia błędów i propozycje funkcji są mile widziane!

1. Utwórz Fork projektu
2. Stwórz branch z funkcją (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📝 Licencja

MIT License - szczegóły w pliku LICENSE

## 👤 Autor

Krzysztof Martys - [@KMartys](https://github.com/KMartys)

## 🙏 Podziękowania

- [PTC Inc.](https://www.ptc.com/) za Kepware Configuration API SDK
- Społeczność Open Source za wspaniałe narzędzia