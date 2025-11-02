# 🚀 Space Invaders - Retro Edition

Un clon moderno del clásico Space Invaders desarrollado con JavaScript vanilla, Canvas API y Web Audio API.

## 📋 Descripción

Space Invaders Retro Edition es una recreación del icónico juego arcade que captura la esencia retro con gráficos vectoriales y efectos de sonido sintetizados. El juego incluye mecánicas clásicas junto con características modernas como sistema de niveles, power-ups y efectos visuales.

## ✨ Características

### Jugabilidad
- **Sistema de niveles progresivos** con dificultad incremental
- **5 filas de enemigos** (50 invasores por nivel)
- **4 escudos destructibles** para protección táctica
- **OVNIs especiales** que aparecen aleatoriamente
- **Sistema de power-ups** (60% de probabilidad al destruir OVNIs):
  - ⚡ **Disparo Rápido**: Aumenta la velocidad de disparo
  - 🛡️ **Reparar Escudos**: Restaura la salud de los escudos
  - ❤️ **Vida Extra**: Otorga una vida adicional
- **3 vidas** por partida
- **Sistema de pausa** (P o ESC)

### Efectos Visuales
- Animación de pérdida de vida con efectos de partículas
- Efecto de sacudida de pantalla al recibir daño
- Parpadeo del jugador al ser golpeado
- Transiciones suaves entre niveles
- Indicador visual de salud en escudos (degradado de color)

### Audio
- Sistema de audio sintetizado con Web Audio API
- Efectos de sonido para:
  - Disparo del jugador
  - Disparo enemigo
  - Explosiones
  - Daño al jugador
  - OVNIs
  - Power-ups
  - Nivel completado
- Activación manual de audio (requerido por políticas del navegador)

## 🎮 Controles

| Acción | Teclas |
|--------|--------|
| Mover izquierda | ← o A |
| Mover derecha | → o D |
| Disparar | Espacio |
| Pausar | P o ESC |

## 🚀 Cómo Ejecutar

1. Clona o descarga el repositorio
2. Abre `index.html` en un navegador moderno
3. Haz clic en "INICIAR JUEGO"
4. Haz clic en el prompt de sonido para activar el audio

**Nota**: El juego requiere un servidor web para funcionalidad completa. Puedes usar:
```bash
# Python 3
python -m http.server 8000

# Node.js con http-server
npx http-server
```

## 🎯 Mecánicas del Juego

### Sistema de Puntuación
- Enemigos: 10-50 puntos (según fila)
- OVNIs: 50-150 puntos (aleatorio)

### Dificultad Progresiva
- La velocidad de los enemigos aumenta por nivel (+0.3 por nivel)
- La velocidad aumenta al eliminar enemigos (más enemigos muertos = más rápidos)
- Intervalo de disparo enemigo: 800ms

### Límites
- Máximo 3 proyectiles del jugador simultáneos
- Los enemigos disparan aleatoriamente
- Los OVNIs aparecen con 15% de probabilidad cada 3 segundos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 🙏 Créditos

Inspirado en el clásico Space Invaders (1978) de Tomohiro Nishikado.

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025