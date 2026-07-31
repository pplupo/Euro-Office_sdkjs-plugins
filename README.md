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

- **[OllamaUnifiedPlugin](OllamaUnifiedPlugin/)** — local, private AI writing assistant
  (rewrite, tone changes, plain-language simplification, RAG document chat) powered by a
  locally running [Ollama](https://ollama.com) instance. Supports 14 UI languages.
