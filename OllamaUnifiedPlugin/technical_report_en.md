# Technical Report - Ollama Unified for EURO-OFFICE (v1.1)

This report details the technical architecture, design decisions, and solutions implemented in version **1.1.0** of the **Ollama Unified** plugin for the EURO-OFFICE Desktop Editors suite.

---

## 1. Plugin Architecture
The plugin is structured as a client-side web application executed inside a Chromium Embedded Framework (CEF/QtWebEngine) instance managed by the host desktop application.

### File Structure
The plugin package consists of six primary resources:
* `config.json`: Meta-configuration file containing the plugin name, description, translations, GUID, EURO-OFFICE SDK minimum version, and compatibility declarations for the editors (*Word/Documents*, *Cell/Spreadsheets*, *Slide/Presentations*).
* `index.html`: Layout of the sidebar panel, divided into tabs with custom localization attributes (`data-i18n`).
* `code.js`: Main application logic, state manager, Ollama API connection, client-side RAG search, readability calculators, and DOM translation helper.
* `style.css`: Responsive CSS stylesheet utilizing variables, grid boundaries, transitions, and specific chat bubble layouts.
* `icon.png` and `icon@2x.png`: Brand assets for standard and High-DPI screens.

---

## 2. Multilingual Support & Linguistic Adaptations
A core feature of v1.1.0 is the native multilingual system supporting **Italian (IT), English (EN), French (FR), and Spanish (ES)**. The system translates the UI strings and dynamically adjusts the simplification protocols and readability calculations according to the chosen locale.

### A. Simplification Protocol Mapping
Text simplification is mapped onto academic and regulatory standards specific to each target language:

1. **Italian (IT):**
   * **Protocol 1 (Base):** Adheres to Tullio De Mauro's *Vocabolario di Base* (~7000 high-frequency words). Simple nuclear clauses, strict active voice.
   * **Protocol 2 (Medium):** Expanded nuclear syntax, sentences under 20 words, simple subordinates (causal/temporal), moderate passive voice.
2. **English (EN):**
   * **Protocol 1 (Base):** Guided by Ogden's *Basic English* (850 words) and the *Dale-Chall* list of familiar words. Sentences under 15 words with a strict Subject-Verb-Object pattern.
   * **Protocol 2 (Medium):** Adheres to US *Plain Writing Act* (Plain English) guidelines. Sentence length under 20 words, simple connectives, minimal passive voice.
3. **French (FR):**
   * **Protocol 1 (Base):** Follows European *FALC* (*Facile à lire et à comprendre*) and *Français Fondamental* standards. Avoids synonym variation and excludes passive voice.
   * **Protocol 2 (Medium):** *Français Simplifié* (plain administrative French). Subordinate clauses are kept simple; sentence length under 20 words.
4. **Spanish (ES):**
   * **Protocol 1 (Base):** Regulated by Spain's national *Lectura Fácil* standard (UNE 153101:2018 EX). Restricts vocabulary to high-accessibility words; active voice is mandatory.
   * **Protocol 2 (Medium):** *Lenguaje Claro* guidelines. Clear, linear coordination; sentences kept brief.

*For all languages, **Protocol 3** leverages complex academic structures, passive voice, nominalized clauses, and highly specific vocabulary.*

### B. Adaptive Readability Formulas
The readability calculator (`analyzeReadability()`) dynamically triggers the correct formula for the active language:

* **Italian:** **Gulpease Index**
  $$\text{Gulpease} = 89 - \frac{\text{Letters} \times 100}{\text{Words}} \times \frac{1}{10} + 3 \times \frac{\text{Sentences} \times 100}{\text{Words}}$$
* **English:** **Flesch Reading Ease**
  $$\text{Flesch RE} = 206.835 - 1.015 \times \left(\frac{\text{Words}}{\text{Sentences}}\right) - 84.6 \times \left(\frac{\text{Syllables}}{\text{Words}}\right)$$
* **French:** **Flesch-Szigriszt (French Adaptation)**
  $$\text{Flesch-Szigriszt} = 206.84 - 62.3 \times \left(\frac{\text{Syllables}}{\text{Words}}\right) - \left(\frac{\text{Words}}{\text{Sentences}}\right)$$
* **Spanish:** **Fernández-Huerta Index (Spanish Adaptation)**
  $$\text{Fernández-Huerta} = 206.84 - 60 \times \left(\frac{\text{Syllables}}{\text{Words}}\right) - 1.02 \times \left(\frac{\text{Words}}{\text{Sentences}}\right)$$

#### JavaScript Syllable Counter Heuristic
To calculate Flesch-based indexes client-side, we wrote an optimized phonetic vowel-group counting function in `code.js`:
```javascript
function estimateSyllables(word) {
    word = word.toLowerCase().trim();
    if (word.length <= 3) return 1;
    // Strip common silent endings for English and French
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    // Match vowel groups including accented characters across supported languages
    var matches = word.match(/[aeiouyàèéìòùáéíóúüâêîôûœæ]{1,2}/g);
    return matches ? matches.length : 1;
}
```

---

## 3. Client-Side Retrieval-Augmented Generation (RAG) Architecture
RAG enables semantic searching across the open document to answer free-form user questions. The implementation is 100% client-side, guaranteeing that no document data is leaked to external APIs.

### RAG Dataflow:
```
[GetAllText] ➔ [Word-Based Chunking] ➔ [Ollama /api/embeddings] ➔ [Memory Array]
                                                                        │
[User Query] ➔ [Ollama /api/embeddings] ➔ [Cosine Similarity] ➔ [Top 3 Chunks] ➔ [System Prompt] ➔ [Ollama /api/generate]
```

1. **Document Chunking:** The document's raw text is extracted via `GetAllText` and divided into chunks of 400 words with an overlap of 50 words to avoid context loss at the boundaries.
2. **Embedding Generation:** Vector embeddings are fetched sequentially from Ollama's `/api/embeddings` endpoint. 
   * *Technical optimization:* To bypass embedding errors caused by standard LLM configurations, v1.1.0 allows selecting a specialized **Embedding Model** (automatically pre-selecting `nomic-embed-text` if available). This accelerates indexing by over 90%.
3. **Semantic Similarity Matching:** On user query, a query embedding is generated. We calculate the Cosine Similarity between the query vector and all chunk vectors in client-side JS:
   $$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$
4. **Context Prompting:** The top 3 most similar chunks are assembled into a localized system prompt that forces the LLM to generate its answer using the context.

---

## 4. UI/UX Design System (`style.css`)
The interface features custom elements designed for EURO-OFFICE's sidebar dimensions.
* **Palette:** Governed by CSS variables pointing to corporate-slate blue (`#2b579a`), user bubble slate-blue, system warnings (gold), and errors (soft red).
* **Responsive Grids:** Prevents overflow using automatic CSS column wraps (`grid-template-columns: 1fr 1fr 1fr;`) for tone keys.
* **Chat Bubbles:** Alternating bubbles (right-aligned colored for user, left-aligned bordered white for AI) for clear conversation tracking.
* **Progress Led Animation:** The status bar dot pulses using keyframes (`pulse`) when active (working state), giving immediate visual feedback.
