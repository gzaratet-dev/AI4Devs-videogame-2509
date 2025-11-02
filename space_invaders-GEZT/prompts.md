
# Prompts ejecutados durante el proceso.

Modelos utilizados:
- Gemini 2.5 flash con la tarea de crear otros prompts (meta prompting)
- Sonnet 4.5 y Haiku 4.5 para ejecutar los meta prompting.
- sonnet 3.7 para depurar bugs
---

## Prompt 0

### Space Invaders Game

El objetivo principal del juego Space Invaders es destruir oleadas de alienígenas descendentes con un cañón láser para conseguir la mayor cantidad de puntos posible y evitar que los invasores lleguen a la parte inferior de la pantalla.

A continuación se detallan las reglas básicas del juego:

### Elementos del juego

 - **Cañón del jugador:** Es la nave que controlas en la parte inferior de
   la pantalla, que solo puede moverse horizontalmente hacia la
   izquierda y la derecha.
   
  - **Invasores alienígenas:** Comienzan en una formación rectangular y se
   mueven lateralmente por la pantalla, descendiendo una fila cada vez
   que llegan a un borde lateral.
   
  - **Escudos (búnkeres):** Hay cuatro estructuras defensivas estacionarias
   que protegen tu cañón. Se van destruyendo gradualmente con los
   disparos, tanto de los alienígenas como los tuyos.
   
 -  **Nave misteriosa (OVNI):** Ocasionalmente, un platillo volador rojo se
   desplaza por la parte superior de la pantalla. Proporciona puntos de
   bonificación si se destruye.

### Mecánica de juego

 - **Destrucción de alienígenas:** Debes disparar y destruir a todos los
   alienígenas en la pantalla para completar una oleada o nivel. Una vez
   que eliminas una oleada, aparece una nueva, generalmente comenzando
   más abajo o moviéndose más rápido.
 - **Movimiento y velocidad:** A medida que se destruyen más alienígenas,
   los restantes se mueven y descienden más rápido, aumentando la
   dificultad del juego.
 - **Disparos:** El cañón solo puede tener un disparo en pantalla a la vez,
   por lo que la precisión y el tiempo de disparo son clave. Los
   alienígenas también disparan proyectiles aleatoriamente hacia el
   cañón del jugador.

### Puntuación

Los puntos se otorgan por cada alienígena destruido, variando según el tipo o la fila en la que se encuentren (esto puede variar en diferentes versiones del juego). La nave misteriosa otorga puntos de bonificación si es destruida, y su valor puede depender de cuántos disparos hayas hecho en la ronda actual.

### Fin de la partida

La partida termina si se produce alguna de las siguientes situaciones:

 1. El cañón del jugador es impactado por un disparo alienígena o choca
    con un invasor, y el jugador pierde todas sus vidas (normalmente se
    empieza con tres vidas).
 2. Los alienígenas llegan al borde inferior de la pantalla, lo que se
    considera una "invasión" exitosa.

Tomando como base el texto antes mencionado:

Elabora un prompt para que un agente AI experto en HTML, CSS y javascript implemente el juego mencionado. Asegurando compatibilidad con la mayoría de navegadores web (Mozilla Firefox, Safari, Chrome, Brave...), que el diseño de el área de juego y los elementos tengan un estilo minimalista pero distintivo. Que use colores contrastantes para todos los elementos del juego incluyendo los textos del score, número de vidas, etc. Asegurando que el juego sea visualmente claro y se vea bien en diferentes tamaños de pantalla.

Otras reglas en el prompt:
 - El código debe estar bien organizado y comentado para facilitar su
   lectura.
 - Probar el juego en diferentes navegadores para detectar errores y
   garantizar una experiencia de juego consistente.
 - Dé prioridad a la funcionalidad, la legibilidad del código y el
   cumplimiento de las especificaciones del juego descritas
   anteriormente.
---
## Prompt 1
## 💻 _Prompt_ para la Implementación de Space Invaders en HTML, CSS y JavaScript 👾

Genera el código completo (HTML, CSS y JavaScript Vanilla) para una implementación funcional del juego **Space Invaders**, basándose en las reglas proporcionadas. El juego debe ser completamente jugable dentro de un navegador web estándar.

----------

### I. Requisitos Técnicos y de Compatibilidad

-   **Tecnologías:** Utilizar **HTML5**, **CSS3** y **JavaScript (ES6+)** puro. Se prohíbe el uso de _frameworks_ o librerías externas (como React, Vue, jQuery, etc.) para la lógica central del juego.
    
-   **Compatibilidad con Navegadores:** El código debe ser compatible y funcionar correctamente en las versiones modernas de los navegadores más comunes (Google Chrome, Mozilla Firefox, Safari, Edge, Brave, etc.).
    
-   **Estructura de Archivos:** Organizar el código en archivos separados: `index.html`, `style.css` y `script.js`.
    
-   **Comentarios:** El código debe estar **bien organizado y profusamente comentado** para explicar la lógica del juego, las funciones clave y la estructura del CSS.
    

----------

### II. Requisitos de Diseño y Estilo (Minimalista y Distintivo)

-   **Estilo General:** El diseño debe ser **minimalista** pero con un estilo **distintivo** que remita al _arcade_ original. Priorizar la claridad visual.
    
-   **Colores y Contraste:**
    
    -   Utilizar un **fondo de área de juego oscuro** (negro o gris muy oscuro).
        
    -   Implementar una paleta de **colores contrastantes** (como verde neón, cian, magenta o blanco puro) para todos los elementos: Cañón del Jugador, Invasores Alienígenas, Proyectiles, Escudos y la Nave Misteriosa.
        
    -   Los textos de la interfaz (**Score, Vidas, Game Over, etc.**) deben usar un color de alto contraste y una fuente de estilo _pixel-art_ o _monospace_ para mayor claridad.
        
-   **Diseño Responsivo:** El área de juego debe ser **visualmente clara y jugable** en diferentes tamaños de pantalla (escritorio y móvil, aunque la jugabilidad se enfocará en el control por teclado). Usar unidades relativas o _flexbox/grid_ para la estructura.
    
-   **Elementos Visuales:** Los elementos del juego (alienígenas, cañón) pueden ser representados por formas geométricas simples (cuadrados, rectángulos) o caracteres (_emoji_ o _unicode_) para mantener el estilo minimalista.
    

----------

### III. Reglas Específicas del Juego a Implementar

Implementar la **Mecánica de Juego** descrita en el texto de referencia:

1.  **Cañón del Jugador:** Se mueve horizontalmente (izquierda/derecha) con las teclas de flecha o 'A'/'D'. Dispara con la barra espaciadora.
    
    -   **Restricción de Disparo:** Solo puede haber **un proyectil del jugador en pantalla** a la vez.
        
2.  **Invasores Alienígenas:**
    
    -   Comienzan en formación (ej. $5$ filas x $10$ columnas).
        
    -   Se mueven lateralmente, **descendiendo una unidad** al alcanzar los límites laterales del área de juego.
        
    -   A medida que la cantidad de alienígenas disminuye, su **velocidad de movimiento lateral y vertical debe aumentar** progresivamente.
        
    -   Disparan proyectiles **aleatoriamente** y periódicamente hacia el cañón.
        
3.  **Escudos (Búnkeres):** Colocar **cuatro escudos estacionarios** que absorben disparos tanto del jugador como de los alienígenas, mostrando un desgaste visual gradual antes de ser completamente destruidos.
    
4.  **Nave Misteriosa (OVNI):**
    
    -   Aparece de forma **aleatoria** en la parte superior, moviéndose horizontalmente a una velocidad constante.
        
    -   Otorga **puntos de bonificación** al ser destruida (ej. $50$, $100$, $150$ puntos, aleatoriamente).
        
5.  **Puntuación:**
    
    -   Implementar un marcador visible (**SCORE**).
        
    -   Puntos por alienígena destruido (ej. fila inferior $10$ pts, intermedia $20$ pts, superior $30$ pts).
        
    -   Puntos por Nave Misteriosa (bonificación aleatoria).
        
6.  **Fin de la Partida:**
    
    -   **Vidas:** Implementar un contador de vidas visible (ej. **LIVES: 3**). Se pierde una vida al ser impactado por un disparo alienígena.
        
    -   **GameOver (Invasión):** La partida termina si los alienígenas **llegan al borde inferior** del área de juego.
        
    -   **GameOver (Vidas):** La partida termina al **perder la última vida**.
        
7.  **Ciclo de Juego:** Tras eliminar una oleada completa, generar una **nueva oleada** donde los alienígenas comienzan ligeramente **más cerca** del borde inferior, y/o con una velocidad inicial aumentada.
    

----------

### IV. Requisitos Adicionales

-   **Manejo del Tiempo:** Utilizar `requestAnimationFrame` para la actualización del juego y el movimiento, en lugar de `setInterval`, para un _framerate_ más suave y eficiente.
    
-   **Detección de Colisiones:** Implementar una lógica de detección de colisiones precisa y optimizada (jugador-proyectil, proyectil-alienígena, proyectil-escudo, alienígena-escudo, etc.).
    

----------

### V. Resultado Esperado

El agente debe entregar el código completo en los tres lenguajes, listo para ser copiado y ejecutado en un navegador. **Priorizar la funcionalidad y la legibilidad del código sobre cualquier otra métrica.**

---
## Prompt 2

Analiza el siguiente código. Hay forma de mejorarlo y cómo puedo probar toda su funcionalidad.

---
## Prompt 3
Antes de ayudarme a probar haz las mejoras que enumeraste. Posteriormente me guiarás paso a paso cómo hacer los test.

---
