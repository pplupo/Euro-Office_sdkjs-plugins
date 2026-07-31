# OllamaUnifiedPlugin

A fully private, local LLM assistant that brings Ollama-powered text tools directly into the
document editor — rewriting, tone/sentiment changes, plain-language simplification, and
document chat (RAG), all without any text leaving the machine.

Originally created by **Marco Guastavigna** ([@marcoguastavigna](https://github.com/marcoguastavigna)),
who released it into the public domain and contributed it to Euro-Office in
[Euro-Office/DesktopEditors#38](https://github.com/Euro-Office/DesktopEditors/issues/38),
giving explicit permission to host, integrate, and improve it here. See [CREDITS.md](CREDITS.md)
for the full attribution and a changelog of what's been added since the original v1.1 package.

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
- **Ollama native or OpenAI-compatible backend** — Settings has an API Type toggle plus an
  optional API key (`Authorization: Bearer <key>`), so it can point at a token-gated
  OpenAI-compatible endpoint instead of a local unauthenticated Ollama instance.

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
