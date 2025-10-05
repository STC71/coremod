@echo off
echo ========================================
echo    CoreMod - Despliegue Automático
echo ========================================
echo.

echo [1/4] Verificando dependencias...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no está instalado
    pause
    exit /b 1
)

echo [2/4] Iniciando servidor local...
echo Servidor disponible en: http://localhost:4343
echo.
echo Aplicación CoreMod:
echo   - Aplicación Principal: http://localhost:4343/index.html
echo.
echo Características de Producción:
echo   - Diseño paramétrico de módulos espaciales
echo   - Motor WebGL nativo optimizado
echo   - Generación procedimental en tiempo real
echo   - Sistema de evaluación avanzado (8 áreas)
echo   - Arrastre y movimiento 3D fluido
echo   - Sistema de interconexión de módulos
echo   - Redimensionamiento dinámico
echo   - Detección de colisiones automática
echo   - Controles de cámara profesionales
echo   - Módulos espaciales realistas (7 tipos)
echo   - Evaluación por hábitat (LEO/Luna/Marte)
echo   - Parámetros de salud física y mental
echo   - Gestión de recursos y ahorro energético
echo   - Interfaz optimizada para producción
echo.

echo [3/4] Opciones de despliegue:
echo.
echo 1. Vercel (Recomendado)
echo    - Instalar: npm i -g vercel
echo    - Desplegar: vercel
echo.
echo 2. GitHub Pages
echo    - Instalar: npm i -g gh-pages
echo    - Desplegar: npm run deploy:github
echo.
echo 3. Netlify
echo    - Arrastrar carpeta a netlify.com
echo.

echo [4/4] Iniciando servidor...
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

python -m http.server 4343
