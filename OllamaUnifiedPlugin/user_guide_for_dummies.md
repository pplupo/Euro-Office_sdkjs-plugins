# Guida all'Uso - Ollama Unified per EURO-OFFICE (Per Tutti)

Benvenuto nella guida semplice di **Ollama Unified (v1.1)** per EURO-OFFICE! Questa guida è scritta in modo semplice per permettere a chiunque, anche a chi non ha competenze tecniche, di installare e usare l'assistente IA locale nei propri documenti.

---

## 1. Che cos'è Ollama Unified?
È un componente aggiuntivo (plugin) per EURO-OFFICE che ti permette di usare l'Intelligenza Artificiale (come ChatGPT) direttamente all'interno dei tuoi documenti, **ma in modo completamente locale e privato**, senza che i tuoi testi vengano inviati su Internet. Si collega al programma **Ollama** installato sul tuo computer.

Con questo plugin puoi:
* **Migliorare la scrittura:** correggere, espandere o riassumere frasi.
* **Semplificare i testi:** riscrivere testi difficili (es. burocratici) in un linguaggio chiaro e comprensibile per anziani o non esperti.
* **Cambiare il Tono:** far riscrivere un testo in modo ironico, formale, persuasivo, ecc.
* **Chattare con il documento (RAG):** fare domande al computer basate interamente sul contenuto del documento aperto.

---

## 2. Requisiti Fondamentali (Prima di iniziare)
Per far funzionare il plugin, sul tuo computer deve essere attivo **Ollama**.

### Verificare Ollama e abilitare il "CORS" (Importante!)
Ollama deve accettare le richieste che arrivano dall'interno di EURO-OFFICE. Per farlo, deve essere avviato con la variabile `OLLAMA_ORIGINS` impostata su `*`.
* **Su Windows:**
  1. Chiudi Ollama dalla barra delle icone in basso a destra (tasto destro -> *Quit*).
  2. Apri il menu Start, cerca **Variabili di ambiente** e aprilo.
  3. Clicca su **Variabili d'ambiente...** in basso.
  4. Sotto "Variabili dell'utente", clicca su **Nuovo...**.
  5. Inserisci come nome: `OLLAMA_ORIGINS` e come valore: `*`.
  6. Conferma tutto cliccando su OK.
  7. Riavvia Ollama.

### Modelli consigliati da scaricare
Apri il prompt dei comandi (cerca `cmd` su Start) e scarica questi modelli (se non li hai già):
* Per scrivere e chattare: `ollama run qwen2.5-coder:7b` (o `llama3`)
* Per analizzare e indicizzare i documenti (RAG): `ollama pull nomic-embed-text`

---

## 3. Come installare il plugin
Abbiamo preparato un pacchetto speciale chiamato `OllamaUnified.plugin`.

### Metodo A (Il più semplice):
1. Apri **EURO-OFFICE Desktop Editors**.
2. Apri un documento qualsiasi.
3. Vai sulla scheda **Componenti** in alto.
4. Clicca sul pulsante **Impostazioni plugin** (o clicca su *Aggiungi plugin* se presente).
5. Seleziona il file `OllamaUnified.plugin` e clicca su Apri. Il plugin si installerà da solo e comparirà nella barra in alto!

### Metodo B (Installazione manuale):
Se vuoi installarlo manualmente, estrai i file del plugin all'interno della seguente cartella del tuo computer:
`C:\Users\<TuoNomeUtente>\AppData\Local\EURO-OFFICE\DesktopEditors\data\sdkjs-plugins\{962B81F2-28C3-4486-A05D-392F8566F817}`

---

## 4. Primo avvio e Configurazione (⚙️)
1. Clicca sulla scheda **Componenti** in alto su EURO-OFFICE e poi sull'icona **Ollama Unified v1.1**. Si aprirà la barra laterale destra.
2. Vai sulla scheda con l'ingranaggio (**⚙️**).
3. **Seleziona la tua lingua:** Sotto *Seleziona Lingua*, scegli tra 🇮🇹 Italiano, 🇬🇧 English, 🇫🇷 Français, 🇪🇸 Español. Tutta l'interfaccia e i prompt dell'IA si tradurranno istantaneamente!
4. **Connetti a Ollama:** Clicca su **Connetti e Aggiorna**.
5. **Scegli i modelli:**
   * **Modello Principale:** seleziona il modello che userai per scrivere (es. `qwen2.5-coder:7b` o `llama3`).
   * **Modello Embedding:** seleziona `nomic-embed-text:latest`. Questo modello serve per la funzione Chat.

---

## 5. Come usare le funzioni di scrittura

### Riscrivere o migliorare un testo:
1. Nel tuo documento, **evidenzia con il mouse** la frase o il paragrafo che desideri modificare.
2. Vai nella scheda **Riscrivi** del plugin.
3. Clicca su uno dei pulsanti:
   * **✨ Migliora:** rende il testo più fluente, professionale e corretto.
   * **➕ Espandi:** aggiunge dettagli e amplia i concetti.
   * **Riduci:** accorcia il testo eliminando il superfluo.
   * **Sintesi:** riassume il testo in una o due frasi.
   * **📖 Linguaggio Chiaro:** riscrive il testo in modo semplicissimo, eliminando il burocratese.
4. L'IA elaborerà la richiesta (il pallino in basso pulserà) e sostituirà il testo selezionato nel documento con quello nuovo!

### Cambiare il Tono (Tono):
1. **Evidenzia il testo** che vuoi modificare nel documento.
2. Vai nella scheda **Tono** del plugin.
3. Clicca sullo stile desiderato (es. **👔 Formale**, **☕ Informale**, **🎭 Ironico**, **👁️ Complottista**, ecc.).
4. L'IA riscriverà la selezione con lo stile scelto.

### Facilitatore Digitale (Semplice):
Studiato per aiutare a spiegare concetti complessi o tecnologici a persone anziane o inesperte.
1. Seleziona una parola o un testo.
2. Clicca su **💡 Spiega Semplice** (creerà analogie pratiche) o **🔢 Crea Guida Passo-Passo** (creerà un elenco numerato facilissimo da seguire).

---

## 6. Chattare con il documento (RAG)
Questa funzione ti permette di fare domande sull'intero testo del documento aperto (ad esempio, *"Quali sono le scadenze indicate nel contratto?"* o *"Riassumi i punti chiave"*).

1. Apri la scheda **Chat** nel plugin.
2. Clicca su **🔍 Indicizza Documento**.
3. Il plugin analizzerà tutto il testo del documento dividendolo in blocchi e creando un database interno usando il modello di embedding (`nomic-embed-text`). Vedrai il progresso nella barra di stato.
4. Una volta completato, scrivi una domanda nella casella in basso (*"Fai una domanda..."*) e clicca sulla freccia (**➔**) o premi Invio.
5. L'IA leggerà le parti rilevanti del documento e ti risponderà direttamente nella chat con delle bolle colorate!

---

## 7. Risoluzione dei Problemi

#### Il plugin mostra "Errore connessione Ollama" o non carica i modelli:
* Controlla che il programma Ollama sia avviato sul tuo computer.
* Assicurati di aver configurato la variabile d'ambiente `OLLAMA_ORIGINS` con il valore `*` e di aver riavviato Ollama (vedi punto 2).

#### La Chat mostra "Errore embeddings":
* Assicurati di aver scaricato il modello di embedding corretto digitando `ollama pull nomic-embed-text` nel prompt dei comandi e di averlo selezionato nella scheda delle impostazioni (⚙️) del plugin.

#### Non succede nulla quando clicco sui pulsanti:
* Assicurati di aver **evidenziato/selezionato del testo** all'interno del documento prima di cliccare su un pulsante di riscrittura.
