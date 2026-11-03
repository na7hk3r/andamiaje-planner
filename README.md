# Biblioteca de investigación — TDAH en adultos y Sistema de Andamiaje

Biblioteca personal, fundamentada en evidencia, sobre el TDAH/ADHD en adultos y un sistema de rutinas sostenibles diseñado a partir de esa evidencia. Todo el contenido está redactado en español neutro, con tablas, listas y secciones cortas para facilitar la lectura y el escaneo.

> ⚠️ **Nota importante:** esta biblioteca es material informativo y educativo. **Nada de esto sustituye una evaluación, diagnóstico o tratamiento profesional** por psiquiatría, psicología clínica u otro profesional de la salud habilitado. Si sospechas que podrías tener TDAH, consulta con un profesional.

---

## Contenido de la biblioteca

| Carpeta / archivo | Qué contiene |
|---|---|
| `00-resumen-ejecutivo.md` | Resumen de una página: qué es el TDAH, función ejecutiva, evidencia y el sistema en 5 líneas. |
| `01-fundamentos/` | Qué es el TDAH (criterios, presentaciones, prevalencia, comorbilidad, adultos), función ejecutiva, motivación–tiempo–arousal. |
| `02-evidencia/` | Tratamiento farmacológico y no farmacológico, sueño/circadiano y ejercicio, estrategias prácticas con evidencia. |
| `03-sistema/` | El **Sistema de Andamiaje**: principios de diseño, rutinas, autoevaluación y personalización. |
| `04-fuentes.md` | Bibliografía completa con autor, año, título, medio/journal y URL. |

---

## Cómo usar el sistema en 5 pasos

1. **Lee el resumen ejecutivo** (`00-resumen-ejecutivo.md`): 5 minutos, te da el mapa completo.
2. **Entiende tu base** (`01-fundamentos/`): lee al menos `01-que-es-el-tdah.md` y `02-funcion-ejecutiva.md` para saber *por qué* el sistema funciona como funciona.
3. **Revisa la evidencia** (`02-evidencia/`): consulta qué funciona y con qué fuerza antes de elegir tus herramientas.
4. **Personaliza** (`03-sistema/03-autoevaluacion-y-personalizacion.md`): haz la autoevaluación de 10 preguntas y ajusta el sistema a tu perfil dominante.
5. **Implementa el Sistema de Andamiaje** (`03-sistema/02-sistema-de-rutinas.md`): empieza por las 4 anclas diarias; aplica la regla de los 3 bloques; usa el protocolo de recuperación cuando (no *si*) falles una rutina.

---

## Orden de lectura recomendado

**Camino completo (recomendado):**

```
00 → 01/01 → 01/02 → 01/03 → 02/01 → 02/02 → 02/03 → 03/01 → 03/02 → 03/03
```

**Camino rápido (solo sistema):**

```
00 → 03/01 → 03/02 → 03/03
```

---

## Convivencia con la información

```text
src/
  App.svelte            # Contenedor principal y puerta de bienvenida
  main.js               # Montaje y carga de fuentes
  components/
    day/                # Vista del día: anclas, bloques, tareas, apagado
    focus/              # Vista de enfoque: primer paso, temporizador
    week/               # Ritual semanal y prioridades
    layout/             # Navegación, captura rápida y pie
    settings/           # Ajustes y privacidad
  lib/
    store/              # Estado de la aplicación y captura
    logic/              # Temporizador y recuperación sin culpa
    i18n-copy/es.js     # Textos de la interfaz en español neutro
    storage.js          # Persistencia local versionada
```

## Privacidad local-first

Todos los datos viven exclusivamente en el `localStorage` de este navegador, con guardado versionado y con retardo. No hay cuentas, nube ni rastreo. Es posible exportar una copia en JSON o borrar todos los datos desde Ajustes. La aplicación no sustituye la evaluación de un profesional de la salud.


<a href="https://github.com/Gentleman-Programming/gentle-ai">
  <img width="220" src="https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/docs/assets/brand/built-with-gentle-ai.png" alt="Built with Gentle-AI" />
</a>
