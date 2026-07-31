# Credits

**Original author:** Marco Guastavigna ([@marcoguastavigna](https://github.com/marcoguastavigna))

Marco created and shared Ollama Unified v1.1 for ONLYOFFICE / Euro-Office Desktop Editors,
releasing it into the public domain, in
[Euro-Office/DesktopEditors#38](https://github.com/Euro-Office/DesktopEditors/issues/38):

> The project is released into the public domain (completely free), so please feel free to
> create a Git repository for it, host it, or integrate/improve it as you see fit. If you or
> the Euro-Office team would like to take it over and host it officially, you have my full
> blessing!

This repository hosts and continues to maintain the plugin with his permission.

## Changes made since the original v1.1 package

- Added 10 additional UI languages (Portuguese, German, Romanian, Norwegian, Finnish, Swedish,
  Danish, Dutch, French-Canadian, English-Canadian), each with matching rewrite/simplification
  prompt sets and, where a standard readability formula exists for that language, a matching
  readability-analysis implementation.
- Fixed `<html lang>` not updating when the UI language changes.
- Rebranded "ONLYOFFICE" references to "EURO-OFFICE" in documentation and code comments.
- Switched the shipped default UI language from Italian to English.
- Added an optional API key field (Settings → Server Configuration), sent as an
  `Authorization: Bearer <key>` header on all requests, for use with token-gated
  endpoints instead of a local unauthenticated Ollama instance.
