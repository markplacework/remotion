# Wave Music · sincronización precisa (Modal)

Servicio con GPU que recibe una canción y su letra y devuelve cuándo se canta
cada línea y cada palabra. Lo usa el proveedor **"IA precisa (Modal)"** de
`public/wave-music`.

Cómo funciona (`pipeline.py`):

1. **Demucs (htdemucs)** separa la voz de la música.
2. **Whisper large-v3** (vía WhisperX) transcribe la voz sola. Sus palabras se
   usan solo para saber más o menos dónde está cada línea de la letra.
3. **Alineación forzada de WhisperX** (wav2vec2 en español) ubica el texto
   *conocido* de cada línea dentro de esa ventana, palabra por palabra.

## Publicar

```bash
pip install modal
export MODAL_TOKEN_ID=... MODAL_TOKEN_SECRET=...
# opcional: exigir un token a quien llame al endpoint
export WAVE_SYNC_TOKEN=algo-secreto
modal deploy services/wave-music-sync/app.py
```

`modal deploy` imprime la URL del endpoint
(`https://<workspace>--wave-music-sync-syncer-web.modal.run`). La app web la
pide la primera vez que usás "IA precisa (Modal)". También se puede fijar en
`DEFAULT_URL` dentro de `public/wave-music/js/modal-sync.js`.

## Endpoint

`POST /`, formulario multipart:

| campo      | qué es                              |
| ---------- | ----------------------------------- |
| `audio`    | el archivo de audio (hasta 60 MB)   |
| `lyrics`   | la letra, una línea por renglón     |
| `language` | opcional, por ahora solo `es`       |

Respuesta:

```json
{
  "starts": [1.7, 7.4],
  "words": [{ "text": "Estoy tratando…", "words": [{ "text": "Estoy", "d0": 0, "d1": 0.31 }] }],
  "matched": 52,
  "total": 52,
  "duration": 45.5
}
```

`d0`/`d1` son relativos al inicio de la línea, igual que en `js/ai-sync.js`.

```bash
curl -F audio=@public/fake-chat/song.mp3 -F lyrics="$(printf 'línea 1\nlínea 2')" https://…modal.run/
```

## Probar y comparar con la demo

```bash
modal run services/wave-music-sync/test_demo.py      # contra el servicio publicado
python services/wave-music-sync/test_demo.py --local # mismo código en CPU, sin Modal
```

Compara los tiempos de la demo, "Whisper solo" (Whisper sobre la mezcla, sin
separar la voz, que es lo que hace hoy el proveedor de OpenAI) y el servicio.
