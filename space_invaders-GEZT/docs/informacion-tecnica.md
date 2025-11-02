# 🚀 Space Invaders - Retro Edition

## 🛠️ Tecnologías

- **HTML5 Canvas** para renderizado de gráficos
- **JavaScript ES6+** (Vanilla JS, sin frameworks)
- **Web Audio API** para síntesis de sonido
- **CSS3** para animaciones y efectos visuales

## 📁 Estructura del Proyecto

```
space-invaders/
│
├── index.html          # Estructura HTML y estilos embebidos
├── script.js           # Lógica principal del juego
└── style.css          # Estilos CSS (duplicado en HTML)
```

## 🏗️ Arquitectura del Código

### Módulos Principales

1. **CONFIG**: Objeto de configuración global con constantes del juego
2. **AudioManager**: Manejo de efectos de sonido con Web Audio API
3. **GameState**: Estado global del juego (entidades, puntuación, vidas)
4. **EntityFactory**: Factory para crear entidades del juego
5. **UI**: Actualización de elementos de interfaz
6. **PlayerController**: Control de entrada del jugador
7. **EnemyController**: Lógica de movimiento y disparo de enemigos
8. **UFOController**: Gestión de aparición de OVNIs
9. **CollisionSystem**: Detección de colisiones AABB
10. **ProjectileSystem**: Actualización de proyectiles
11. **Renderer**: Sistema de renderizado
12. **Game**: Loop principal y control del flujo

### Patrón de Diseño

El código utiliza un patrón **modular con objetos singleton**, donde cada sistema es un objeto con métodos específicos. Esto proporciona:
- Separación de responsabilidades
- Código organizado y mantenible
- Fácil extensibilidad

## 📱 Responsive Design

El juego incluye media queries para dispositivos móviles:
- Canvas adaptativo (max-width: 95vw)
- Fuentes y botones escalables
- Diseño optimizado para pantallas pequeñas

## 📊 Métricas del Código

- **Líneas de código JS**: ~870
- **Líneas de código CSS**: ~400
- **Tamaño total**: ~45KB (sin comprimir)
- **Dependencias externas**: 0
- **Compatibilidad**: Navegadores modernos (ES6+)