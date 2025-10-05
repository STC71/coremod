# 🚀 CoreMod - Diseñador de Hábitats Espaciales

**CoreMod** es una aplicación web avanzada para el diseño paramétrico y evaluación de viabilidad de módulos espaciales para misiones de larga duración.

## ✨ Características Principales

### 🎨 Visualización 3D Avanzada
- **Motor WebGL nativo** optimizado para rendimiento
- **Generación procedimental** de módulos en tiempo real
- **Arrastre y movimiento** fluido en espacio 3D
- **Redimensionamiento dinámico** con controles visuales
- **Sistema de interconexión** entre módulos
- **Controles de cámara profesionales** (rotación, zoom, pan)
- **Vistas predefinidas** (frontal, lateral, superior, isométrica)

### 🧠 Sistema de Evaluación Avanzado
- **8 áreas de evaluación** principales:
  - 🏥 Salud Física (nutrición, ejercicio, sueño, ritmos circadianos)
  - 🧠 Salud Mental (privacidad, conexión social, estímulo sensorial)
  - 🌍 Confort Ambiental (estética, iluminación, sonido, ocio)
  - 🛡️ Seguridad y Confiabilidad (sistemas, autonomía, emergencias)
  - 📦 Gestión de Recursos (almacenamiento, eficiencia, consumo)
  - ⚡ Ahorro Energético (generación, consumo, eficiencia)
  - 💪 Ejercicio y Bienestar (espacio, equipamiento, frecuencia)
  - 👥 Aspectos Sociales y Psicológicos (interacción, identidad)

### 🌍 Soporte Multi-Hábitat
- **LEO** (Órbita Baja Terrestre): Comunicación excelente, reabastecimiento frecuente
- **Luna**: Comunicación moderada, propósito alto, ejercicio crítico
- **Marte**: Comunicación limitada, autonomía máxima, desafíos psicológicos

### 🔧 Módulos Espaciales Realistas
- **HALO**: Módulo de hábitat y logística
- **ECLSS**: Sistema de soporte vital
- **Power**: Módulo de energía solar
- **Laboratorio**: Módulo de investigación científica
- **Docking**: Módulo de acoplamiento
- **Ejercicio**: Módulo de ejercicio y acondicionamiento
- **Almacenamiento**: Módulo de almacenamiento y logística

## 🚀 Instalación y Uso

### Requisitos
- Python 3.x
- Navegador web moderno con soporte WebGL

### Instalación Local
```bash
# Clonar el repositorio
git clone <repository-url>
cd nasaspaceapps

# Ejecutar servidor local
python -m http.server 4343

# Abrir en navegador
http://localhost:4343/index.html
```

### Despliegue en Producción
```bash
# Usar el script de despliegue
./deploy.bat

# O manualmente con Vercel
npm i -g vercel
vercel --prod
```

## 🎯 Uso de la Aplicación

### 1. Configuración Inicial
- Seleccionar hábitat objetivo (LEO/Luna/Marte)
- Definir número de tripulantes
- Configurar parámetros de diseño

### 2. Diseño de Módulos
- Arrastrar módulos desde el panel lateral
- Conectar módulos mediante puertos de acoplamiento
- Redimensionar módulos según necesidades
- Visualizar en tiempo real con controles de cámara

### 3. Evaluación de Viabilidad
- Sistema automático de evaluación por áreas
- Puntuaciones normalizadas (0-100%)
- Umbrales de calidad (Excelente/Bueno/Regular/Pobre)
- Recomendaciones basadas en deficiencias

### 4. Análisis del Sistema
- Eficiencia general del hábitat
- Balance energético (generación vs consumo)
- Capacidad de almacenamiento total
- Optimización de recursos

## 🔬 Algoritmo de Evaluación

### Factores Considerados
- **Parámetros del módulo**: Dimensiones, masa, consumo, eficiencia
- **Condiciones del hábitat**: Radiación, gravedad, temperatura, comunicación
- **Factores humanos**: Salud física, mental, social, psicológica
- **Factores técnicos**: Seguridad, mantenimiento, recursos, energía

### Métricas de Calidad
- **Excelente**: ≥85% - Cumple todos los requisitos óptimamente
- **Bueno**: 70-84% - Cumple requisitos básicos adecuadamente
- **Regular**: 55-69% - Cumple requisitos mínimos con limitaciones
- **Pobre**: <55% - No cumple requisitos mínimos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **3D Engine**: WebGL nativo (sin dependencias externas)
- **Matemáticas**: Álgebra lineal para transformaciones 3D
- **Algoritmos**: Evaluación multi-criterio con pesos normalizados
- **Servidor**: Python HTTP Server / Vercel

## 📊 Parámetros de Evaluación

### Salud Física
- Nutrición equilibrada, ejercicio regular, sueño y ritmos circadianos
- Consumo de aire y agua, espacio de ejercicio, acceso de mantenimiento

### Salud Mental
- Espacios privados, conexión social, estímulo sensorial positivo
- Propósito y motivación, comunicación con la Tierra
- Apoyo psicológico remoto, identidad y sentido de pertenencia

### Confort Ambiental
- Entorno estético y confortable, iluminación natural simulada
- Sonido ambiental controlado, tiempo de ocio y recreación
- Flexibilidad del entorno, control térmico y atmosférico

### Seguridad y Confiabilidad
- Seguridad y confianza en los sistemas, autonomía personal
- Evacuación de emergencia, protección radiológica y contra polvo
- Facilidad de mantenimiento y reparación

## 🎨 Interfaz de Usuario

- **Diseño minimalista** con colores corporativos de NASA
- **Efectos glassmorphism** para elementos modernos
- **Navegación intuitiva** con controles táctiles y de teclado
- **Información detallada** organizada por categorías
- **Feedback visual** inmediato para todas las acciones

## 🔧 Controles

### Cámara
- **Ratón**: Rotación orbital, zoom con rueda
- **Teclado**: WASD (movimiento), QE (elevación), R (reset)
- **Vistas**: Frontal, lateral, superior, isométrica

### Módulos
- **Arrastrar**: Click y arrastrar para mover
- **Redimensionar**: Handles visuales o rueda del ratón
- **Conectar**: Click en puertos de acoplamiento
- **Seleccionar**: Click en módulo para información detallada

## 📈 Rendimiento

- **Carga rápida**: Sin dependencias externas
- **Renderizado optimizado**: 60 FPS en hardware moderno
- **Memoria eficiente**: Gestión automática de recursos WebGL
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 🤝 Contribuciones

Este proyecto está diseñado para la comunidad educativa STEAM y aspirantes a astronautas. Las contribuciones son bienvenidas para:

- Nuevos tipos de módulos espaciales
- Mejoras en el algoritmo de evaluación
- Optimizaciones de rendimiento
- Nuevas características de visualización

## 📄 Licencia

Proyecto educativo desarrollado para NASA Space Apps Challenge.

---

**CoreMod** - Diseñando el futuro de los hábitats espaciales 🚀