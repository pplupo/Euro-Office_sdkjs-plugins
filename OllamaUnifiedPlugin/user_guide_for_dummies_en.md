# User Guide - Ollama Unified for EURO-OFFICE (For Dummies)

Welcome to the simple guide for **Ollama Unified (v1.1)** for EURO-OFFICE! This guide is written in plain language to allow anyone, even without technical skills, to install and use their local AI assistant in their documents.

---

## 1. What is Ollama Unified?
It is an add-on (plugin) for EURO-OFFICE that allows you to use Artificial Intelligence (like ChatGPT) directly inside your documents, **but in a completely local and private way**, without your text being sent over the Internet. It connects to the **Ollama** application running on your computer.

With this plugin, you can:
* **Improve Writing:** correct, expand, or summarize sentences.
* **Simplify Text:** rewrite difficult or bureaucratic texts into clear, simple language understandable by seniors or non-experts.
* **Change Tone:** rewrite text in an ironic, formal, persuasive style, etc.
* **Chat with the Document (RAG):** ask questions to the computer based entirely on the contents of the open document.

---

## 2. Fundamental Requirements (Before you start)
For the plugin to work, **Ollama** must be running on your computer.

### Verify Ollama and enable "CORS" (Crucial!)
Ollama must accept requests coming from EURO-OFFICE. To do this, it must be launched with the environment variable `OLLAMA_ORIGINS` set to `*`.
* **On Windows:**
  1. Close Ollama from the tray icon in the bottom right corner (right-click -> *Quit*).
  2. Open the Start menu, search for **Environment Variables** and open it.
  3. Click on **Environment Variables...** at the bottom.
  4. Under "User variables", click **New...**.
  5. Enter Name: `OLLAMA_ORIGINS` and Value: `*`.
  6. Confirm everything by clicking OK.
  7. Relaunch Ollama.

### Recommended Models to Download
Open the command prompt (search for `cmd` on Start) and download these models:
* For writing and chatting: `ollama run qwen2.5-coder:7b` (or `llama3`)
* For document analysis and search (RAG): `ollama pull nomic-embed-text`

---

## 3. How to Install the Plugin
We have prepared a package called `OllamaUnified.plugin`.

### Method A (Easiest):
1. Open **EURO-OFFICE Desktop Editors**.
2. Open any document.
3. Go to the **Plugins** (or **Componenti** if in Italian) tab at the top.
4. Click on the **Settings** button (or *Add plugin* if visible).
5. Select the `OllamaUnified.plugin` file and click Open. The plugin will install itself and appear in the top bar!

### Method B (Manual Installation):
If you want to install it manually, extract the files of the plugin inside the following folder on your computer:
`C:\Users\<YourUsername>\AppData\Local\EURO-OFFICE\DesktopEditors\data\sdkjs-plugins\{962B81F2-28C3-4486-A05D-392F8566F817}`

---

## 4. First Run and Setup (⚙️)
1. Click the **Plugins** tab at the top of EURO-OFFICE and then click the **Ollama Unified v1.1** icon. The right sidebar will open.
2. Go to the tab with the gear icon (**⚙️**).
3. **Select your language:** Under *Select Language*, choose between 🇮🇹 Italiano, 🇬🇧 English, 🇫🇷 Français, or 🇪🇸 Español. The UI and LLM prompts will instantly translate!
4. **Connect to Ollama:** Click **Connect & Update**.
5. **Select Models:**
   * **Main Model:** choose the model for writing tasks (e.g. `qwen2.5-coder:7b` or `llama3`).
   * **Embedding Model:** choose `nomic-embed-text:latest`. This model is essential for the Chat/search function.

---

## 5. How to Use Writing Features

### Rewrite or improve text:
1. In your document, **highlight with your mouse** the sentence or paragraph you wish to modify.
2. Go to the **Rewrite** tab of the plugin.
3. Click on one of the buttons:
   * **✨ Improve:** makes the text flow better, corrects grammar, and refines wording.
   * **➕ Expand:** adds relevant details and develops concepts.
   * **Reduce:** shortens the text, removing fluff.
   * **Synthesis:** summarizes the text in 1 or 2 sentences.
   * **📖 Plain Language:** rewrites the text in a very simple, direct way, eliminating jargon.
4. The AI will process the text (the status bar indicator will pulse orange) and replace the selected text in the document with the new one!

### Change Tone (Tone):
1. **Highlight the text** you want to change in the document.
2. Go to the **Tone** tab of the plugin.
3. Click on the desired style (e.g. **👔 Formal**, **☕ Informal**, **🎭 Ironic**, **👁️ Conspiratorial**, etc.).
4. The AI will rewrite the selection in the chosen style.

### Digital Facilitator (Simplify):
Designed to help explain complex or technical terms to elderly or non-expert audiences.
1. Highlight a word or text.
2. Click **💡 Explain Simply** (creates everyday analogies) or **🔢 Create Step-by-Step Guide** (creates an easy-to-follow numbered list).

---

## 6. Chat with the Document (RAG)
This feature allows you to ask questions about the entire text of the open document (e.g. *"What are the deadlines mentioned in the contract?"* or *"Summarize the key points"*).

1. Open the **Chat** tab in the plugin.
2. Click **🔍 Index Document**.
3. The plugin will analyze the document, split it into chunks, and vectorize them using `nomic-embed-text`. You will see progress in the status bar.
4. Once completed, type a question in the bottom box (*"Ask a question..."*) and click the arrow (**➔**) or press Enter.
5. The AI will read the relevant parts of the document and respond directly in the chat bubbles!

---

## 7. Troubleshooting

#### The plugin shows "Ollama connection error" or won't load models:
* Check that the Ollama app is running on your computer.
* Ensure you configured the environment variable `OLLAMA_ORIGINS` to `*` and restarted Ollama (see section 2).

#### The Chat shows "Embeddings error":
* Verify you downloaded the embedding model by running `ollama pull nomic-embed-text` in your command prompt and selected it in the settings tab (⚙️) of the plugin.

#### Nothing happens when I click buttons:
* Make sure you **highlighted/selected text** in the document before clicking a rewriting button.
