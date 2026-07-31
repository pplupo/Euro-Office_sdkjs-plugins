# Relazione Tecnica - Ollama Unified per EURO-OFFICE (v1.1)

La presente relazione descrive l'architettura tecnica, le scelte progettuali e le soluzioni implementate nella versione **1.1.0** del plugin **Ollama Unified** per la suite per ufficio EURO-OFFICE Desktop Editors.

---

## 1. Architettura del Plugin
Il plugin è sviluppato come un'applicazione web *client-side* che gira all'interno di un contenitore Chromium (CEF/QtWebEngine) fornito dall'applicazione desktop ospite. 

### Struttura dei File
Il pacchetto del plugin si compone di sei risorse principali:
* `config.json`: File descrittivo dei metadati del plugin, del GUID, dei requisiti di versione dell'SDK e delle autorizzazioni di integrazione con i tre editor (*Word/Documenti*, *Cell/Fogli di calcolo*, *Slide/Presentazioni*).
* `index.html`: Struttura del pannello laterale (sidebar), organizzata a schede (Tab) con attributi di localizzazione dinamica (`data-i18n`).
* `code.js`: Logica applicativa, gestione dello stato, connettività alle API di Ollama, implementazione del RAG client-side, calcolo della leggibilità e motore di traduzione UI.
* `style.css`: Foglio di stile CSS basato su variabili, transazioni hardware-accelerated e layout flessibili per adattarsi alla larghezza dinamica della sidebar di EURO-OFFICE.
* `icon.png` e `icon@2x.png`: Iconografia ufficiale del plugin in risoluzione standard e Retina.

---

## 2. Sistema di Localizzazione Multilingua & Adattamenti Linguistici
Una delle principali novità della v1.1.0 è la gestione multilingua che supporta **Italiano (IT), Inglese (EN), Francese (FR) e Spagnolo (ES)**. Il sistema non si limita a tradurre le etichette dell'interfaccia utente (UI), ma adatta i motori di riscrittura e gli algoritmi di calcolo della leggibilità in base alla lingua attiva.

### A. Mappatura dei Protocolli di Semplificazione
La semplificazione del testo viene declinata secondo gli standard accademici e istituzionali di ciascun paese:

1. **Italiano (IT):**
   * **Protocollo 1 (Base):** Si basa sul *Vocabolario di Base* elaborato dal linguista Tullio De Mauro (circa 7000 parole fondamentali/alto uso). Sintassi lineare e divieto di forme passive.
   * **Protocollo 2 (Medio):** Sintassi nucleare ampliata, frasi entro le 20 parole, subordinate causali/temporali e forme passive moderate.
2. **Inglese (EN):**
   * **Protocollo 1 (Base):** Ispirato alle regole del *Basic English* (Ogden) e alla lista di parole familiari *Dale-Chall*. Frasi inferiori a 15 parole con struttura Soggetto-Verbo-Oggetto.
   * **Protocollo 2 (Medio):** Rispetto delle linee guida del *Plain Writing Act* statunitense (Plain English). Uso di subordinate semplici, passivi ridotti al minimo.
3. **Francese (FR):**
   * **Protocollo 1 (Base):** Basato sulle regole europee del *FALC* (*Facile à lire et à comprendre*) e del *Français Fondamental*. Esclude la variatio ed evita rigorosamente la voce passiva.
   * **Protocollo 2 (Medio):** *Français Simplifié* (linguaggio chiaro per la pubblica amministrazione). Frasi entro le 20 parole, congiunzioni semplici.
4. **Spagnolo (ES):**
   * **Protocollo 1 (Base):** Regolato dallo standard nazionale spagnolo di *Lectura Fácil* (normativa UNE 153101:2018 EX). Lessico controllato ad alta leggibilità, divieto di costrutti passivi ed espressioni idiomatiche.
   * **Protocollo 2 (Medio):** Linee guida di *Lenguaje Claro*. Sintassi piana, subordinate coordinate brevi.

*Il **Protocollo 3** (per tutte le lingue) rappresenta lo stile complesso/accademico, caratterizzato da lessico ricercato, subordinate di secondo/terzo grado, forme passive costanti e soggetti prevalentemente impliciti.*

### B. Algoritmi di Leggibilità Localizzati
Il calcolo dell'indice di leggibilità adotta dinamicamente la formula scientifica corretta per la lingua selezionata:

* **Italiano:** **Indice Gulpease**
  $$\text{Gulpease} = 89 - \frac{\text{Lettere} \times 100}{\text{Parole}} \times \frac{1}{10} + 3 \times \frac{\text{Frasi} \times 100}{\text{Parole}}$$
* **Inglese:** **Flesch Reading Ease**
  $$\text{Flesch RE} = 206.835 - 1.015 \times \left(\frac{\text{Parole}}{\text{Frasi}}\right) - 84.6 \times \left(\frac{\text{Sillabe}}{\text{Parole}}\right)$$
* **Francese:** **Flesch-Szigriszt (Adattamento Francese)**
  $$\text{Flesch-Szigriszt} = 206.84 - 62.3 \times \left(\frac{\text{Sillabe}}{\text{Parole}}\right) - \left(\frac{\text{Parole}}{\text{Frasi}}\right)$$
* **Spagnolo:** **Indice Fernández-Huerta**
  $$\text{Fernández-Huerta} = 206.84 - 60 \times \left(\frac{\text{Sillabe}}{\text{Parole}}\right) - 1.02 \times \left(\frac{\text{Parole}}{\text{Frasi}}\right)$$

#### Stima delle sillabe in JavaScript
Poiché Flesch, Flesch-Szigriszt e Fernández-Huerta richiedono il conteggio delle sillabe, è stata implementata in `code.js` un'euristica fonetica altamente performante:
```javascript
function estimateSyllables(word) {
    word = word.toLowerCase().trim();
    if (word.length <= 3) return 1;
    // Rimuove i suffissi muti comuni in inglese/francese
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    // Trova i gruppi vocalici compresi i caratteri accentati delle quattro lingue
    var matches = word.match(/[aeiouyàèéìòùáéíóúüâêîôûœæ]{1,2}/g);
    return matches ? matches.length : 1;
}
```

---

## 3. Architettura RAG (Retrieval-Augmented Generation) Client-Side
Il RAG consente di effettuare una ricerca semantica sul documento aperto per rispondere a domande libere. È implementato interamente all'interno del codice JavaScript del plugin per garantire la massima privacy (nessun server esterno oltre a Ollama riceve i dati).

### Flusso di Lavoro RAG:
```
[GetAllText] ➔ [Word-Based Chunking] ➔ [Ollama /api/embeddings] ➔ [Array in Memoria]
                                                                        │
[Query Utente] ➔ [Ollama /api/embeddings] ➔ [Cosine Similarity] ➔ [Top 3 Chunks] ➔ [System Prompt] ➔ [Ollama /api/generate]
```

1. **Text Chunking:** Il testo completo del documento viene estratto tramite `window.Asc.plugin.executeMethod("GetAllText")` e diviso in blocchi (chunks) di 400 parole con una sovrapposizione (overlap) di 50 parole per conservare il contesto ai confini dei blocchi.
2. **Generazione degli Embeddings (Vettorializzazione):** Viene inviata una richiesta HTTP asincrona sequenziale all'endpoint `/api/embeddings` di Ollama per ogni blocco. 
   * *Miglioria tecnica:* Per evitare errori dovuti a modelli LLM non in grado di calcolare embeddings, la v1.1.0 introduce la scelta separata del **Modello Embedding** (che seleziona automaticamente `nomic-embed-text` se installato), velocizzando il processo di oltre il 90%.
3. **Similarity Search (Ricerca Semantica):** Quando l'utente inserisce una domanda, viene calcolato il vettore della query. Successivamente, la logica JavaScript esegue una comparazione di similarità del coseno (*Cosine Similarity*) tra il vettore della query e tutti i vettori dei blocchi del documento:
   $$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$
4. **Context Assembly & Prompting:** I tre blocchi con il punteggio di similarità più alto vengono uniti e inseriti in un prompt di sistema localizzato (in base alla lingua scelta) che forza l'LLM a rispondere basandosi principalmente sui contesti forniti.

---

## 4. UI/UX e Design System (`style.css`)
L'interfaccia utente è stata ridisegnata per rispettare canoni estetici moderni, discostandosi dal design predefinito di Windows/EURO-OFFICE pur integrandovisi armonicamente.

* **Palette di colori coerente:** Utilizza variabili CSS per definire una palette orientata al blu/ardesia (`#2b579a`), con stati di hover, colori per messaggi di errore (soft rosso), successo (soft verde) e alert (soft ambra).
* **Responsive Layout:** Le schede dei toni e delle riscritture utilizzano griglie CSS flessibili (`grid-template-columns: 1fr 1fr 1fr;`) per disporre i pulsanti in modo compatto senza causare overflow orizzontale o scrollbar indesiderate.
* **Componente Chat a Bolle (Bubble Chat):** I messaggi all'interno del pannello Chat sono presentati come bolle arrotondate con allineamenti specchiati (a destra in blu per l'utente, a sinistra in bianco/grigio per l'IA).
* **Animazioni di stato:** Un indicatore led in basso a destra pulsa con un'animazione CSS keyframes (`pulse`) quando il plugin è in stato attivo di elaborazione o chiamata di rete (working state), offrendo un feedback dinamico all'utente.
