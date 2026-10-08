# Prueba con la canción de la demo

Primero con `python test_demo.py --local` (mismo código, en CPU). Después,
con el servicio ya publicado, `modal run test_demo.py` en la GPU A10G de Modal
dio los mismos tiempos (±0,01 s) y ubicó las 42 palabras por alineación forzada;
las dos llamadas (Whisper solo + Modal), arranque en frío incluido, tardaron ~30 s.
Canción: `public/fake-chat/song.mp3` (45,5 s); letra: `js/demo.js`.

"Referencia" = donde vuelve la voz tras el silencio previo a cada línea,
medido en la voz separada por Demucs (no sale de ningún modelo de Whisper).

| #   | Línea                               | Demo  | Whisper solo | Modal | Referencia |
| --- | ----------------------------------- | ----- | ------------ | ----- | ---------- |
| 1   | Estoy tratando de decirte que...    | 1,66  | 1,50         | 2,85  | 2,77       |
| 2   | Me desespero de esperarte           | 7,44  | 6,24         | 7,67  | 7,56       |
| 3   | Que no salgo a buscarte porque sé...| 11,88 | 11,12        | 12,11 | 12,15      |
| 4   | Que corro el riesgo de encontrarte  | 15,74 | 16,08        | 17,01 | 16,86      |
| 5   | Que me sigo mordiendo noche y día…  | 20,82 | 20,46        | 21,67 | 21,70      |
| 6   | Que te sigo debiendo todavía…       | 28,78 | 27,06        | 29,19 | 28,82      |

Error medio contra la referencia: **demo 0,59 s · Whisper solo 1,23 s · Modal 0,13 s**.

- Whisper solo (tiempos de palabra de Whisper sobre la mezcla, como el
  proveedor de OpenAI) estira la primera palabra de cada línea hacia atrás,
  hasta el final de la anterior ("Me@6.24-7.44", "Que@27.06-28.26"): las líneas
  aparecen hasta 1,7 s antes de tiempo.
- La demo arranca la línea 1 un segundo antes de que se cante (la voz entra
  a los ~2,8 s) y la 4 y la 5, ~1 s antes.
- Modal ubicó las 42 palabras con alineación forzada; ninguna palabra dura
  más de 1,2 s.
