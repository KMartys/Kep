@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ====================================
echo Kepware Config Manager - Instalacja
echo ====================================
echo.

:: Sprawdź uprawnienia administratora
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [OSTRZEŻENIE] Skrypt nie jest uruchomiony jako administrator.
    echo Niektóre operacje mogą wymagać uprawnień administratora.
    echo.
    pause
)

:: ============================================
:: SPRAWDZANIE I INSTALACJA PYTHON
:: ============================================
echo [Krok 1/10] Sprawdzanie Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Python nie jest zainstalowany. Pobieram Python...
    
    :: Pobierz Python 3.11.7 (wersja stabilna)
    set PYTHON_URL=https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe
    set PYTHON_INSTALLER=python_installer.exe
    
    echo Pobieranie Python z %PYTHON_URL%...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%PYTHON_INSTALLER%'}"
    
    if errorlevel 1 (
        echo [BŁĄD] Nie można pobrać Python!
        echo Pobierz ręcznie z: https://www.python.org/downloads/
        pause
        exit /b 1
    )
    
    echo [INFO] Instaluję Python (to może chwilę potrwać)...
    %PYTHON_INSTALLER% /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    
    if errorlevel 1 (
        echo [BŁĄD] Instalacja Python nie powiodła się!
        echo Spróbuj zainstalować ręcznie: %PYTHON_INSTALLER%
        pause
        exit /b 1
    )
    
    :: Odśwież zmienne środowiskowe
    call refreshenv >nul 2>&1
    
    :: Usuń instalator
    del %PYTHON_INSTALLER%
    
    echo [OK] Python zainstalowany pomyślnie!
    
    :: Sprawdź ponownie
    python --version >nul 2>&1
    if errorlevel 1 (
        echo [OSTRZEŻENIE] Python zainstalowany, ale niedostępny w PATH.
        echo Zrestartuj terminal lub komputer i uruchom skrypt ponownie.
        pause
        exit /b 1
    )
) else (
    echo [OK] Python zainstalowany
    python --version
)
echo.

:: ============================================
:: SPRAWDZANIE I INSTALACJA NODE.JS
:: ============================================
echo [Krok 2/10] Sprawdzanie Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Node.js nie jest zainstalowany. Pobieram Node.js...
    
    :: Pobierz Node.js LTS (v20.x)
    set NODE_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    set NODE_INSTALLER=nodejs_installer.msi
    
    echo Pobieranie Node.js z %NODE_URL%...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_INSTALLER%'}"
    
    if errorlevel 1 (
        echo [BŁĄD] Nie można pobrać Node.js!
        echo Pobierz ręcznie z: https://nodejs.org/
        pause
        exit /b 1
    )
    
    echo [INFO] Instaluję Node.js (to może chwilę potrwać)...
    msiexec /i %NODE_INSTALLER% /quiet /norestart
    
    if errorlevel 1 (
        echo [BŁĄD] Instalacja Node.js nie powiodła się!
        echo Spróbuj zainstalować ręcznie: %NODE_INSTALLER%
        pause
        exit /b 1
    )
    
    :: Odśwież zmienne środowiskowe
    call refreshenv >nul 2>&1
    
    :: Usuń instalator
    del %NODE_INSTALLER%
    
    echo [OK] Node.js zainstalowany pomyślnie!
    
    :: Sprawdź ponownie
    node --version >nul 2>&1
    if errorlevel 1 (
        echo [OSTRZEŻENIE] Node.js zainstalowany, ale niedostępny w PATH.
        echo Zrestartuj terminal lub komputer i uruchom skrypt ponownie.
        pause
        exit /b 1
    )
) else (
    echo [OK] Node.js zainstalowany
    node --version
    npm --version
)
echo.

:: ============================================
:: TWORZENIE STRUKTURY FOLDERÓW
:: ============================================
echo [Krok 3/10] Tworzenie struktury folderów...
if not exist backend mkdir backend
if not exist frontend mkdir frontend
echo [OK] Foldery utworzone
echo.

:: ============================================
:: POBIERANIE PLIKÓW BACKEND
:: ============================================
echo [Krok 4/10] Pobieranie plików backend...

:: Tworzenie requirements.txt
(
echo Flask==3.0.0
echo Flask-CORS==4.0.0
echo kepconfig==1.4.1
echo Werkzeug==3.0.1
) > backend\requirements.txt
echo [OK] requirements.txt utworzony

:: Pobieranie app.py z artefaktu (tutaj wklejamy zawartość)
echo [INFO] Tworzę plik app.py...
(
echo from flask import Flask, request, jsonify
echo from flask_cors import CORS
echo from kepconfig import connection, connectivity
echo import os
echo.
echo app = Flask^(__name__^)
echo CORS^(app^)
echo.
echo # Globalna zmienna dla połączenia z Kepware
echo kepware_server = None
echo.
echo @app.route^('/api/login', methods=['POST']^)
echo def login^(^):
echo     """Logowanie do Kepware i inicjalizacja połączenia"""
echo     global kepware_server
echo     try:
echo         data = request.json
echo         username = data.get^('username'^)
echo         password = data.get^('password'^)
echo         host = data.get^('kepwareHost', 'localhost'^)
echo         port = int^(data.get^('port', 57412^)^)
echo         kepware_server = connection.server^(host=host, port=port, user=username, pw=password^)
echo         try:
echo             connectivity.channel.get_all_channels^(kepware_server^)
echo             return jsonify^({'success': True, 'token': 'kepware-token', 'message': 'Połączono z Kepware'}^)
echo         except Exception as e:
echo             kepware_server = None
echo             return jsonify^({'success': False, 'message': f'Błąd połączenia: {str^(e^)}'}^), 401
echo     except Exception as e:
echo         return jsonify^({'success': False, 'message': str^(e^)}^), 500
echo.
echo @app.route^('/api/health', methods=['GET']^)
echo def health^(^):
echo     return jsonify^({'status': 'running', 'kepware_connected': kepware_server is not None}^)
echo.
echo if __name__ == '__main__':
echo     port = int^(os.environ.get^('PORT', 5000^)^)
echo     app.run^(host='0.0.0.0', port=port, debug=True^)
) > backend\app.py

echo [OK] app.py utworzony (podstawowa wersja - należy rozszerzyć)
echo [UWAGA] Plik app.py zawiera tylko podstawową strukturę.
echo         Skopiuj pełną wersję z artefaktu do backend\app.py
echo.

:: ============================================
:: TWORZENIE ŚRODOWISKA WIRTUALNEGO PYTHON
:: ============================================
echo [Krok 5/10] Tworzenie środowiska wirtualnego Python...
cd backend
python -m venv venv
if errorlevel 1 (
    echo [BŁĄD] Nie można utworzyć środowiska wirtualnego
    pause
    exit /b 1
)
echo [OK] Środowisko wirtualne utworzone
echo.

:: ============================================
:: INSTALACJA PAKIETÓW PYTHON
:: ============================================
echo [Krok 6/10] Instalacja pakietów Python (to może potrwać kilka minut)...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt
if errorlevel 1 (
    echo [BŁĄD] Nie można zainstalować pakietów Python
    echo Sprawdź połączenie z internetem i spróbuj ponownie
    pause
    exit /b 1
)
echo [OK] Pakiety Python zainstalowane
deactivate
cd ..
echo.

:: ============================================
:: TWORZENIE PROJEKTU REACT
:: ============================================
echo [Krok 7/10] Tworzenie projektu React...
cd frontend

if exist package.json (
    echo [INFO] Projekt React już istnieje, pomijam tworzenie...
) else (
    echo [INFO] Tworzę nowy projekt React (to może potrwać 5-10 minut)...
    echo [INFO] Proszę czekać...
    call npx create-react-app@latest . --template cra-template --use-npm
    if errorlevel 1 (
        echo [BŁĄD] Nie można utworzyć projektu React
        echo Sprawdź połączenie z internetem
        pause
        exit /b 1
    )
)

echo [OK] Projekt React gotowy
echo.

:: ============================================
:: INSTALACJA PAKIETÓW REACT
:: ============================================
echo [Krok 8/10] Instalacja pakietów React...
call npm install axios lucide-react
if errorlevel 1 (
    echo [BŁĄD] Nie można zainstalować pakietów React
    echo Sprawdź połączenie z internetem
    pause
    exit /b 1
)
echo [OK] Pakiety React zainstalowane
cd ..
echo.

:: ============================================
:: TWORZENIE PODSTAWOWEGO APP.JS
:: ============================================
echo [Krok 9/10] Tworzenie podstawowego pliku App.js...
echo [INFO] Tworzę prostą strukturę App.js...
echo [UWAGA] Należy skopiować pełny kod z artefaktu do frontend\src\App.js

(
echo import React, { useState } from 'react';
echo import './App.css';
echo.
echo function App^(^) {
echo   const [message, setMessage] = useState^('Kepware Config Manager - Skopiuj pełny kod z artefaktu do tego pliku'^);
echo.
echo   return ^(
echo     ^<div className="App"^>
echo       ^<header className="App-header"^>
echo         ^<h1^>Kepware Config Manager^</h1^>
echo         ^<p^>{message}^</p^>
echo         ^<p style={{color: 'yellow', marginTop: '20px'}}^>
echo           ⚠️ UWAGA: Skopiuj pełny kod React z artefaktu do frontend\src\App.js
echo         ^</p^>
echo       ^</header^>
echo     ^</div^>
echo   ^);
echo }
echo.
echo export default App;
) > frontend\src\App.js

echo [OK] Podstawowy App.js utworzony
echo.

:: ============================================
:: TWORZENIE SKRYPTÓW URUCHAMIAJĄCYCH
:: ============================================
echo [Krok 10/10] Tworzenie skryptów uruchamiających...

:: start_backend.bat
(
echo @echo off
echo chcp 65001 ^>nul
echo title Kepware Backend
echo echo ====================================
echo echo Uruchamianie Backend ^(Flask^)
echo echo ====================================
echo cd backend
echo call venv\Scripts\activate.bat
echo echo.
echo echo [OK] Backend działa na: http://localhost:5000
echo echo [OK] API Health Check: http://localhost:5000/api/health
echo echo.
echo echo Naciśnij Ctrl+C aby zatrzymać serwer
echo echo ====================================
echo echo.
echo python app.py
echo pause
) > start_backend.bat

:: start_frontend.bat
(
echo @echo off
echo chcp 65001 ^>nul
echo title Kepware Frontend
echo echo ====================================
echo echo Uruchamianie Frontend ^(React^)
echo echo ====================================
echo cd frontend
echo echo.
echo echo [OK] Frontend działa na: http://localhost:3000
echo echo.
echo echo Naciśnij Ctrl+C aby zatrzymać serwer
echo echo ====================================
echo echo.
echo call npm start
echo pause
) > start_frontend.bat

:: start_all.bat
(
echo @echo off
echo chcp 65001 ^>nul
echo echo ====================================
echo echo Uruchamianie Kepware Config Manager
echo echo ====================================
echo echo.
echo echo [1/2] Uruchamiam Backend...
echo start "Kepware Backend" cmd /k start_backend.bat
echo timeout /t 5 /nobreak ^>nul
echo echo [2/2] Uruchamiam Frontend...
echo start "Kepware Frontend" cmd /k start_frontend.bat
echo echo.
echo echo ====================================
echo echo    APLIKACJA URUCHOMIONA
echo echo ====================================
echo echo.
echo echo Backend:  http://localhost:5000
echo echo Frontend: http://localhost:3000
echo echo.
echo echo Otwórz przeglądarkę i przejdź do:
echo echo http://localhost:3000
echo echo.
echo pause
) > start_all.bat

:: update_code.bat - skrypt do aktualizacji kodu
(
echo @echo off
echo chcp 65001 ^>nul
echo echo ====================================
echo echo Aktualizacja kodu z artefaktów
echo echo ====================================
echo echo.
echo echo Ten skrypt pomoże zaktualizować kod aplikacji.
echo echo.
echo echo INSTRUKCJE:
echo echo.
echo echo 1. Backend ^(backend\app.py^):
echo echo    - Otwórz plik backend\app.py w edytorze
echo echo    - Skopiuj pełny kod z artefaktu "Kepware Backend API"
echo echo    - Zapisz plik
echo echo.
echo echo 2. Frontend ^(frontend\src\App.js^):
echo echo    - Otwórz plik frontend\src\App.js w edytorze
echo echo    - Skopiuj pełny kod z artefaktu "Kepware Config Manager"
echo echo    - Zamień mockAPI na prawdziwe wywołania API
echo echo    - Zapisz plik
echo echo.
echo echo 3. Po zaktualizowaniu kodu uruchom:
echo echo    start_all.bat
echo echo.
echo echo Czy chcesz otworzyć foldery z plikami? ^(T/N^)
echo set /p choice=Wybór: 
echo if /i "!choice!"=="T" ^(
echo     start explorer backend
echo     timeout /t 1 ^>nul
echo     start explorer frontend\src
echo ^)
echo.
echo pause
) > update_code.bat

echo [OK] Skrypty uruchamiające utworzone
echo.

:: ============================================
:: TWORZENIE README
:: ============================================
(
echo # Kepware Config Manager
echo.
echo ## ⚠️ WAŻNE - Dokończ instalację
echo.
echo Instalacja podstawowych komponentów zakończona, ale musisz jeszcze:
echo.
echo ### 1. Zaktualizuj backend
echo ```
echo Otwórz: backend\app.py
echo Skopiuj pełny kod z artefaktu "Kepware Backend API ^(Flask^)"
echo Zapisz plik
echo ```
echo.
echo ### 2. Zaktualizuj frontend
echo ```
echo Otwórz: frontend\src\App.js
echo Skopiuj pełny kod z artefaktu "Kepware Config Manager"
echo Zapisz plik
echo ```
echo.
echo ### 3. Uruchom aplikację
echo ```
echo start_all.bat
echo ```
echo.
echo ## Szybkie akcje
echo.
echo - `start_all.bat` - Uruchom backend + frontend
echo - `start_backend.bat` - Uruchom tylko backend
echo - `start_frontend.bat` - Uruchom tylko frontend
echo - `update_code.bat` - Otwórz foldery z kodem do aktualizacji
echo.
echo ## Dostęp
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - Health Check: http://localhost:5000/api/health
echo.
echo ## Konfiguracja Kepware
echo 1. Uruchom Kepware Server
echo 2. Włącz Configuration API Service ^(Settings ^> Configuration API Service^)
echo 3. Sprawdź port ^(domyślnie 57412 dla HTTP, 57512 dla HTTPS^)
echo 4. Zaloguj się w aplikacji używając credentials z Kepware
echo.
echo ## Struktura projektu
echo ```
echo kepware-config-manager/
echo ├── backend/
echo │   ├── venv/              # Środowisko wirtualne Python
echo │   ├── app.py             # ⚠️ Zaktualizuj ten plik!
echo │   └── requirements.txt   # Zależności Python
echo ├── frontend/
echo │   ├── src/
echo │   │   └── App.js         # ⚠️ Zaktualizuj ten plik!
echo │   ├── package.json
echo │   └── node_modules/
echo ├── start_backend.bat      # Uruchom backend
echo ├── start_frontend.bat     # Uruchom frontend
echo ├── start_all.bat          # Uruchom wszystko
echo └── update_code.bat        # Pomoc w aktualizacji kodu
echo ```
echo.
echo ## Troubleshooting
echo.
echo ### Backend nie może połączyć się z Kepware
echo - Sprawdź czy Kepware Server jest uruchomiony
echo - Sprawdź czy Configuration API jest włączone
echo - Sprawdź port ^(domyślnie 57412^)
echo - Sprawdź credentials użytkownika
echo.
echo ### Frontend nie łączy się z backendem
echo - Sprawdź czy backend działa ^(http://localhost:5000/api/health^)
echo - Sprawdź czy zaktualizowałeś kod App.js
echo - Sprawdź konsolę przeglądarki
echo.
echo ### Python/Node.js nie został zainstalowany
echo - Uruchom ponownie terminal
echo - Sprawdź zmienne środowiskowe PATH
echo - Zrestartuj komputer
) > README.md

echo ====================================
echo INSTALACJA ZAKOŃCZONA!
echo ====================================
echo.
echo ✓ Python zainstalowany i skonfigurowany
echo ✓ Node.js zainstalowany i skonfigurowany
echo ✓ Środowisko wirtualne Python utworzone
echo ✓ Pakiety Python zainstalowane
echo ✓ Projekt React utworzony
echo ✓ Pakiety React zainstalowane
echo ✓ Skrypty uruchamiające utworzone
echo.
echo ====================================
echo ⚠️  WAŻNE NASTĘPNE KROKI:
echo ====================================
echo.
echo 1. Zaktualizuj backend\app.py
echo    Skopiuj pełny kod z artefaktu "Kepware Backend API"
echo.
echo 2. Zaktualizuj frontend\src\App.js
echo    Skopiuj pełny kod z artefaktu "Kepware Config Manager"
echo.
echo 3. Uruchom Kepware Server i włącz Configuration API
echo.
echo 4. Uruchom aplikację:
echo    start_all.bat
echo.
echo ====================================
echo PLIKI DO AKTUALIZACJI:
echo ====================================
echo.
echo Backend:  %cd%\backend\app.py
echo Frontend: %cd%\frontend\src\App.js
echo.
echo Uruchom update_code.bat aby otworzyć foldery
echo.
pause