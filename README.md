# Instant Audio – plugin de Kino

Radios en vivo del mundo organizadas por **continente → país → emisoras**, inspirado en [instant.audio](https://instant.audio).

- Miniaturas horizontales (banderas 16:9 y logos de emisoras).
- Reproducción en **teléfono y TV** (`kind: "live"`).
- Streams limpios (Radio Browser): sin páginas intermedias ni anuncios.
- Pestaña **En vivo**, búsqueda y filas de Inicio.

## Instalar en Kino

1. Sube este repositorio a GitHub (público) y añade el topic `kino-plugin`.
2. En Kino: **Ajustes → Plugins → + / Agregar** y escribe `usuario/repositorio`.
3. Acepta los hosts y prueba una emisora.

## Archivos

| Archivo | Uso |
|---------|-----|
| `kino-plugin.json` | Manifiesto |
| `plugin.js` | Lógica |
| `icon.png` | Ícono (puedes sustituirlo por el tuyo, cuadrado ≤ 128 KB) |

## Ajustes

- **Continente preferido en Inicio**: ordena las filas.
- **Radios por país**: 20 / 40 / 60 / 100.

## Notas técnicas

- Datos: [Radio Browser API](https://api.radio-browser.info) (mirrors públicos).
- Streams: `url_resolved` + click de ranking; se descartan URLs de anuncios.
- `streamHosts` / `liveStreamHosts`: `"any"` porque las emisoras están en CDNs variables.
- apiVersion 6: permite canales en filas de Home y live en TV/teléfono.

## Sustituir el ícono

Reemplaza `icon.png` por una imagen cuadrada (recomendado 256×256 o 512×512, PNG, máximo 128 KB). El campo ya está declarado en el manifiesto.
