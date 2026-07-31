# Euro-Office Community Plugins

Community plugins for Euro-Office Desktop Editors, modeled after
[ONLYOFFICE's community plugins](https://github.com/ONLYOFFICE/sdkjs-plugins), since Euro-Office
does not currently maintain an equivalent repository.

Euro-Office is built from the same `sdkjs` / `desktop-sdk` foundation as ONLYOFFICE, so plugins
here use the standard `window.Asc.plugin` API and the same `config.json` manifest format
(`guid`, `minVersion`, `EditorsSupport`, plugin variations) as upstream ONLYOFFICE plugins.

## Layout

Each plugin lives in its own top-level directory containing at minimum:

- `config.json` — plugin manifest (name, guid, supported editors, entry point)
- `index.html` — plugin UI, loaded into the editor's plugin sidebar
- `code.js` — plugin logic
- `icon.png` / `icon@2x.png` — sidebar icons

## Installing a plugin locally

Copy the plugin's directory into your Euro-Office Desktop Editors user plugins folder:

```
~/.local/share/euro-office/desktopeditors/data/sdkjs-plugins/
```

(Linux path, derived from `APP_DATA_PATH` in `desktop-apps/win-linux/src/defines.h` +
`QStandardPaths::GenericDataLocation`. Windows/macOS use their platform's equivalent app-data
directory under `.../Euro-Office/DesktopEditors/data/sdkjs-plugins/`.)

## Plugins

### [OllamaUnifiedPlugin](OllamaUnifiedPlugin/)

A fully private, local LLM assistant that brings Ollama-powered text tools directly into the
document editor — rewriting, tone/sentiment changes, plain-language simplification, and
document chat (RAG), all without any text leaving the machine.

Originally created by **Marco Guastavigna** ([@marcoguastavigna](https://github.com/marcoguastavigna)),
who released it into the public domain and contributed it to Euro-Office in
[Euro-Office/DesktopEditors#38](https://github.com/Euro-Office/DesktopEditors/issues/38),
giving explicit permission to host, integrate, and improve it here.

**Highlights:**

- **Locale-aware simplification** — each UI language maps its "plain language" rewrite to the
  matching local standard rather than a generic translation (see table below).
- **Locale-aware readability scoring** — the readability-analysis tool runs the correct formula
  for the selected UI language instead of one fixed metric.
- **Client-side RAG document chat** — chunks the open document, generates local embeddings
  (e.g. `nomic-embed-text`), and does cosine-similarity retrieval in-browser to answer questions
  about the document without any server-side component.
- **Custom sidebar UI** — a theme built specifically for the editor's plugin sidebar, with
  grid-aligned action buttons and chat-style message bubbles.

**Supported languages, simplification protocol, and readability formula:**

| Language | UI code | Simplification protocol | Readability formula |
|---|---|---|---|
| Italian | `it` | De Mauro (Vocabolario di Base) | Gulpease |
| English | `en` | Basic English / Plain English | Flesch Reading Ease |
| French | `fr` | FALC (Facile à lire et à comprendre) | Flesch-Szigriszt |
| Spanish | `es` | Lectura Fácil (UNE 153101) | Fernández-Huerta |
| Portuguese | `pt` | Linguagem Simples/Clara (ISO 24495-1) | Flesch (Martins adaptation) |
| German | `de` | Leichte Sprache (DIN SPEC 33429) | Flesch (Amstad adaptation) |
| Romanian | `ro` | Limbaj clar/simplu (EU accessible-communication guidelines) | Flesch-style approximation |
| Norwegian | `nb` | Klarspråk (NS-ISO 24495-1) | LIX |
| Finnish | `fi` | Selkokieli (Selkokeskus) | LIX |
| Swedish | `sv` | Lättläst (SS-ISO 24495-1) | LIX |
| Danish | `da` | Klart sprog (DS/ISO 24495-1) | LIX |
| Dutch | `nl` | Taalniveau B1 (NEN-ISO 24495-1) | Flesch-Douma |
| French (Canada) | `fr-ca` | Langage clair et simple (CAN/ASC-3.1:2025) | Flesch-Szigriszt |
| English (Canada) | `en-ca` | Plain Language (CAN-ASC-3.1:2025) | Flesch Reading Ease |

The first four languages (it/en/fr/es) and their protocols/formulas are from Marco's original
v1.1 package; the remaining ten were added afterward, each following the plain-language standard
and readability metric actually used for that language rather than reusing a generic one.
