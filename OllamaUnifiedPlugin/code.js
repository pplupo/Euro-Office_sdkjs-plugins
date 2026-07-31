/**
 * Ollama Unified Plugin for Euro-Office - Multilingual Edition
 */

(function (window, undefined) {

    var currentLang = "it";

    var storedConfig = {
        url: "http://localhost:11434",
        model: "qwen2.5-coder:7b",
        embedModel: "nomic-embed-text:latest",
        apiKey: ""
    };

    function buildRequestHeaders(extra) {
        var headers = extra || {};
        if (storedConfig.apiKey) {
            headers["Authorization"] = "Bearer " + storedConfig.apiKey;
        }
        return headers;
    }

    var textA = "";

    // Simple RAG State
    var docChunks = [];
    var docEmbeddings = [];
    var isIndexed = false;

    // --- Localization Dictionary ---
    var locales = {
        it: {
            tab_rewrite: "Riscrivi",
            tab_tone: "Tono",
            tab_simplify: "Semplice",
            tab_tools: "Strumenti",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Elaborazione Testo",
            btn_improve: "✨ Migliora",
            btn_expand: "➕ Espandi",
            btn_reduce: "➖ Riduci",
            btn_summarize_short: "🎯 Sintesi",
            btn_plain_language: "📖 Linguaggio Chiaro",
            protocols_title: "Protocolli di Riscrittura",
            btn_proto1: "De Mauro (Base)",
            btn_proto2: "Protocollo 2 (Medio)",
            btn_proto3: "Protocollo 3 (Complesso)",
            tone_title: "Cambia Stile o Tono",
            tone_desc: "Seleziona del testo nel documento e applica uno stile di riscrittura specifico.",
            btn_tone_formal: "👔 Formale",
            btn_tone_informal: "☕ Informale",
            btn_tone_persuasive: "🗣️ Persuasivo",
            btn_tone_ironic: "🎭 Ironico",
            btn_tone_assertive: "⚡ Assertivo",
            btn_tone_diplomatic: "🦹 Diplomatico",
            btn_tone_conspiracy: "👁️ Complottista",
            btn_tone_defensive: "🛡️ Difensivo",
            btn_tone_rhetorical: "🏛️ Retorico",
            facilitator_title: "Facilitatore Digitale",
            facilitator_desc: "Rendi i concetti digitali o burocratici facili per un pubblico senior.",
            btn_explain_simple: "💡 Spiega Semplice",
            btn_create_guide: "🔢 Crea Guida Passo-Passo",
            tools_title: "Analisi e Sintesi Avanzata",
            btn_summarize_selection: "📋 Riassumi Selezione",
            btn_readability_analysis: "📊 Analisi Leggibilità",
            btn_store_a: "💾 Memorizza A",
            btn_synthesis_ab: "🔄 Sintesi A+B",
            gen_title: "Generazione Contenuti",
            label_image_prompt_type: "Tipo di prompt immagini:",
            opt_img_decor: "Decorativa (Interesse visivo)",
            opt_img_mnem: "Mnemonica (Ricordare concetti)",
            opt_img_repr: "Rappresentativa (Foto reale)",
            opt_img_org: "Organizzativa (Mappe/Diagrammi)",
            opt_img_rel: "Relazionale (Grafici quantitativi)",
            opt_img_transf: "Trasformazionale (Ciclo/Sequenza)",
            opt_img_interp: "Interpretativa (Concetti astratti)",
            btn_generate_image_prompt: "🖼️ Genera Prompt Immagine",
            btn_expand_bullets: "📑 Espandi in Elenco Puntato",
            btn_speaker_notes: "🎙️ Genera Note Oratore",
            btn_create_json_slide: "📐 Crea JSON Slide",
            chat_title: "Chat col Documento",
            btn_index_doc: "🔍 Indicizza Documento",
            btn_reindex_doc: "🔄 Re-Indicizza Documento",
            chat_input_placeholder: "Fai una domanda...",
            lang_title: "Impostazioni Lingua",
            label_lang: "Seleziona Lingua:",
            server_title: "Configurazione Server",
            label_ollama_url: "URL Server Ollama:",
            label_api_key: "Chiave API (opzionale):",
            btn_connect_update: "🔄 Connetti e Aggiorna",
            models_title: "Impostazioni Modelli",
            label_main_model: "Modello Principale (Chat/Generazione):",
            label_embed_model: "Modello Embedding (RAG/Ricerca):",
            system_reqs_title: "Requisiti di Sistema",
            system_reqs_desc: "Avvia Ollama configurando il CORS con l'origine del plugin:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Per gli embeddings, si raccomanda:<br><code>nomic-embed-text</code>",
            
            // Statuses
            status_ready: "Pronto.",
            status_connecting: "Recupero modelli...",
            status_reading: "Lettura documento...",
            status_read_selection: "Leggo selezione...",
            status_processing: "Elaborazione in corso...",
            status_inserting: "Inserimento...",
            status_error_conn: "Errore connessione Ollama.",
            status_error_no_model: "Seleziona un modello valido.",
            status_error_no_selection: "Nessun testo selezionato!",
            status_error_no_text_a: "Errore: Testo A non memorizzato!",
            status_indexing: "Indicizzazione in corso...",
            status_indexing_completed: "Indicizzazione completata!",
            status_indexing_error: "Errore embeddings col modello ",
            status_rag_searching: "Ricerca del contesto...",
            status_rag_generating: "Generazione risposta...",
            status_rag_error_query: "Impossibile calcolare il vettore per la domanda.",
            
            // RAG Messages
            rag_welcome: "Benvenuto! Fai una domanda sul documento corrente. Indicizzalo prima per abilitare il RAG.",
            rag_system_no_index: "Rispondo senza contesto (documento non indicizzato)...",
            rag_system_indexed: "Documento indicizzato con successo. Ora puoi fare domande.",
            rag_system_error: "Errore durante l'indicizzazione. Controlla il modello di embedding.",
            rag_empty_doc: "Il documento è vuoto."
        },
        en: {
            tab_rewrite: "Rewrite",
            tab_tone: "Tone",
            tab_simplify: "Simplify",
            tab_tools: "Tools",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Text Processing",
            btn_improve: "✨ Improve",
            btn_expand: "➕ Expand",
            btn_reduce: "➖ Reduce",
            btn_summarize_short: "🎯 Synthesis",
            btn_plain_language: "📖 Plain Language",
            protocols_title: "Rewrite Protocols",
            btn_proto1: "Basic English (Base)",
            btn_proto2: "Protocol 2 (Medium)",
            btn_proto3: "Protocol 3 (Complex)",
            tone_title: "Change Style or Tone",
            tone_desc: "Select text in the document and apply a specific rewrite style.",
            btn_tone_formal: "👔 Formal",
            btn_tone_informal: "☕ Informal",
            btn_tone_persuasive: "🗣️ Persuasive",
            btn_tone_ironic: "🎭 Ironic",
            btn_tone_assertive: "⚡ Assertive",
            btn_tone_diplomatic: "🦹 Diplomatic",
            btn_tone_conspiracy: "👁️ Conspiratorial",
            btn_tone_defensive: "🛡️ Defensive",
            btn_tone_rhetorical: "🏛️ Rhetorical",
            facilitator_title: "Digital Facilitator",
            facilitator_desc: "Make digital or bureaucratic concepts easy for a senior audience.",
            btn_explain_simple: "💡 Explain Simply",
            btn_create_guide: "🔢 Create Step-by-Step Guide",
            tools_title: "Advanced Analysis & Synthesis",
            btn_summarize_selection: "📋 Summarize Selection",
            btn_readability_analysis: "📊 Readability Analysis",
            btn_store_a: "💾 Store A",
            btn_synthesis_ab: "🔄 Synthesis A+B",
            gen_title: "Content Generation",
            label_image_prompt_type: "Image prompt type:",
            opt_img_decor: "Decorative (Visual interest)",
            opt_img_mnem: "Mnemonic (Recall concepts)",
            opt_img_repr: "Representative (Real photo)",
            opt_img_org: "Organizational (Maps/Diagrams)",
            opt_img_rel: "Relational (Quantitative charts)",
            opt_img_transf: "Transformational (Cycle/Sequence)",
            opt_img_interp: "Interpretative (Abstract concepts)",
            btn_generate_image_prompt: "🖼️ Generate Image Prompt",
            btn_expand_bullets: "📑 Expand into Bullet List",
            btn_speaker_notes: "🎙️ Generate Speaker Notes",
            btn_create_json_slide: "📐 Create JSON Slide",
            chat_title: "Chat with Document",
            btn_index_doc: "🔍 Index Document",
            btn_reindex_doc: "🔄 Re-Index Document",
            chat_input_placeholder: "Ask a question...",
            lang_title: "Language Settings",
            label_lang: "Select Language:",
            server_title: "Server Configuration",
            label_ollama_url: "Ollama Server URL:",
            label_api_key: "API Key (optional):",
            btn_connect_update: "🔄 Connect & Update",
            models_title: "Model Settings",
            label_main_model: "Main Model (Chat/Generation):",
            label_embed_model: "Embedding Model (RAG/Search):",
            system_reqs_title: "System Requirements",
            system_reqs_desc: "Start Ollama configuring CORS with plugin origin:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>For embeddings, we recommend:<br><code>nomic-embed-text</code>",
            
            // Statuses
            status_ready: "Ready.",
            status_connecting: "Fetching models...",
            status_reading: "Reading document...",
            status_read_selection: "Reading selection...",
            status_processing: "Processing...",
            status_inserting: "Inserting...",
            status_error_conn: "Ollama connection error.",
            status_error_no_model: "Select a valid model.",
            status_error_no_selection: "No text selected!",
            status_error_no_text_a: "Error: Text A not stored!",
            status_indexing: "Indexing document...",
            status_indexing_completed: "Indexing completed!",
            status_indexing_error: "Embeddings error with model ",
            status_rag_searching: "Searching context...",
            status_rag_generating: "Generating response...",
            status_rag_error_query: "Could not calculate vector for query.",
            
            // RAG Messages
            rag_welcome: "Welcome! Ask a question about the current document. Index it first to enable RAG.",
            rag_system_no_index: "Answering without context (document not indexed)...",
            rag_system_indexed: "Document indexed successfully. You can now ask questions.",
            rag_system_error: "Error during indexing. Check the embedding model.",
            rag_empty_doc: "The document is empty."
        },
        fr: {
            tab_rewrite: "Réécrire",
            tab_tone: "Ton",
            tab_simplify: "Simplifier",
            tab_tools: "Outils",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Traitement de Texte",
            btn_improve: "✨ Améliorer",
            btn_expand: "➕ Élargir",
            btn_reduce: "➖ Réduire",
            btn_summarize_short: "🎯 Synthèse",
            btn_plain_language: "📖 Langage Clair",
            protocols_title: "Protocoles de Réécriture",
            btn_proto1: "Français Fondamental (Base)",
            btn_proto2: "Protocole 2 (Moyen)",
            btn_proto3: "Protocole 3 (Complexe)",
            tone_title: "Changer le Style ou le Ton",
            tone_desc: "Sélectionnez du texte dans le document et appliquez un style de réécriture spécifique.",
            btn_tone_formal: "👔 Formel",
            btn_tone_informal: "☕ Informel",
            btn_tone_persuasive: "🗣️ Persuasif",
            btn_tone_ironic: "🎭 Ironique",
            btn_tone_assertive: "⚡ Assertif",
            btn_tone_diplomatic: "🦹 Diplomatique",
            btn_tone_conspiracy: "👁️ Complotiste",
            btn_tone_defensive: "🛡️ Défensif",
            btn_tone_rhetorical: "🏛️ Rhétorique",
            facilitator_title: "Facilitateur Numérique",
            facilitator_desc: "Rendre les concepts numériques ou bureaucratiques faciles pour un public senior.",
            btn_explain_simple: "💡 Expliquer Simplement",
            btn_create_guide: "🔢 Créer un Guide Étape par Étape",
            tools_title: "Analyse et Synthèse Avancée",
            btn_summarize_selection: "📋 Résumer la Sélection",
            btn_readability_analysis: "📊 Analyse de Lisibilité",
            btn_store_a: "💾 Mémoriser A",
            btn_synthesis_ab: "🔄 Synthèse A+B",
            gen_title: "Génération de Contenu",
            label_image_prompt_type: "Type de prompt d'image:",
            opt_img_decor: "Décoratif (Intérêt visuel)",
            opt_img_mnem: "Mnémonique (Rappeler les concepts)",
            opt_img_repr: "Représentatif (Photo réelle)",
            opt_img_org: "Organisationnel (Mappes/Diagrammes)",
            opt_img_rel: "Relationnel (Graphiques quantitatifs)",
            opt_img_transf: "Transformationnel (Cycle/Séquence)",
            opt_img_interp: "Interprétatif (Concepts abstraits)",
            btn_generate_image_prompt: "🖼️ Générer un Prompt d'Image",
            btn_expand_bullets: "📑 Développer en Liste à Puces",
            btn_speaker_notes: "🎙️ Générer des Notes d'Orateur",
            btn_create_json_slide: "📐 Créer JSON Slide",
            chat_title: "Chat avec le Document",
            btn_index_doc: "🔍 Indexer le Document",
            btn_reindex_doc: "🔄 Ré-Indexer le Document",
            chat_input_placeholder: "Posez une question...",
            lang_title: "Paramètres de Langue",
            label_lang: "Sélectionner la Langue:",
            server_title: "Configuration du Serveur",
            label_ollama_url: "URL du Serveur Ollama:",
            label_api_key: "Clé API (optionnelle) :",
            btn_connect_update: "🔄 Connecter & Mettre à Jour",
            models_title: "Paramètres des Modèles",
            label_main_model: "Modèle Principal (Chat/Génération):",
            label_embed_model: "Modèle d'Embedding (RAG/Recherche):",
            system_reqs_title: "Configuration Requise",
            system_reqs_desc: "Démarrez Ollama en configurant le CORS avec l'origine du plugin:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Pour les embeddings, il est recommandé :<br><code>nomic-embed-text</code>",
            
            // Statuses
            status_ready: "Prêt.",
            status_connecting: "Connexion aux modèles...",
            status_reading: "Lecture du document...",
            status_read_selection: "Lecture de la sélection...",
            status_processing: "Traitement en cours...",
            status_inserting: "Insertion...",
            status_error_conn: "Erreur de connexion Ollama.",
            status_error_no_model: "Sélectionnez un modèle valide.",
            status_error_no_selection: "Aucun texte sélectionné !",
            status_error_no_text_a: "Erreur: Texte A non mémorisé !",
            status_indexing: "Indexation du document...",
            status_indexing_completed: "Indexation complétée !",
            status_indexing_error: "Erreur embeddings avec le modèle ",
            status_rag_searching: "Recherche du contexte...",
            status_rag_generating: "Génération de la réponse...",
            status_rag_error_query: "Impossible de calculer le vecteur pour la question.",
            
            // RAG Messages
            rag_welcome: "Bienvenue ! Posez une question sur le document actuel. Indexez-le d'abord pour activer le RAG.",
            rag_system_no_index: "Réponse sans contexte (document non indexé)...",
            rag_system_indexed: "Document indexé avec succès. Vous pouvez maintenant poser des questions.",
            rag_system_error: "Erreur lors de l'indexation. Vérifiez le modèle d'embedding.",
            rag_empty_doc: "Le document est vide."
        },
        es: {
            tab_rewrite: "Reescribir",
            tab_tone: "Tono",
            tab_simplify: "Simplificar",
            tab_tools: "Herramientas",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Procesamiento de Texto",
            btn_improve: "✨ Mejorar",
            btn_expand: "➕ Expandir",
            btn_reduce: "➖ Reducir",
            btn_summarize_short: "🎯 Síntesis",
            btn_plain_language: "📖 Lenguaje Claro",
            protocols_title: "Protocolos de Reescritura",
            btn_proto1: "Lectura Fácil (Base)",
            btn_proto2: "Protocolo 2 (Medio)",
            btn_proto3: "Protocolo 3 (Complejo)",
            tone_title: "Cambiar Estilo o Tono",
            tone_desc: "Seleccione texto en el documento y aplique un estilo de reescritura específico.",
            btn_tone_formal: "👔 Formal",
            btn_tone_informal: "☕ Informal",
            btn_tone_persuasive: "🗣️ Persuasivo",
            btn_tone_ironic: "🎭 Irónico",
            btn_tone_assertive: "⚡ Asertivo",
            btn_tone_diplomatic: "🦹 Diplomático",
            btn_tone_conspiracy: "👁️ Conspirativo",
            btn_tone_defensive: "🛡️ Defensivo",
            btn_tone_rhetorical: "🏛️ Retórico",
            facilitator_title: "Facilitador Digital",
            facilitator_desc: "Haga que los conceptos digitales o burocráticos sean sencillos para un público senior.",
            btn_explain_simple: "💡 Explicar Sencillo",
            btn_create_guide: "🔢 Crear Guía Paso a Paso",
            tools_title: "Análisis y Síntesis Avanzado",
            btn_summarize_selection: "📋 Resumir Selección",
            btn_readability_analysis: "📊 Análisis de Legibilidad",
            btn_store_a: "💾 Memorizar A",
            btn_synthesis_ab: "🔄 Síntesis A+B",
            gen_title: "Generación de Contenido",
            label_image_prompt_type: "Tipo de prompt de imagen:",
            opt_img_decor: "Decorativa (Interés visual)",
            opt_img_mnem: "Mnemónica (Recordar conceptos)",
            opt_img_repr: "Representativa (Foto real)",
            opt_img_org: "Organizativa (Mapas/Diagramas)",
            opt_img_rel: "Relacional (Gráficos cuantitativos)",
            opt_img_transf: "Transformacional (Ciclo/Secuencia)",
            opt_img_interp: "Interpretativa (Conceptos abstractos)",
            btn_generate_image_prompt: "🖼️ Generar Prompt de Imagen",
            btn_expand_bullets: "📑 Expandir en Lista de Viñetas",
            btn_speaker_notes: "🎙️ Generar Notas de Orador",
            btn_create_json_slide: "📐 Crear JSON Slide",
            chat_title: "Chat con el Documento",
            btn_index_doc: "🔍 Indexar Documento",
            btn_reindex_doc: "🔄 Re-Indexar Documento",
            chat_input_placeholder: "Haga una pregunta...",
            lang_title: "Ajustes de Idioma",
            label_lang: "Seleccionar Idioma:",
            server_title: "Configuración del Servidor",
            label_ollama_url: "URL del Servidor Ollama:",
            label_api_key: "Clave API (opcional):",
            btn_connect_update: "🔄 Conectar y Actualizar",
            models_title: "Ajustes de Modelos",
            label_main_model: "Modelo Principal (Chat/Generación):",
            label_embed_model: "Modelo de Embedding (RAG/Búsqueda):",
            system_reqs_title: "Requisitos del Sistema",
            system_reqs_desc: "Inicie Ollama configurando el CORS con el origen del plugin:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Para los embeddings, se recomienda:<br><code>nomic-embed-text</code>",
            
            // Statuses
            status_ready: "Listo.",
            status_connecting: "Recuperando modelos...",
            status_reading: "Leyendo documento...",
            status_read_selection: "Leyendo selección...",
            status_processing: "Procesando...",
            status_inserting: "Insertando...",
            status_error_conn: "Error de conexión Ollama.",
            status_error_no_model: "Seleccione un modelo válido.",
            status_error_no_selection: "¡Ningún texto seleccionado!",
            status_error_no_text_a: "¡Error: Texto A no memorizado!",
            status_indexing: "Indizando documento...",
            status_indexing_completed: "¡Indización completada!",
            status_indexing_error: "Error embeddings con el modelo ",
            status_rag_searching: "Buscando contexto...",
            status_rag_generating: "Generando respuesta...",
            status_rag_error_query: "No se pudo calcular el vector para la pregunta.",
            
            // RAG Messages
            rag_welcome: "¡Bienvenido! Haga una pregunta sobre el documento actual. Indícelo primero para activar el RAG.",
            rag_system_no_index: "Respondiendo sin contexto (documento no indizado)...",
            rag_system_indexed: "Documento indizado con éxito. Ya puede hacer preguntas.",
            rag_system_error: "Error durante la indización. Compruebe el modelo de embedding.",
            rag_empty_doc: "El documento está vacío."
        },
        pt: {
            tab_rewrite: "Reescrever",
            tab_tone: "Tom",
            tab_simplify: "Simplificar",
            tab_tools: "Ferramentas",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Processamento de Texto",
            btn_improve: "✨ Melhorar",
            btn_expand: "➕ Expandir",
            btn_reduce: "➖ Reduzir",
            btn_summarize_short: "🎯 Síntese",
            btn_plain_language: "📖 Linguagem Simples",
            protocols_title: "Protocolos de Reescrita",
            btn_proto1: "Linguagem Simples (Base)",
            btn_proto2: "Protocolo 2 (Médio)",
            btn_proto3: "Protocolo 3 (Complexo)",
            tone_title: "Mudar Estilo ou Tom",
            tone_desc: "Selecione texto no documento e aplique um estilo de reescrita específico.",
            btn_tone_formal: "👔 Formal",
            btn_tone_informal: "☕ Informal",
            btn_tone_persuasive: "🗣️ Persuasivo",
            btn_tone_ironic: "🎭 Irônico",
            btn_tone_assertive: "⚡ Assertivo",
            btn_tone_diplomatic: "🦹 Diplomático",
            btn_tone_conspiracy: "👁️ Conspiracionista",
            btn_tone_defensive: "🛡️ Defensivo",
            btn_tone_rhetorical: "🏛️ Retórico",
            facilitator_title: "Facilitador Digital",
            facilitator_desc: "Torne conceitos digitais ou burocráticos fáceis para um público sênior.",
            btn_explain_simple: "💡 Explicar de Forma Simples",
            btn_create_guide: "🔢 Criar Guia Passo a Passo",
            tools_title: "Análise e Síntese Avançada",
            btn_summarize_selection: "📋 Resumir Seleção",
            btn_readability_analysis: "📊 Análise de Legibilidade",
            btn_store_a: "💾 Memorizar A",
            btn_synthesis_ab: "🔄 Síntese A+B",
            gen_title: "Geração de Conteúdo",
            label_image_prompt_type: "Tipo de prompt de imagem:",
            opt_img_decor: "Decorativa (Interesse visual)",
            opt_img_mnem: "Mnemônica (Lembrar conceitos)",
            opt_img_repr: "Representativa (Foto real)",
            opt_img_org: "Organizacional (Mapas/Diagramas)",
            opt_img_rel: "Relacional (Gráficos quantitativos)",
            opt_img_transf: "Transformacional (Ciclo/Sequência)",
            opt_img_interp: "Interpretativa (Conceitos abstratos)",
            btn_generate_image_prompt: "🖼️ Gerar Prompt de Imagem",
            btn_expand_bullets: "📑 Expandir em Lista de Tópicos",
            btn_speaker_notes: "🎙️ Gerar Notas do Orador",
            btn_create_json_slide: "📐 Criar JSON Slide",
            chat_title: "Chat com o Documento",
            btn_index_doc: "🔍 Indexar Documento",
            btn_reindex_doc: "🔄 Reindexar Documento",
            chat_input_placeholder: "Faça uma pergunta...",
            lang_title: "Configurações de Idioma",
            label_lang: "Selecionar Idioma:",
            server_title: "Configuração do Servidor",
            label_ollama_url: "URL do Servidor Ollama:",
            label_api_key: "Chave de API (opcional):",
            btn_connect_update: "🔄 Conectar e Atualizar",
            models_title: "Configurações de Modelos",
            label_main_model: "Modelo Principal (Chat/Geração):",
            label_embed_model: "Modelo de Embedding (RAG/Busca):",
            system_reqs_title: "Requisitos do Sistema",
            system_reqs_desc: "Inicie o Ollama configurando o CORS com a origem do plugin:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Para embeddings, recomenda-se:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Pronto.",
            status_connecting: "Buscando modelos...",
            status_reading: "Lendo documento...",
            status_read_selection: "Lendo seleção...",
            status_processing: "Processando...",
            status_inserting: "Inserindo...",
            status_error_conn: "Erro de conexão com o Ollama.",
            status_error_no_model: "Selecione um modelo válido.",
            status_error_no_selection: "Nenhum texto selecionado!",
            status_error_no_text_a: "Erro: Texto A não memorizado!",
            status_indexing: "Indexando documento...",
            status_indexing_completed: "Indexação concluída!",
            status_indexing_error: "Erro de embeddings com o modelo ",
            status_rag_searching: "Buscando contexto...",
            status_rag_generating: "Gerando resposta...",
            status_rag_error_query: "Não foi possível calcular o vetor para a pergunta.",

            // RAG Messages
            rag_welcome: "Bem-vindo! Faça uma pergunta sobre o documento atual. Indexe-o primeiro para ativar o RAG.",
            rag_system_no_index: "Respondendo sem contexto (documento não indexado)...",
            rag_system_indexed: "Documento indexado com sucesso. Agora você pode fazer perguntas.",
            rag_system_error: "Erro durante a indexação. Verifique o modelo de embedding.",
            rag_empty_doc: "O documento está vazio."
        },
        de: {
            tab_rewrite: "Umschreiben",
            tab_tone: "Ton",
            tab_simplify: "Vereinfachen",
            tab_tools: "Werkzeuge",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Textverarbeitung",
            btn_improve: "✨ Verbessern",
            btn_expand: "➕ Erweitern",
            btn_reduce: "➖ Kürzen",
            btn_summarize_short: "🎯 Zusammenfassung",
            btn_plain_language: "📖 Einfache Sprache",
            protocols_title: "Umschreibeprotokolle",
            btn_proto1: "Leichte Sprache (Basis)",
            btn_proto2: "Protokoll 2 (Mittel)",
            btn_proto3: "Protokoll 3 (Komplex)",
            tone_title: "Stil oder Ton ändern",
            tone_desc: "Wählen Sie Text im Dokument aus und wenden Sie einen bestimmten Umschreibstil an.",
            btn_tone_formal: "👔 Formell",
            btn_tone_informal: "☕ Informell",
            btn_tone_persuasive: "🗣️ Überzeugend",
            btn_tone_ironic: "🎭 Ironisch",
            btn_tone_assertive: "⚡ Bestimmt",
            btn_tone_diplomatic: "🦹 Diplomatisch",
            btn_tone_conspiracy: "👁️ Verschwörerisch",
            btn_tone_defensive: "🛡️ Defensiv",
            btn_tone_rhetorical: "🏛️ Rhetorisch",
            facilitator_title: "Digitaler Vermittler",
            facilitator_desc: "Machen Sie digitale oder bürokratische Konzepte für ein älteres Publikum leicht verständlich.",
            btn_explain_simple: "💡 Einfach Erklären",
            btn_create_guide: "🔢 Schritt-für-Schritt-Anleitung Erstellen",
            tools_title: "Erweiterte Analyse und Synthese",
            btn_summarize_selection: "📋 Auswahl Zusammenfassen",
            btn_readability_analysis: "📊 Lesbarkeitsanalyse",
            btn_store_a: "💾 A Speichern",
            btn_synthesis_ab: "🔄 Synthese A+B",
            gen_title: "Inhaltserstellung",
            label_image_prompt_type: "Bild-Prompt-Typ:",
            opt_img_decor: "Dekorativ (Visuelles Interesse)",
            opt_img_mnem: "Mnemonisch (Konzepte Merken)",
            opt_img_repr: "Repräsentativ (Echtes Foto)",
            opt_img_org: "Organisatorisch (Karten/Diagramme)",
            opt_img_rel: "Relational (Quantitative Diagramme)",
            opt_img_transf: "Transformational (Zyklus/Sequenz)",
            opt_img_interp: "Interpretativ (Abstrakte Konzepte)",
            btn_generate_image_prompt: "🖼️ Bild-Prompt Generieren",
            btn_expand_bullets: "📑 In Aufzählungsliste Erweitern",
            btn_speaker_notes: "🎙️ Redenotizen Generieren",
            btn_create_json_slide: "📐 JSON-Folie Erstellen",
            chat_title: "Chat mit dem Dokument",
            btn_index_doc: "🔍 Dokument Indizieren",
            btn_reindex_doc: "🔄 Dokument Neu Indizieren",
            chat_input_placeholder: "Stellen Sie eine Frage...",
            lang_title: "Spracheinstellungen",
            label_lang: "Sprache Auswählen:",
            server_title: "Serverkonfiguration",
            label_ollama_url: "Ollama-Server-URL:",
            label_api_key: "API-Schlüssel (optional):",
            btn_connect_update: "🔄 Verbinden & Aktualisieren",
            models_title: "Modelleinstellungen",
            label_main_model: "Hauptmodell (Chat/Generierung):",
            label_embed_model: "Embedding-Modell (RAG/Suche):",
            system_reqs_title: "Systemanforderungen",
            system_reqs_desc: "Starten Sie Ollama und konfigurieren Sie CORS mit dem Plugin-Ursprung:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Für Embeddings wird empfohlen:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Bereit.",
            status_connecting: "Modelle werden abgerufen...",
            status_reading: "Dokument wird gelesen...",
            status_read_selection: "Auswahl wird gelesen...",
            status_processing: "Verarbeitung läuft...",
            status_inserting: "Wird eingefügt...",
            status_error_conn: "Ollama-Verbindungsfehler.",
            status_error_no_model: "Wählen Sie ein gültiges Modell.",
            status_error_no_selection: "Kein Text ausgewählt!",
            status_error_no_text_a: "Fehler: Text A nicht gespeichert!",
            status_indexing: "Dokument wird indiziert...",
            status_indexing_completed: "Indizierung abgeschlossen!",
            status_indexing_error: "Embedding-Fehler mit Modell ",
            status_rag_searching: "Kontext wird gesucht...",
            status_rag_generating: "Antwort wird generiert...",
            status_rag_error_query: "Vektor für die Frage konnte nicht berechnet werden.",

            // RAG Messages
            rag_welcome: "Willkommen! Stellen Sie eine Frage zum aktuellen Dokument. Indizieren Sie es zuerst, um RAG zu aktivieren.",
            rag_system_no_index: "Antwort ohne Kontext (Dokument nicht indiziert)...",
            rag_system_indexed: "Dokument erfolgreich indiziert. Sie können jetzt Fragen stellen.",
            rag_system_error: "Fehler bei der Indizierung. Überprüfen Sie das Embedding-Modell.",
            rag_empty_doc: "Das Dokument ist leer."
        },
        ro: {
            tab_rewrite: "Rescrie",
            tab_tone: "Ton",
            tab_simplify: "Simplifică",
            tab_tools: "Instrumente",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Procesare Text",
            btn_improve: "✨ Îmbunătățește",
            btn_expand: "➕ Extinde",
            btn_reduce: "➖ Reduce",
            btn_summarize_short: "🎯 Sinteză",
            btn_plain_language: "📖 Limbaj Clar",
            protocols_title: "Protocoale de Rescriere",
            btn_proto1: "Limbaj Simplu (Bază)",
            btn_proto2: "Protocol 2 (Mediu)",
            btn_proto3: "Protocol 3 (Complex)",
            tone_title: "Schimbă Stilul sau Tonul",
            tone_desc: "Selectați text din document și aplicați un stil specific de rescriere.",
            btn_tone_formal: "👔 Formal",
            btn_tone_informal: "☕ Informal",
            btn_tone_persuasive: "🗣️ Persuasiv",
            btn_tone_ironic: "🎭 Ironic",
            btn_tone_assertive: "⚡ Asertiv",
            btn_tone_diplomatic: "🦹 Diplomatic",
            btn_tone_conspiracy: "👁️ Conspiraționist",
            btn_tone_defensive: "🛡️ Defensiv",
            btn_tone_rhetorical: "🏛️ Retoric",
            facilitator_title: "Facilitator Digital",
            facilitator_desc: "Fă conceptele digitale sau birocratice ușor de înțeles pentru un public senior.",
            btn_explain_simple: "💡 Explică Simplu",
            btn_create_guide: "🔢 Creează Ghid Pas cu Pas",
            tools_title: "Analiză și Sinteză Avansată",
            btn_summarize_selection: "📋 Rezumă Selecția",
            btn_readability_analysis: "📊 Analiză de Lizibilitate",
            btn_store_a: "💾 Memorează A",
            btn_synthesis_ab: "🔄 Sinteză A+B",
            gen_title: "Generare de Conținut",
            label_image_prompt_type: "Tip de prompt de imagine:",
            opt_img_decor: "Decorativă (Interes vizual)",
            opt_img_mnem: "Mnemonică (Reamintirea conceptelor)",
            opt_img_repr: "Reprezentativă (Fotografie reală)",
            opt_img_org: "Organizațională (Hărți/Diagrame)",
            opt_img_rel: "Relațională (Grafice cantitative)",
            opt_img_transf: "Transformațională (Ciclu/Secvență)",
            opt_img_interp: "Interpretativă (Concepte abstracte)",
            btn_generate_image_prompt: "🖼️ Generează Prompt de Imagine",
            btn_expand_bullets: "📑 Extinde într-o Listă cu Puncte",
            btn_speaker_notes: "🎙️ Generează Note pentru Vorbitor",
            btn_create_json_slide: "📐 Creează JSON Slide",
            chat_title: "Chat cu Documentul",
            btn_index_doc: "🔍 Indexează Documentul",
            btn_reindex_doc: "🔄 Reindexează Documentul",
            chat_input_placeholder: "Pune o întrebare...",
            lang_title: "Setări de Limbă",
            label_lang: "Selectează Limba:",
            server_title: "Configurare Server",
            label_ollama_url: "URL Server Ollama:",
            label_api_key: "Cheie API (opțional):",
            btn_connect_update: "🔄 Conectează și Actualizează",
            models_title: "Setări Modele",
            label_main_model: "Model Principal (Chat/Generare):",
            label_embed_model: "Model de Embedding (RAG/Căutare):",
            system_reqs_title: "Cerințe de Sistem",
            system_reqs_desc: "Pornește Ollama configurând CORS cu originea pluginului:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Pentru embeddings, se recomandă:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Gata.",
            status_connecting: "Se preiau modelele...",
            status_reading: "Se citește documentul...",
            status_read_selection: "Se citește selecția...",
            status_processing: "Se procesează...",
            status_inserting: "Se inserează...",
            status_error_conn: "Eroare de conexiune Ollama.",
            status_error_no_model: "Selectați un model valid.",
            status_error_no_selection: "Niciun text selectat!",
            status_error_no_text_a: "Eroare: Textul A nu a fost memorat!",
            status_indexing: "Se indexează documentul...",
            status_indexing_completed: "Indexare finalizată!",
            status_indexing_error: "Eroare embeddings cu modelul ",
            status_rag_searching: "Se caută contextul...",
            status_rag_generating: "Se generează răspunsul...",
            status_rag_error_query: "Nu s-a putut calcula vectorul pentru întrebare.",

            // RAG Messages
            rag_welcome: "Bine ai venit! Pune o întrebare despre documentul curent. Indexează-l mai întâi pentru a activa RAG.",
            rag_system_no_index: "Se răspunde fără context (documentul nu este indexat)...",
            rag_system_indexed: "Documentul a fost indexat cu succes. Acum poți pune întrebări.",
            rag_system_error: "Eroare la indexare. Verifică modelul de embedding.",
            rag_empty_doc: "Documentul este gol."
        },
        nb: {
            tab_rewrite: "Omskriv",
            tab_tone: "Tone",
            tab_simplify: "Forenkle",
            tab_tools: "Verktøy",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Tekstbehandling",
            btn_improve: "✨ Forbedre",
            btn_expand: "➕ Utvid",
            btn_reduce: "➖ Reduser",
            btn_summarize_short: "🎯 Sammendrag",
            btn_plain_language: "📖 Klarspråk",
            protocols_title: "Omskrivingsprotokoller",
            btn_proto1: "Enkelt Språk (Grunnleggende)",
            btn_proto2: "Protokoll 2 (Middels)",
            btn_proto3: "Protokoll 3 (Kompleks)",
            tone_title: "Endre Stil eller Tone",
            tone_desc: "Velg tekst i dokumentet og bruk en spesifikk omskrivingsstil.",
            btn_tone_formal: "👔 Formell",
            btn_tone_informal: "☕ Uformell",
            btn_tone_persuasive: "🗣️ Overbevisende",
            btn_tone_ironic: "🎭 Ironisk",
            btn_tone_assertive: "⚡ Bestemt",
            btn_tone_diplomatic: "🦹 Diplomatisk",
            btn_tone_conspiracy: "👁️ Konspiratorisk",
            btn_tone_defensive: "🛡️ Defensiv",
            btn_tone_rhetorical: "🏛️ Retorisk",
            facilitator_title: "Digital Tilrettelegger",
            facilitator_desc: "Gjør digitale eller byråkratiske begreper enkle for et eldre publikum.",
            btn_explain_simple: "💡 Forklar Enkelt",
            btn_create_guide: "🔢 Lag Trinnvis Guide",
            tools_title: "Avansert Analyse og Syntese",
            btn_summarize_selection: "📋 Oppsummer Utvalg",
            btn_readability_analysis: "📊 Lesbarhetsanalyse",
            btn_store_a: "💾 Lagre A",
            btn_synthesis_ab: "🔄 Syntese A+B",
            gen_title: "Innholdsgenerering",
            label_image_prompt_type: "Type bildeprompt:",
            opt_img_decor: "Dekorativ (Visuell interesse)",
            opt_img_mnem: "Mnemonisk (Huske begreper)",
            opt_img_repr: "Representativ (Ekte foto)",
            opt_img_org: "Organisatorisk (Kart/Diagrammer)",
            opt_img_rel: "Relasjonell (Kvantitative diagrammer)",
            opt_img_transf: "Transformasjonell (Syklus/Sekvens)",
            opt_img_interp: "Fortolkende (Abstrakte begreper)",
            btn_generate_image_prompt: "🖼️ Generer Bildeprompt",
            btn_expand_bullets: "📑 Utvid til Punktliste",
            btn_speaker_notes: "🎙️ Generer Talernotater",
            btn_create_json_slide: "📐 Lag JSON Slide",
            chat_title: "Chat med Dokumentet",
            btn_index_doc: "🔍 Indekser Dokument",
            btn_reindex_doc: "🔄 Reindekser Dokument",
            chat_input_placeholder: "Still et spørsmål...",
            lang_title: "Språkinnstillinger",
            label_lang: "Velg Språk:",
            server_title: "Serverkonfigurasjon",
            label_ollama_url: "Ollama Server-URL:",
            label_api_key: "API-nøkkel (valgfritt):",
            btn_connect_update: "🔄 Koble til og Oppdater",
            models_title: "Modellinnstillinger",
            label_main_model: "Hovedmodell (Chat/Generering):",
            label_embed_model: "Embedding-modell (RAG/Søk):",
            system_reqs_title: "Systemkrav",
            system_reqs_desc: "Start Ollama og konfigurer CORS med plugin-opprinnelsen:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>For embeddings anbefales:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Klar.",
            status_connecting: "Henter modeller...",
            status_reading: "Leser dokument...",
            status_read_selection: "Leser utvalg...",
            status_processing: "Behandler...",
            status_inserting: "Setter inn...",
            status_error_conn: "Ollama tilkoblingsfeil.",
            status_error_no_model: "Velg en gyldig modell.",
            status_error_no_selection: "Ingen tekst valgt!",
            status_error_no_text_a: "Feil: Tekst A ikke lagret!",
            status_indexing: "Indekserer dokument...",
            status_indexing_completed: "Indeksering fullført!",
            status_indexing_error: "Embedding-feil med modell ",
            status_rag_searching: "Søker etter kontekst...",
            status_rag_generating: "Genererer svar...",
            status_rag_error_query: "Kunne ikke beregne vektor for spørsmålet.",

            // RAG Messages
            rag_welcome: "Velkommen! Still et spørsmål om det gjeldende dokumentet. Indekser det først for å aktivere RAG.",
            rag_system_no_index: "Svarer uten kontekst (dokument ikke indeksert)...",
            rag_system_indexed: "Dokumentet er indeksert. Nå kan du stille spørsmål.",
            rag_system_error: "Feil under indeksering. Sjekk embedding-modellen.",
            rag_empty_doc: "Dokumentet er tomt."
        },
        fi: {
            tab_rewrite: "Uudelleenkirjoita",
            tab_tone: "Sävy",
            tab_simplify: "Yksinkertaista",
            tab_tools: "Työkalut",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Tekstin Käsittely",
            btn_improve: "✨ Paranna",
            btn_expand: "➕ Laajenna",
            btn_reduce: "➖ Tiivistä",
            btn_summarize_short: "🎯 Synteesi",
            btn_plain_language: "📖 Selkeä Kieli",
            protocols_title: "Uudelleenkirjoitusprotokollat",
            btn_proto1: "Selkokieli (Perustaso)",
            btn_proto2: "Protokolla 2 (Keskitaso)",
            btn_proto3: "Protokolla 3 (Monimutkainen)",
            tone_title: "Muuta Tyyliä tai Sävyä",
            tone_desc: "Valitse tekstiä asiakirjasta ja käytä tiettyä uudelleenkirjoitustyyliä.",
            btn_tone_formal: "👔 Muodollinen",
            btn_tone_informal: "☕ Epämuodollinen",
            btn_tone_persuasive: "🗣️ Vakuuttava",
            btn_tone_ironic: "🎭 Ironinen",
            btn_tone_assertive: "⚡ Jämäkkä",
            btn_tone_diplomatic: "🦹 Diplomaattinen",
            btn_tone_conspiracy: "👁️ Salaliittoteoreettinen",
            btn_tone_defensive: "🛡️ Puolustava",
            btn_tone_rhetorical: "🏛️ Retorinen",
            facilitator_title: "Digitaalinen Ohjaaja",
            facilitator_desc: "Tee digitaalisista tai byrokraattisista käsitteistä helppoja ikääntyneelle yleisölle.",
            btn_explain_simple: "💡 Selitä Yksinkertaisesti",
            btn_create_guide: "🔢 Luo Vaiheittainen Opas",
            tools_title: "Edistynyt Analyysi ja Synteesi",
            btn_summarize_selection: "📋 Tiivistä Valinta",
            btn_readability_analysis: "📊 Luettavuusanalyysi",
            btn_store_a: "💾 Tallenna A",
            btn_synthesis_ab: "🔄 Synteesi A+B",
            gen_title: "Sisällön Luonti",
            label_image_prompt_type: "Kuvakehotteen tyyppi:",
            opt_img_decor: "Koristeellinen (Visuaalinen kiinnostavuus)",
            opt_img_mnem: "Muistin tukena (Käsitteiden muistaminen)",
            opt_img_repr: "Edustava (Todellinen valokuva)",
            opt_img_org: "Organisatorinen (Kartat/Kaaviot)",
            opt_img_rel: "Relationaalinen (Kvantitatiiviset kaaviot)",
            opt_img_transf: "Muuntava (Sykli/Sekvenssi)",
            opt_img_interp: "Tulkinnallinen (Abstraktit käsitteet)",
            btn_generate_image_prompt: "🖼️ Luo Kuvakehote",
            btn_expand_bullets: "📑 Laajenna Luettelomuotoon",
            btn_speaker_notes: "🎙️ Luo Puhujan Muistiinpanot",
            btn_create_json_slide: "📐 Luo JSON-dia",
            chat_title: "Keskustele Asiakirjan Kanssa",
            btn_index_doc: "🔍 Indeksoi Asiakirja",
            btn_reindex_doc: "🔄 Indeksoi Asiakirja Uudelleen",
            chat_input_placeholder: "Esitä kysymys...",
            lang_title: "Kieliasetukset",
            label_lang: "Valitse Kieli:",
            server_title: "Palvelimen Määritys",
            label_ollama_url: "Ollama-palvelimen URL:",
            label_api_key: "API-avain (valinnainen):",
            btn_connect_update: "🔄 Yhdistä ja Päivitä",
            models_title: "Mallien Asetukset",
            label_main_model: "Päämalli (Chat/Generointi):",
            label_embed_model: "Upotusmalli (RAG/Haku):",
            system_reqs_title: "Järjestelmävaatimukset",
            system_reqs_desc: "Käynnistä Ollama ja määritä CORS liitännäisen alkuperällä:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Upotuksiin suositellaan:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Valmis.",
            status_connecting: "Haetaan malleja...",
            status_reading: "Luetaan asiakirjaa...",
            status_read_selection: "Luetaan valintaa...",
            status_processing: "Käsitellään...",
            status_inserting: "Lisätään...",
            status_error_conn: "Ollama-yhteysvirhe.",
            status_error_no_model: "Valitse kelvollinen malli.",
            status_error_no_selection: "Ei valittua tekstiä!",
            status_error_no_text_a: "Virhe: Tekstiä A ei ole tallennettu!",
            status_indexing: "Indeksoidaan asiakirjaa...",
            status_indexing_completed: "Indeksointi valmis!",
            status_indexing_error: "Upotusvirhe mallilla ",
            status_rag_searching: "Haetaan kontekstia...",
            status_rag_generating: "Luodaan vastausta...",
            status_rag_error_query: "Kysymyksen vektoria ei voitu laskea.",

            // RAG Messages
            rag_welcome: "Tervetuloa! Esitä kysymys nykyisestä asiakirjasta. Indeksoi se ensin ottaaksesi RAG:n käyttöön.",
            rag_system_no_index: "Vastataan ilman kontekstia (asiakirjaa ei ole indeksoitu)...",
            rag_system_indexed: "Asiakirja indeksoitu onnistuneesti. Voit nyt esittää kysymyksiä.",
            rag_system_error: "Virhe indeksoinnissa. Tarkista upotusmalli.",
            rag_empty_doc: "Asiakirja on tyhjä."
        },
        sv: {
            tab_rewrite: "Skriv om",
            tab_tone: "Ton",
            tab_simplify: "Förenkla",
            tab_tools: "Verktyg",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Textbehandling",
            btn_improve: "✨ Förbättra",
            btn_expand: "➕ Utöka",
            btn_reduce: "➖ Förkorta",
            btn_summarize_short: "🎯 Sammanfattning",
            btn_plain_language: "📖 Klarspråk",
            protocols_title: "Omskrivningsprotokoll",
            btn_proto1: "Lättläst (Grundnivå)",
            btn_proto2: "Protokoll 2 (Medel)",
            btn_proto3: "Protokoll 3 (Komplex)",
            tone_title: "Ändra Stil eller Ton",
            tone_desc: "Markera text i dokumentet och tillämpa en specifik omskrivningsstil.",
            btn_tone_formal: "👔 Formell",
            btn_tone_informal: "☕ Informell",
            btn_tone_persuasive: "🗣️ Övertygande",
            btn_tone_ironic: "🎭 Ironisk",
            btn_tone_assertive: "⚡ Bestämd",
            btn_tone_diplomatic: "🦹 Diplomatisk",
            btn_tone_conspiracy: "👁️ Konspiratorisk",
            btn_tone_defensive: "🛡️ Defensiv",
            btn_tone_rhetorical: "🏛️ Retorisk",
            facilitator_title: "Digital Underlättare",
            facilitator_desc: "Gör digitala eller byråkratiska begrepp enkla för en äldre publik.",
            btn_explain_simple: "💡 Förklara Enkelt",
            btn_create_guide: "🔢 Skapa Steg-för-Steg-Guide",
            tools_title: "Avancerad Analys och Syntes",
            btn_summarize_selection: "📋 Sammanfatta Markering",
            btn_readability_analysis: "📊 Läsbarhetsanalys",
            btn_store_a: "💾 Spara A",
            btn_synthesis_ab: "🔄 Syntes A+B",
            gen_title: "Innehållsgenerering",
            label_image_prompt_type: "Typ av bildprompt:",
            opt_img_decor: "Dekorativ (Visuellt intresse)",
            opt_img_mnem: "Mnemonisk (Komma ihåg begrepp)",
            opt_img_repr: "Representativ (Verkligt foto)",
            opt_img_org: "Organisatorisk (Kartor/Diagram)",
            opt_img_rel: "Relationell (Kvantitativa diagram)",
            opt_img_transf: "Transformationell (Cykel/Sekvens)",
            opt_img_interp: "Tolkande (Abstrakta begrepp)",
            btn_generate_image_prompt: "🖼️ Generera Bildprompt",
            btn_expand_bullets: "📑 Utöka till Punktlista",
            btn_speaker_notes: "🎙️ Generera Talarnoteringar",
            btn_create_json_slide: "📐 Skapa JSON-bild",
            chat_title: "Chatta med Dokumentet",
            btn_index_doc: "🔍 Indexera Dokument",
            btn_reindex_doc: "🔄 Omindexera Dokument",
            chat_input_placeholder: "Ställ en fråga...",
            lang_title: "Språkinställningar",
            label_lang: "Välj Språk:",
            server_title: "Serverkonfiguration",
            label_ollama_url: "Ollama-server-URL:",
            label_api_key: "API-nyckel (valfritt):",
            btn_connect_update: "🔄 Anslut och Uppdatera",
            models_title: "Modellinställningar",
            label_main_model: "Huvudmodell (Chat/Generering):",
            label_embed_model: "Embedding-modell (RAG/Sökning):",
            system_reqs_title: "Systemkrav",
            system_reqs_desc: "Starta Ollama och konfigurera CORS med pluginets ursprung:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>För embeddings rekommenderas:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Klar.",
            status_connecting: "Hämtar modeller...",
            status_reading: "Läser dokument...",
            status_read_selection: "Läser markering...",
            status_processing: "Bearbetar...",
            status_inserting: "Infogar...",
            status_error_conn: "Ollama anslutningsfel.",
            status_error_no_model: "Välj en giltig modell.",
            status_error_no_selection: "Ingen text markerad!",
            status_error_no_text_a: "Fel: Text A inte sparad!",
            status_indexing: "Indexerar dokument...",
            status_indexing_completed: "Indexering slutförd!",
            status_indexing_error: "Embedding-fel med modellen ",
            status_rag_searching: "Söker kontext...",
            status_rag_generating: "Genererar svar...",
            status_rag_error_query: "Kunde inte beräkna vektor för frågan.",

            // RAG Messages
            rag_welcome: "Välkommen! Ställ en fråga om det aktuella dokumentet. Indexera det först för att aktivera RAG.",
            rag_system_no_index: "Svarar utan kontext (dokumentet är inte indexerat)...",
            rag_system_indexed: "Dokumentet har indexerats. Nu kan du ställa frågor.",
            rag_system_error: "Fel vid indexering. Kontrollera embedding-modellen.",
            rag_empty_doc: "Dokumentet är tomt."
        },
        da: {
            tab_rewrite: "Omskriv",
            tab_tone: "Tone",
            tab_simplify: "Forenkl",
            tab_tools: "Værktøjer",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Tekstbehandling",
            btn_improve: "✨ Forbedr",
            btn_expand: "➕ Udvid",
            btn_reduce: "➖ Forkort",
            btn_summarize_short: "🎯 Sammenfatning",
            btn_plain_language: "📖 Klart Sprog",
            protocols_title: "Omskrivningsprotokoller",
            btn_proto1: "Letlæst (Basis)",
            btn_proto2: "Protokol 2 (Middel)",
            btn_proto3: "Protokol 3 (Kompleks)",
            tone_title: "Skift Stil eller Tone",
            tone_desc: "Markér tekst i dokumentet og anvend en bestemt omskrivningsstil.",
            btn_tone_formal: "👔 Formel",
            btn_tone_informal: "☕ Uformel",
            btn_tone_persuasive: "🗣️ Overbevisende",
            btn_tone_ironic: "🎭 Ironisk",
            btn_tone_assertive: "⚡ Bestemt",
            btn_tone_diplomatic: "🦹 Diplomatisk",
            btn_tone_conspiracy: "👁️ Konspiratorisk",
            btn_tone_defensive: "🛡️ Defensiv",
            btn_tone_rhetorical: "🏛️ Retorisk",
            facilitator_title: "Digital Facilitator",
            facilitator_desc: "Gør digitale eller bureaukratiske begreber lette for et ældre publikum.",
            btn_explain_simple: "💡 Forklar Enkelt",
            btn_create_guide: "🔢 Opret Trin-for-Trin Guide",
            tools_title: "Avanceret Analyse og Syntese",
            btn_summarize_selection: "📋 Opsummer Markering",
            btn_readability_analysis: "📊 Læsbarhedsanalyse",
            btn_store_a: "💾 Gem A",
            btn_synthesis_ab: "🔄 Syntese A+B",
            gen_title: "Indholdsgenerering",
            label_image_prompt_type: "Type af billedprompt:",
            opt_img_decor: "Dekorativ (Visuel interesse)",
            opt_img_mnem: "Mnemonisk (Huske begreber)",
            opt_img_repr: "Repræsentativ (Ægte foto)",
            opt_img_org: "Organisatorisk (Kort/Diagrammer)",
            opt_img_rel: "Relationel (Kvantitative diagrammer)",
            opt_img_transf: "Transformationel (Cyklus/Sekvens)",
            opt_img_interp: "Fortolkende (Abstrakte begreber)",
            btn_generate_image_prompt: "🖼️ Generer Billedprompt",
            btn_expand_bullets: "📑 Udvid til Punktopstilling",
            btn_speaker_notes: "🎙️ Generer Talernoter",
            btn_create_json_slide: "📐 Opret JSON-slide",
            chat_title: "Chat med Dokumentet",
            btn_index_doc: "🔍 Indekser Dokument",
            btn_reindex_doc: "🔄 Genindekser Dokument",
            chat_input_placeholder: "Stil et spørgsmål...",
            lang_title: "Sprogindstillinger",
            label_lang: "Vælg Sprog:",
            server_title: "Serverkonfiguration",
            label_ollama_url: "Ollama-server-URL:",
            label_api_key: "API-nøgle (valgfri):",
            btn_connect_update: "🔄 Forbind og Opdater",
            models_title: "Modelindstillinger",
            label_main_model: "Hovedmodel (Chat/Generering):",
            label_embed_model: "Embedding-model (RAG/Søgning):",
            system_reqs_title: "Systemkrav",
            system_reqs_desc: "Start Ollama og konfigurer CORS med plugin-oprindelsen:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Til embeddings anbefales:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Klar.",
            status_connecting: "Henter modeller...",
            status_reading: "Læser dokument...",
            status_read_selection: "Læser markering...",
            status_processing: "Behandler...",
            status_inserting: "Indsætter...",
            status_error_conn: "Ollama-forbindelsesfejl.",
            status_error_no_model: "Vælg en gyldig model.",
            status_error_no_selection: "Ingen tekst markeret!",
            status_error_no_text_a: "Fejl: Tekst A ikke gemt!",
            status_indexing: "Indekserer dokument...",
            status_indexing_completed: "Indeksering fuldført!",
            status_indexing_error: "Embedding-fejl med model ",
            status_rag_searching: "Søger kontekst...",
            status_rag_generating: "Genererer svar...",
            status_rag_error_query: "Kunne ikke beregne vektor for spørgsmålet.",

            // RAG Messages
            rag_welcome: "Velkommen! Stil et spørgsmål om det aktuelle dokument. Indekser det først for at aktivere RAG.",
            rag_system_no_index: "Svarer uden kontekst (dokument ikke indekseret)...",
            rag_system_indexed: "Dokumentet er indekseret. Nu kan du stille spørgsmål.",
            rag_system_error: "Fejl under indeksering. Tjek embedding-modellen.",
            rag_empty_doc: "Dokumentet er tomt."
        },
        nl: {
            tab_rewrite: "Herschrijven",
            tab_tone: "Toon",
            tab_simplify: "Vereenvoudigen",
            tab_tools: "Hulpmiddelen",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Tekstverwerking",
            btn_improve: "✨ Verbeteren",
            btn_expand: "➕ Uitbreiden",
            btn_reduce: "➖ Inkorten",
            btn_summarize_short: "🎯 Synthese",
            btn_plain_language: "📖 Duidelijke Taal",
            protocols_title: "Herschrijfprotocollen",
            btn_proto1: "Taalniveau B1 (Basis)",
            btn_proto2: "Protocol 2 (Gemiddeld)",
            btn_proto3: "Protocol 3 (Complex)",
            tone_title: "Stijl of Toon Wijzigen",
            tone_desc: "Selecteer tekst in het document en pas een specifieke herschrijfstijl toe.",
            btn_tone_formal: "👔 Formeel",
            btn_tone_informal: "☕ Informeel",
            btn_tone_persuasive: "🗣️ Overtuigend",
            btn_tone_ironic: "🎭 Ironisch",
            btn_tone_assertive: "⚡ Assertief",
            btn_tone_diplomatic: "🦹 Diplomatiek",
            btn_tone_conspiracy: "👁️ Complotdenkend",
            btn_tone_defensive: "🛡️ Defensief",
            btn_tone_rhetorical: "🏛️ Retorisch",
            facilitator_title: "Digitale Facilitator",
            facilitator_desc: "Maak digitale of bureaucratische begrippen begrijpelijk voor een ouder publiek.",
            btn_explain_simple: "💡 Eenvoudig Uitleggen",
            btn_create_guide: "🔢 Stap-voor-Stap Gids Maken",
            tools_title: "Geavanceerde Analyse en Synthese",
            btn_summarize_selection: "📋 Selectie Samenvatten",
            btn_readability_analysis: "📊 Leesbaarheidsanalyse",
            btn_store_a: "💾 A Opslaan",
            btn_synthesis_ab: "🔄 Synthese A+B",
            gen_title: "Contentgeneratie",
            label_image_prompt_type: "Type afbeeldingsprompt:",
            opt_img_decor: "Decoratief (Visuele interesse)",
            opt_img_mnem: "Mnemonisch (Begrippen onthouden)",
            opt_img_repr: "Representatief (Echte foto)",
            opt_img_org: "Organisatorisch (Kaarten/Diagrammen)",
            opt_img_rel: "Relationeel (Kwantitatieve grafieken)",
            opt_img_transf: "Transformationeel (Cyclus/Sequentie)",
            opt_img_interp: "Interpretatief (Abstracte concepten)",
            btn_generate_image_prompt: "🖼️ Afbeeldingsprompt Genereren",
            btn_expand_bullets: "📑 Uitbreiden naar Opsomming",
            btn_speaker_notes: "🎙️ Sprekersnotities Genereren",
            btn_create_json_slide: "📐 JSON-slide Maken",
            chat_title: "Chatten met het Document",
            btn_index_doc: "🔍 Document Indexeren",
            btn_reindex_doc: "🔄 Document Herindexeren",
            chat_input_placeholder: "Stel een vraag...",
            lang_title: "Taalinstellingen",
            label_lang: "Selecteer Taal:",
            server_title: "Serverconfiguratie",
            label_ollama_url: "Ollama-server-URL:",
            label_api_key: "API-sleutel (optioneel):",
            btn_connect_update: "🔄 Verbinden en Bijwerken",
            models_title: "Modelinstellingen",
            label_main_model: "Hoofdmodel (Chat/Generatie):",
            label_embed_model: "Embedding-model (RAG/Zoeken):",
            system_reqs_title: "Systeemvereisten",
            system_reqs_desc: "Start Ollama en configureer CORS met de plugin-oorsprong:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Voor embeddings wordt aanbevolen:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Gereed.",
            status_connecting: "Modellen ophalen...",
            status_reading: "Document lezen...",
            status_read_selection: "Selectie lezen...",
            status_processing: "Verwerken...",
            status_inserting: "Invoegen...",
            status_error_conn: "Ollama-verbindingsfout.",
            status_error_no_model: "Selecteer een geldig model.",
            status_error_no_selection: "Geen tekst geselecteerd!",
            status_error_no_text_a: "Fout: Tekst A niet opgeslagen!",
            status_indexing: "Document indexeren...",
            status_indexing_completed: "Indexering voltooid!",
            status_indexing_error: "Embedding-fout met model ",
            status_rag_searching: "Context zoeken...",
            status_rag_generating: "Antwoord genereren...",
            status_rag_error_query: "Kon vector voor de vraag niet berekenen.",

            // RAG Messages
            rag_welcome: "Welkom! Stel een vraag over het huidige document. Indexeer het eerst om RAG te activeren.",
            rag_system_no_index: "Antwoorden zonder context (document niet geïndexeerd)...",
            rag_system_indexed: "Document succesvol geïndexeerd. U kunt nu vragen stellen.",
            rag_system_error: "Fout tijdens indexeren. Controleer het embedding-model.",
            rag_empty_doc: "Het document is leeg."
        },
        "fr-ca": {
            tab_rewrite: "Réécrire",
            tab_tone: "Ton",
            tab_simplify: "Langage Clair",
            tab_tools: "Outils",
            tab_chat: "Clavardage",
            tab_settings: "⚙️",
            rewrite_title: "Traitement de Texte",
            btn_improve: "✨ Améliorer",
            btn_expand: "➕ Élargir",
            btn_reduce: "➖ Réduire",
            btn_summarize_short: "🎯 Synthèse",
            btn_plain_language: "📖 Langage Clair et Simple",
            protocols_title: "Protocoles de Réécriture",
            btn_proto1: "Langage Clair (Base)",
            btn_proto2: "Protocole 2 (Moyen)",
            btn_proto3: "Protocole 3 (Complexe)",
            tone_title: "Changer le Style ou le Ton",
            tone_desc: "Sélectionnez du texte dans le document et appliquez un style de réécriture spécifique.",
            btn_tone_formal: "👔 Formel",
            btn_tone_informal: "☕ Informel",
            btn_tone_persuasive: "🗣️ Persuasif",
            btn_tone_ironic: "🎭 Ironique",
            btn_tone_assertive: "⚡ Assertif",
            btn_tone_diplomatic: "🦹 Diplomatique",
            btn_tone_conspiracy: "👁️ Complotiste",
            btn_tone_defensive: "🛡️ Défensif",
            btn_tone_rhetorical: "🏛️ Rhétorique",
            facilitator_title: "Facilitateur Numérique",
            facilitator_desc: "Rendre les concepts numériques ou bureaucratiques faciles pour un public aîné.",
            btn_explain_simple: "💡 Expliquer Simplement",
            btn_create_guide: "🔢 Créer un Guide Étape par Étape",
            tools_title: "Analyse et Synthèse Avancée",
            btn_summarize_selection: "📋 Résumer la Sélection",
            btn_readability_analysis: "📊 Analyse de Lisibilité",
            btn_store_a: "💾 Mémoriser A",
            btn_synthesis_ab: "🔄 Synthèse A+B",
            gen_title: "Génération de Contenu",
            label_image_prompt_type: "Type de requête d'image:",
            opt_img_decor: "Décoratif (Intérêt visuel)",
            opt_img_mnem: "Mnémonique (Rappeler les concepts)",
            opt_img_repr: "Représentatif (Photo réelle)",
            opt_img_org: "Organisationnel (Cartes/Diagrammes)",
            opt_img_rel: "Relationnel (Graphiques quantitatifs)",
            opt_img_transf: "Transformationnel (Cycle/Séquence)",
            opt_img_interp: "Interprétatif (Concepts abstraits)",
            btn_generate_image_prompt: "🖼️ Générer une Requête d'Image",
            btn_expand_bullets: "📑 Développer en Liste à Puces",
            btn_speaker_notes: "🎙️ Générer des Notes d'Allocution",
            btn_create_json_slide: "📐 Créer une Diapo JSON",
            chat_title: "Clavarder avec le Document",
            btn_index_doc: "🔍 Indexer le Document",
            btn_reindex_doc: "🔄 Réindexer le Document",
            chat_input_placeholder: "Posez une question...",
            lang_title: "Paramètres de Langue",
            label_lang: "Sélectionner la Langue:",
            server_title: "Configuration du Serveur",
            label_ollama_url: "URL du Serveur Ollama:",
            label_api_key: "Clé API (facultative) :",
            btn_connect_update: "🔄 Connecter et Mettre à Jour",
            models_title: "Paramètres des Modèles",
            label_main_model: "Modèle Principal (Clavardage/Génération):",
            label_embed_model: "Modèle de Plongement (RAG/Recherche):",
            system_reqs_title: "Configuration Requise",
            system_reqs_desc: "Démarrez Ollama en configurant le CORS avec l'origine du plugiciel:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>Pour les plongements, il est recommandé :<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Prêt.",
            status_connecting: "Connexion aux modèles...",
            status_reading: "Lecture du document...",
            status_read_selection: "Lecture de la sélection...",
            status_processing: "Traitement en cours...",
            status_inserting: "Insertion...",
            status_error_conn: "Erreur de connexion à Ollama.",
            status_error_no_model: "Sélectionnez un modèle valide.",
            status_error_no_selection: "Aucun texte sélectionné !",
            status_error_no_text_a: "Erreur : Texte A non mémorisé !",
            status_indexing: "Indexation du document...",
            status_indexing_completed: "Indexation terminée !",
            status_indexing_error: "Erreur de plongement avec le modèle ",
            status_rag_searching: "Recherche du contexte...",
            status_rag_generating: "Génération de la réponse...",
            status_rag_error_query: "Impossible de calculer le vecteur pour la question.",

            // RAG Messages
            rag_welcome: "Bienvenue ! Posez une question sur le document actuel. Indexez-le d'abord pour activer le RAG.",
            rag_system_no_index: "Réponse sans contexte (document non indexé)...",
            rag_system_indexed: "Document indexé avec succès. Vous pouvez maintenant poser des questions.",
            rag_system_error: "Erreur lors de l'indexation. Vérifiez le modèle de plongement.",
            rag_empty_doc: "Le document est vide."
        },
        "en-ca": {
            tab_rewrite: "Rewrite",
            tab_tone: "Tone",
            tab_simplify: "Plain Language",
            tab_tools: "Tools",
            tab_chat: "Chat",
            tab_settings: "⚙️",
            rewrite_title: "Text Processing",
            btn_improve: "✨ Improve",
            btn_expand: "➕ Expand",
            btn_reduce: "➖ Reduce",
            btn_summarize_short: "🎯 Synthesis",
            btn_plain_language: "📖 Plain Language",
            protocols_title: "Rewrite Protocols",
            btn_proto1: "Plain Language (Base)",
            btn_proto2: "Protocol 2 (Medium)",
            btn_proto3: "Protocol 3 (Complex)",
            tone_title: "Change Style or Tone",
            tone_desc: "Select text in the document and apply a specific rewrite style.",
            btn_tone_formal: "👔 Formal",
            btn_tone_informal: "☕ Informal",
            btn_tone_persuasive: "🗣️ Persuasive",
            btn_tone_ironic: "🎭 Ironic",
            btn_tone_assertive: "⚡ Assertive",
            btn_tone_diplomatic: "🦹 Diplomatic",
            btn_tone_conspiracy: "👁️ Conspiratorial",
            btn_tone_defensive: "🛡️ Defensive",
            btn_tone_rhetorical: "🏛️ Rhetorical",
            facilitator_title: "Digital Facilitator",
            facilitator_desc: "Make digital or bureaucratic concepts easy for a senior audience.",
            btn_explain_simple: "💡 Explain Simply",
            btn_create_guide: "🔢 Create Step-by-Step Guide",
            tools_title: "Advanced Analysis & Synthesis",
            btn_summarize_selection: "📋 Summarize Selection",
            btn_readability_analysis: "📊 Readability Analysis",
            btn_store_a: "💾 Store A",
            btn_synthesis_ab: "🔄 Synthesis A+B",
            gen_title: "Content Generation",
            label_image_prompt_type: "Image prompt type:",
            opt_img_decor: "Decorative (Visual interest)",
            opt_img_mnem: "Mnemonic (Recall concepts)",
            opt_img_repr: "Representative (Real photo)",
            opt_img_org: "Organizational (Maps/Diagrams)",
            opt_img_rel: "Relational (Quantitative charts)",
            opt_img_transf: "Transformational (Cycle/Sequence)",
            opt_img_interp: "Interpretative (Abstract concepts)",
            btn_generate_image_prompt: "🖼️ Generate Image Prompt",
            btn_expand_bullets: "📑 Expand into Bullet List",
            btn_speaker_notes: "🎙️ Generate Speaker Notes",
            btn_create_json_slide: "📐 Create JSON Slide",
            chat_title: "Chat with Document",
            btn_index_doc: "🔍 Index Document",
            btn_reindex_doc: "🔄 Re-Index Document",
            chat_input_placeholder: "Ask a question...",
            lang_title: "Language Settings",
            label_lang: "Select Language:",
            server_title: "Server Configuration",
            label_ollama_url: "Ollama Server URL:",
            label_api_key: "API Key (optional):",
            btn_connect_update: "🔄 Connect & Update",
            models_title: "Model Settings",
            label_main_model: "Main Model (Chat/Generation):",
            label_embed_model: "Embedding Model (RAG/Search):",
            system_reqs_title: "System Requirements",
            system_reqs_desc: "Start Ollama configuring CORS with plugin origin:<br><code>OLLAMA_ORIGINS=\"*\"</code><br>For embeddings, we recommend:<br><code>nomic-embed-text</code>",

            // Statuses
            status_ready: "Ready.",
            status_connecting: "Fetching models...",
            status_reading: "Reading document...",
            status_read_selection: "Reading selection...",
            status_processing: "Processing...",
            status_inserting: "Inserting...",
            status_error_conn: "Ollama connection error.",
            status_error_no_model: "Select a valid model.",
            status_error_no_selection: "No text selected!",
            status_error_no_text_a: "Error: Text A not stored!",
            status_indexing: "Indexing document...",
            status_indexing_completed: "Indexing completed!",
            status_indexing_error: "Embeddings error with model ",
            status_rag_searching: "Searching context...",
            status_rag_generating: "Generating response...",
            status_rag_error_query: "Could not calculate vector for query.",

            // RAG Messages
            rag_welcome: "Welcome! Ask a question about the current document. Index it first to enable RAG.",
            rag_system_no_index: "Answering without context (document not indexed)...",
            rag_system_indexed: "Document indexed successfully. You can now ask questions.",
            rag_system_error: "Error during indexing. Check the embedding model.",
            rag_empty_doc: "The document is empty."
        }
    };

    // --- DOM Localization Helper ---
    window.changeLanguage = function (lang) {
        if (!locales[lang]) return;
        currentLang = lang;
        localStorage.setItem("ollama_plugin_lang", lang);
        document.documentElement.lang = lang;

        // Update document select UI
        document.getElementById("pluginLanguage").value = lang;

        // Translate all data-i18n elements
        var elements = document.querySelectorAll("[data-i18n]");
        elements.forEach(function (el) {
            var key = el.getAttribute("data-i18n");
            if (locales[lang][key]) {
                el.innerHTML = locales[lang][key];
            }
        });

        // Translate all placeholders
        var placeholders = document.querySelectorAll("[data-i18n-placeholder]");
        placeholders.forEach(function (el) {
            var key = el.getAttribute("data-i18n-placeholder");
            if (locales[lang][key]) {
                el.setAttribute("placeholder", locales[lang][key]);
            }
        });

        // Reset chat history welcome message
        var chatHistory = document.getElementById("chatHistory");
        if (chatHistory && (chatHistory.children.length <= 1 || !isIndexed)) {
            chatHistory.innerHTML = '<div class="chat-bubble system">' + locales[lang].rag_welcome + '</div>';
        }

        // Reset status bar
        window.setStatus(locales[lang].status_ready, false);
    };

    window.Asc.plugin.init = function () {
        var savedUrl = localStorage.getItem("ollama_url");
        var savedModel = localStorage.getItem("ollama_model");
        var savedEmbedModel = localStorage.getItem("ollama_embed_model");
        var savedApiKey = localStorage.getItem("ollama_api_key");
        var savedLang = localStorage.getItem("ollama_plugin_lang") || "en";

        if (savedUrl) {
            document.getElementById("ollamaUrl").value = savedUrl;
            storedConfig.url = savedUrl;
        }

        if (savedApiKey) {
            document.getElementById("ollamaApiKey").value = savedApiKey;
            storedConfig.apiKey = savedApiKey;
        }

        // Apply localization before loading models
        window.changeLanguage(savedLang);

        fetchModels(savedModel, savedEmbedModel);

        document.getElementById("ollamaUrl").addEventListener("change", function () {
            localStorage.setItem("ollama_url", this.value);
            storedConfig.url = this.value;
        });

        document.getElementById("ollamaApiKey").addEventListener("change", function () {
            localStorage.setItem("ollama_api_key", this.value);
            storedConfig.apiKey = this.value;
        });

        document.getElementById("ollamaModel").addEventListener("change", function () {
            localStorage.setItem("ollama_model", this.value);
            storedConfig.model = this.value;
        });

        document.getElementById("ollamaEmbedModel").addEventListener("change", function () {
            localStorage.setItem("ollama_embed_model", this.value);
            storedConfig.embedModel = this.value;
        });
    };

    window.Asc.plugin.button = function (id) {
        this.executeCommand("close", "");
    };

    // --- UI Logic ---

    window.switchTab = function (tabId) {
        var contents = document.getElementsByClassName("tab-content");
        for (var i = 0; i < contents.length; i++) {
            contents[i].classList.remove("active");
        }

        var btns = document.getElementsByClassName("tab-btn");
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.remove("active");
        }

        document.getElementById(tabId).classList.add("active");
        event.currentTarget.classList.add("active");
    };

    window.setStatus = function (msg, isWorking) {
        var statusText = document.getElementById("status");
        var statusDot = document.querySelector(".status-dot");
        
        statusText.innerText = msg;
        if (isWorking) {
            statusDot.classList.add("working");
        } else {
            statusDot.classList.remove("working");
        }
    };

    window.fetchModels = function (preselectModel, preselectEmbedModel) {
        var url = document.getElementById("ollamaUrl").value.replace(/\/$/, "");
        window.setStatus(locales[currentLang].status_connecting, true);

        fetch(url + "/api/tags", { headers: buildRequestHeaders() })
            .then(response => response.json())
            .then(data => {
                var select = document.getElementById("ollamaModel");
                var selectEmbed = document.getElementById("ollamaEmbedModel");
                
                select.innerHTML = "";
                selectEmbed.innerHTML = "";

                var models = data.models || [];
                if (models.length === 0) {
                    var opt = document.createElement("option");
                    opt.text = "No models found";
                    select.add(opt);

                    var opt2 = document.createElement("option");
                    opt2.text = "No models found";
                    selectEmbed.add(opt2);
                    
                    window.setStatus(locales[currentLang].status_ready, false);
                    return;
                }

                models.forEach(function (m) {
                    var opt = document.createElement("option");
                    opt.value = m.name;
                    opt.text = m.name;
                    select.add(opt);

                    var opt2 = document.createElement("option");
                    opt2.value = m.name;
                    opt2.text = m.name;
                    selectEmbed.add(opt2);
                });

                // Preselect Main Model
                if (preselectModel && models.some(m => m.name === preselectModel)) {
                    select.value = preselectModel;
                } else {
                    var mainDefaults = ["qwen2.5-coder:7b", "llama3", "qwen3.5:4b", "gemma4:latest", "PLUS_Scrittura_Assistita:latest"];
                    var foundMain = false;
                    for (var i = 0; i < mainDefaults.length; i++) {
                        var found = models.find(m => m.name.indexOf(mainDefaults[i]) >= 0);
                        if (found) { select.value = found.name; foundMain = true; break; }
                    }
                    if (!foundMain && models.length > 0) {
                        select.value = models[0].name;
                    }
                }
                storedConfig.model = select.value;
                localStorage.setItem("ollama_model", select.value);

                // Preselect Embedding Model
                if (preselectEmbedModel && models.some(m => m.name === preselectEmbedModel)) {
                    selectEmbed.value = preselectEmbedModel;
                } else {
                    var embedDefaults = ["nomic-embed-text", "all-minilm", "mxbai-embed-large"];
                    var foundEmbed = false;
                    for (var i = 0; i < embedDefaults.length; i++) {
                        var found = models.find(m => m.name.indexOf(embedDefaults[i]) >= 0);
                        if (found) { selectEmbed.value = found.name; foundEmbed = true; break; }
                    }
                    if (!foundEmbed) {
                        selectEmbed.value = select.value;
                    }
                }
                storedConfig.embedModel = selectEmbed.value;
                localStorage.setItem("ollama_embed_model", selectEmbed.value);

                window.setStatus(locales[currentLang].status_ready, false);
            })
            .catch(err => {
                console.error(err);
                window.setStatus(locales[currentLang].status_error_conn, false);
                var select = document.getElementById("ollamaModel");
                select.innerHTML = "<option>Error</option>";
                var selectEmbed = document.getElementById("ollamaEmbedModel");
                selectEmbed.innerHTML = "<option>Error</option>";
            });
    };

    // --- Core Logic ---

    window.runProcedure = function (actionType) {
        var url = document.getElementById("ollamaUrl").value.replace(/\/$/, "");
        var model = document.getElementById("ollamaModel").value;

        if (!model || model === "Error" || model === "loading") {
            window.setStatus(locales[currentLang].status_error_no_model, false);
            return;
        }

        window.setStatus(locales[currentLang].status_read_selection, true);

        window.Asc.plugin.executeMethod("GetSelectedText", [], function (text) {
            if (!text || text.trim() === "") {
                window.setStatus(locales[currentLang].status_error_no_selection, false);
                return;
            }

            if (actionType === "synthesis" && !textA) {
                window.setStatus(locales[currentLang].status_error_no_text_a, false);
                return;
            }

            var prompt = generatePrompt(actionType, text);
            window.setStatus(locales[currentLang].status_processing, true);

            callOllama(url, model, prompt, false, function (response) {
                if (!response) {
                    window.setStatus("Error", false);
                    return;
                }

                window.setStatus(locales[currentLang].status_inserting, true);

                if (actionType.startsWith("image_prompt") ||
                    actionType === "slide_single" ||
                    actionType === "expand_bullets" ||
                    actionType === "speaker_notes") {

                    window.Asc.plugin.executeMethod("PasteText", ["\n\n" + response]);
                } else {
                    window.Asc.plugin.executeMethod("PasteText", [response]);
                }

                window.setStatus(locales[currentLang].status_ready, false);
            });
        });
    };

    window.storeTextA = function () {
        window.Asc.plugin.executeMethod("GetSelectedText", [], function (text) {
            if (!text) { window.setStatus(locales[currentLang].status_error_no_selection, false); return; }
            textA = text;
            var textSavedMsg = currentLang === "it" ? "Testo A salvato" : 
                              currentLang === "fr" ? "Texte A mémorisé" : 
                              currentLang === "es" ? "Texto A guardado" : "Text A saved";
            window.setStatus(textSavedMsg + " (" + text.length + " car.)", false);
        });
    };

    // --- Dynamic Syllable Estimation & Readability formulas for each language ---
    function estimateSyllables(word) {
        word = word.toLowerCase().trim();
        if (word.length <= 3) return 1;
        // Strip common silent endings
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        var matches = word.match(/[aeiouyàèéìòùáéíóúüâêîôûœæ]{1,2}/g);
        return matches ? matches.length : 1;
    }

    function countTextSyllables(text) {
        var words = text.match(/\b\w+\b/g) || [];
        var total = 0;
        for (var i = 0; i < words.length; i++) {
            total += estimateSyllables(words[i]);
        }
        return total;
    }

    // LIX (Läsbarhetsindex / Björnsson) - used for Scandinavian & Finnish readability
    function computeLix(textClean, words, sentences) {
        var wordList = textClean.match(/\b\w+\b/g) || [];
        var longWords = 0;
        for (var i = 0; i < wordList.length; i++) {
            if (wordList[i].length > 6) longWords++;
        }
        return (words / sentences) + ((longWords * 100) / words);
    }

    function lixLabel(score, labels) {
        if (score < 30) return labels[0];
        else if (score < 40) return labels[1];
        else if (score < 50) return labels[2];
        else if (score < 60) return labels[3];
        else return labels[4];
    }

    window.analyzeReadability = function () {
        window.Asc.plugin.executeMethod("GetSelectedText", [], function (text) {
            if (!text) { window.setStatus(locales[currentLang].status_error_no_selection, false); return; }

            var textClean = text.trim();
            if (textClean.length === 0) return;

            var sentences = (textClean.match(/[.!?]+(\s|$)/g) || []).length || 1;
            var words = (textClean.match(/\w+/g) || []).length || 1;

            if (currentLang === "it") {
                // Gulpease Index (specific for Italian)
                var letters = textClean.replace(/[^a-zA-Z0-9àèéìòù]/g, "").length;
                var score = 89 - ((letters * 100) / words) / 10 + (3 * ((sentences * 100) / words));
                score = Math.round(score);

                var result = "Indice Gulpease: " + score + "\n";
                if (score < 40) result += "Difficile (comprensibile per diplomati/laureati)";
                else if (score < 60) result += "Medio (comprensibile per scuole superiori)";
                else if (score < 80) result += "Facile (comprensibile per scuole medie)";
                else result += "Molto Facile (comprensibile per scuole elementari)";
                alert(result);
            } 
            else if (currentLang === "en") {
                // Flesch Reading Ease (standard for English)
                var syllables = countTextSyllables(textClean);
                var score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
                score = Math.round(score);

                var result = "Flesch Reading Ease: " + score + "\n";
                if (score < 30) result += "Very Difficult (Best understood by university graduates)";
                else if (score < 50) result += "Difficult";
                else if (score < 60) result += "Fairly Difficult";
                else if (score < 70) result += "Standard / Plain English";
                else if (score < 80) result += "Fairly Easy";
                else if (score < 90) result += "Easy";
                else result += "Very Easy (Understandable by an average 11-year-old)";
                alert(result);
            } 
            else if (currentLang === "fr") {
                // Flesch-Szigriszt (French adaptation)
                var syllables = countTextSyllables(textClean);
                var score = 206.84 - 62.3 * (syllables / words) - (words / sentences);
                score = Math.round(score);

                var result = "Indice de Flesch-Szigriszt: " + score + "\n";
                if (score < 30) result += "Très difficile (Niveau universitaire)";
                else if (score < 50) result += "Difficile";
                else if (score < 60) result += "Standard";
                else if (score < 75) result += "Assez facile";
                else result += "Très facile (Facile à lire et à comprendre)";
                alert(result);
            } 
            else if (currentLang === "es") {
                // Fernández-Huerta Index (Spanish adaptation)
                var syllables = countTextSyllables(textClean);
                var score = 206.84 - 60 * (syllables / words) - 1.02 * (words / sentences);
                score = Math.round(score);

                var result = "Índice de Fernández-Huerta: " + score + "\n";
                if (score < 30) result += "Muy difícil (Nivel universitario)";
                else if (score < 50) result += "Difícil";
                else if (score < 60) result += "Algo difícil";
                else if (score < 70) result += "Estilo estándar";
                else if (score < 80) result += "Bastante fácil";
                else if (score < 90) result += "Fácil";
                else result += "Muy fácil (Lectura Fácil)";
                alert(result);
            }
            else if (currentLang === "pt") {
                // Flesch adaptation for Portuguese (Martins et al.)
                var syllables = countTextSyllables(textClean);
                var score = 248.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
                score = Math.round(score);

                var result = "Índice de Flesch (adaptado ao português): " + score + "\n";
                if (score < 30) result += "Muito difícil (Nível universitário)";
                else if (score < 50) result += "Difícil";
                else if (score < 60) result += "Razoavelmente difícil";
                else if (score < 70) result += "Padrão / Linguagem Simples";
                else if (score < 80) result += "Razoavelmente fácil";
                else if (score < 90) result += "Fácil";
                else result += "Muito fácil";
                alert(result);
            }
            else if (currentLang === "de") {
                // Amstad's Flesch Reading Ease (German adaptation)
                var syllables = countTextSyllables(textClean);
                var asl = words / sentences;
                var asw = syllables / words;
                var score = 180 - asl - (58.5 * asw);
                score = Math.round(score);

                var result = "Flesch-Lesbarkeitsindex (Amstad): " + score + "\n";
                if (score < 30) result += "Sehr schwer (Wissenschaftlich)";
                else if (score < 50) result += "Schwer";
                else if (score < 60) result += "Mittelschwer";
                else if (score < 70) result += "Mittelstufe / Einfache Sprache";
                else if (score < 80) result += "Mittelleicht";
                else if (score < 90) result += "Leicht";
                else result += "Sehr leicht";
                alert(result);
            }
            else if (currentLang === "ro") {
                // Approximate Flesch-style adaptation for Romanian
                var syllables = countTextSyllables(textClean);
                var score = 206.835 - 1.015 * (words / sentences) - 83.6 * (syllables / words);
                score = Math.round(score);

                var result = "Indice de lizibilitate (aproximare Flesch): " + score + "\n";
                if (score < 30) result += "Foarte dificil (nivel universitar)";
                else if (score < 50) result += "Dificil";
                else if (score < 60) result += "Oarecum dificil";
                else if (score < 70) result += "Standard / Limbaj clar";
                else if (score < 80) result += "Destul de ușor";
                else if (score < 90) result += "Ușor";
                else result += "Foarte ușor";
                alert(result);
            }
            else if (currentLang === "nl") {
                // Flesch-Douma (Dutch adaptation)
                var syllables = countTextSyllables(textClean);
                var score = 206.84 - 0.77 * (words / sentences) - 93 * (syllables / words);
                score = Math.round(score);

                var result = "Flesch-leesbaarheidsindex (Douma): " + score + "\n";
                if (score < 30) result += "Zeer moeilijk (Universitair niveau)";
                else if (score < 50) result += "Moeilijk";
                else if (score < 60) result += "Vrij moeilijk";
                else if (score < 70) result += "Standaard / Taalniveau B1";
                else if (score < 80) result += "Vrij gemakkelijk";
                else if (score < 90) result += "Gemakkelijk";
                else result += "Zeer gemakkelijk";
                alert(result);
            }
            else if (currentLang === "nb") {
                var score = Math.round(computeLix(textClean, words, sentences));
                var result = "LIX-indeks: " + score + "\n";
                result += lixLabel(score, [
                    "Svært lettlest",
                    "Lettlest",
                    "Middels vanskelig",
                    "Vanskelig (sakprosa)",
                    "Svært vanskelig (fagtekst)"
                ]);
                alert(result);
            }
            else if (currentLang === "sv") {
                var score = Math.round(computeLix(textClean, words, sentences));
                var result = "LIX-värde: " + score + "\n";
                result += lixLabel(score, [
                    "Mycket lättläst",
                    "Lättläst",
                    "Medelsvår",
                    "Svår (facktext)",
                    "Mycket svår (t.ex. forskningsrapporter)"
                ]);
                alert(result);
            }
            else if (currentLang === "da") {
                var score = Math.round(computeLix(textClean, words, sentences));
                var result = "LIX-tal: " + score + "\n";
                result += lixLabel(score, [
                    "Meget let læsbar",
                    "Let læsbar",
                    "Middelsvær",
                    "Svær (fagtekst)",
                    "Meget svær (specialtekst)"
                ]);
                alert(result);
            }
            else if (currentLang === "fi") {
                var score = Math.round(computeLix(textClean, words, sentences));
                var result = "LIX-luku: " + score + "\n";
                result += lixLabel(score, [
                    "Erittäin helppolukuinen",
                    "Helppolukuinen",
                    "Keskivaikea",
                    "Vaikea (asiateksti)",
                    "Erittäin vaikea (erikoisteksti)"
                ]);
                alert(result);
            }
            else if (currentLang === "fr-ca") {
                // Flesch-Szigriszt (French adaptation), same formula as fr
                var syllables = countTextSyllables(textClean);
                var score = 206.84 - 62.3 * (syllables / words) - (words / sentences);
                score = Math.round(score);

                var result = "Indice de Flesch-Szigriszt: " + score + "\n";
                if (score < 30) result += "Très difficile (Niveau universitaire)";
                else if (score < 50) result += "Difficile";
                else if (score < 60) result += "Standard";
                else if (score < 75) result += "Assez facile";
                else result += "Très facile (Langage clair)";
                alert(result);
            }
            else if (currentLang === "en-ca") {
                // Flesch Reading Ease, same formula as en
                var syllables = countTextSyllables(textClean);
                var score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
                score = Math.round(score);

                var result = "Flesch Reading Ease: " + score + "\n";
                if (score < 30) result += "Very Difficult (Best understood by university graduates)";
                else if (score < 50) result += "Difficult";
                else if (score < 60) result += "Fairly Difficult";
                else if (score < 70) result += "Standard / Plain Language";
                else if (score < 80) result += "Fairly Easy";
                else if (score < 90) result += "Easy";
                else result += "Very Easy (Understandable by an average 11-year-old)";
                alert(result);
            }

            window.setStatus(locales[currentLang].status_ready, false);
        });
    };

    // --- RAG / Chat Logic ---

    window.indexDocument = function () {
        window.setStatus(locales[currentLang].status_reading, true);
        window.Asc.plugin.executeMethod("GetAllText", [], function (text) {
            if (!text || text.trim() === "") { 
                window.setStatus(locales[currentLang].rag_empty_doc, false); 
                return; 
            }

            var chunkSize = 400; 
            var overlap = 50;
            var words = text.split(/\s+/);
            docChunks = [];

            for (var i = 0; i < words.length; i += (chunkSize - overlap)) {
                var chunk = words.slice(i, i + chunkSize).join(" ");
                if (chunk.trim().length > 10) {
                    docChunks.push(chunk.trim());
                }
            }

            window.setStatus(locales[currentLang].status_indexing + " (" + docChunks.length + ")...", true);
            docEmbeddings = [];

            processEmbeddings(0);
        });
    };

    function processEmbeddings(index) {
        if (index >= docChunks.length) {
            isIndexed = true;
            window.setStatus(locales[currentLang].status_indexing_completed, false);
            document.getElementById("btnIndex").innerText = locales[currentLang].btn_reindex_doc;
            appendChatHistory("Sistema", locales[currentLang].rag_system_indexed);
            return;
        }

        var url = document.getElementById("ollamaUrl").value.replace(/\/$/, "");
        var embedModel = document.getElementById("ollamaEmbedModel").value;

        window.setStatus(locales[currentLang].status_indexing + ": " + (index + 1) + "/" + docChunks.length, true);

        fetch(url + "/api/embeddings", {
            method: "POST",
            headers: buildRequestHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ model: embedModel, prompt: docChunks[index] })
        })
            .then(r => {
                if (!r.ok) throw new Error("Embedding API HTTP " + r.status);
                return r.json();
            })
            .then(d => {
                if (d.embedding) {
                    docEmbeddings.push(d.embedding);
                } else {
                    docEmbeddings.push([]);
                }
                processEmbeddings(index + 1);
            })
            .catch(e => {
                console.error(e);
                window.setStatus(locales[currentLang].status_indexing_error + embedModel, false);
                appendChatHistory("Errore", locales[currentLang].rag_system_error);
                isIndexed = false;
            });
    }

    window.handleChatKey = function (e) {
        if (e.keyCode === 13) window.sendChatMessage();
    };

    window.sendChatMessage = function () {
        var input = document.getElementById("chatInput");
        var q = input.value.trim();
        if (!q) return;

        appendChatHistory("Tu", q);
        input.value = "";

        var url = document.getElementById("ollamaUrl").value.replace(/\/$/, "");
        var model = document.getElementById("ollamaModel").value;
        var embedModel = document.getElementById("ollamaEmbedModel").value;

        if (!isIndexed || docChunks.length === 0) {
            appendChatHistory("Sistema", locales[currentLang].rag_system_no_index);
            window.setStatus(locales[currentLang].status_processing, true);
            
            callOllama(url, model, q, false, function (resp) {
                appendChatHistory("AI", resp || "Error");
                window.setStatus(locales[currentLang].status_ready, false);
            });
            return;
        }

        window.setStatus(locales[currentLang].status_rag_searching, true);

        fetch(url + "/api/embeddings", {
            method: "POST",
            headers: buildRequestHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ model: embedModel, prompt: q })
        })
            .then(r => r.json())
            .then(d => {
                if (!d.embedding) {
                    throw new Error("Query embedding empty");
                }

                var similarities = [];
                for (var i = 0; i < docEmbeddings.length; i++) {
                    if (docEmbeddings[i] && docEmbeddings[i].length > 0) {
                        var sim = cosineSimilarity(d.embedding, docEmbeddings[i]);
                        similarities.push({ index: i, score: sim });
                    }
                }

                similarities.sort((a, b) => b.score - a.score);
                var top3 = "";
                var itemsToPick = Math.min(3, similarities.length);
                for (var k = 0; k < itemsToPick; k++) {
                    top3 += docChunks[similarities[k].index] + "\n\n";
                }

                // Localized system prompts for RAG
                var ragPrompts = {
                    it: "Usa il seguente contesto estratto dal documento per rispondere alla domanda in modo chiaro. Se nel contesto non trovi la risposta, rispondi usando le tue conoscenze ma avverti il lettore che non è presente nel documento.\n\nCONTESTO:\n" + top3 + "\nDOMANDA: " + q + "\n\nRISPOSTA (in italiano):",
                    en: "Use the following context extracted from the document to answer the question clearly. If the answer cannot be found in the context, answer using your own knowledge but warn the reader that the information is not present in the document.\n\nCONTEXT:\n" + top3 + "\nQUESTION: " + q + "\n\nRESPONSE (in English):",
                    fr: "Utilisez le contexte suivant extrait du document pour répondre à la question de manière claire. Si la réponse n'est pas dans le contexte, répondez avec vos connaissances mais prévenez le lecteur que l'information n'est pas dans le document.\n\nCONTEXTE:\n" + top3 + "\nQUESTION: " + q + "\n\nRÉPONSE (en français) :",
                    es: "Usa el siguiente contexto extraído del documento para responder a la pregunta de manera clara. Si la respuesta no está en el contexto, responde usando tus conocimientos pero advierte al lector que la información no está en el documento.\n\nCONTEXTO:\n" + top3 + "\nPREGUNTA: " + q + "\n\nRESPUESTA (en español):"
                };

                var systemRAGPrompt = ragPrompts[currentLang] || ragPrompts["en"];

                window.setStatus(locales[currentLang].status_rag_generating, true);
                callOllama(url, model, systemRAGPrompt, false, function (resp) {
                    appendChatHistory("AI", resp || "Error");
                    window.setStatus(locales[currentLang].status_ready, false);
                });
            })
            .catch(e => {
                console.error(e);
                appendChatHistory("Errore", locales[currentLang].status_rag_error_query + ": " + e.message);
                window.setStatus(locales[currentLang].status_ready, false);
            });
    };

    function cosineSimilarity(a, b) {
        var dot = 0;
        var mA = 0;
        var mB = 0;
        for (var i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            mA += a[i] * a[i];
            mB += b[i] * b[i];
        }
        if (mA === 0 || mB === 0) return 0;
        return dot / (Math.sqrt(mA) * Math.sqrt(mB));
    }

    function appendChatHistory(sender, text) {
        var div = document.getElementById("chatHistory");
        var bubbleClass = "system";
        if (sender === "Tu" || sender === "You" || sender === "Vous" || sender === "Tú") bubbleClass = "user";
        else if (sender === "AI") bubbleClass = "ai";
        else if (sender === "Errore" || sender === "Error" || sender === "Erreur") bubbleClass = "error";
        
        var displaySender = sender;
        if (sender === "Tu") {
            displaySender = currentLang === "it" ? "Tu" : 
                            currentLang === "fr" ? "Vous" : 
                            currentLang === "es" ? "Tú" : "You";
        }
        
        var escText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        div.innerHTML += '<div class="chat-bubble ' + bubbleClass + '"><b>' + displaySender + ':</b><br>' + escText.replace(/\n/g, "<br>") + '</div>';
        div.scrollTop = div.scrollHeight;
    }

    // --- Dynamic Multilingual Prompt Generators ---

    function generatePrompt(actionType, text) {
        var prompts = {
            it: {
                migliora: "Sei un copywriter d'eccellenza. Migliora la fluidità, la grammatica, il lessico e la struttura del testo seguente. Rendilo più professionale, elegante e piacevole da leggere. Restituisci SOLO il testo migliorato, senza preamboli, introduzioni o commenti finali:\n\n" + text,
                espandi: "Sei un assistente editoriale esperto. Il tuo compito è espandere il testo fornito. Aggiungi dettagli rilevanti, sviluppa i concetti accennati e arricchisci il contenuto mantenendo intatto il significato originale. Non inventare dati falsi. Restituisci SOLO il testo espanso, senza alcun preambolo, saluto o commento finale:\n\n" + text,
                riduci: "Sei un editor di testo professionista. Riduci e riassumi il seguente testo. Rimuovi le parole superflue, vai dritto al punto e rendilo molto più conciso. Il significato originale deve essere preservato. Restituisci SOLO il testo ridotto, senza preamboli o commenti:\n\n" + text,
                sintetizza: "Estrai il succo del discorso. Crea una sintesi estrema (massimo 1 o 2 frasi) che catturi il punto focale assoluto del testo seguente. Restituisci SOLO la sintesi:\n\n" + text,
                plain: "Agisci come un esperto di 'Plain Language'. Riscrivi il seguente testo in modo che sia estremamente chiaro, semplice e diretto. Evita il burocratismo, i termini inutilmente complessi e i periodi troppo lunghi. Deve poterlo capire chiunque alla prima lettura. Restituisci SOLO il testo riscritto, senza introduzioni o note:\n\n" + text,
                
                // Sentiments
                sentiment_formale: "Riscrivi il seguente testo adottando un tono estremamente formale, istituzionale, distaccato ed elegante (es. registro burocratico o accademico elevato). Restituisci SOLO il testo riscritto:\n\n" + text,
                sentiment_informale: "Riscrivi il seguente testo con un tono informale, amichevole, rilassato e colloquiale. Immagina di parlarne con un amico. Restituisci SOLO il testo riscritto:\n\n" + text,
                sentiment_argomentativo: "Riscrivi il seguente testo in stile argomentativo e persuasivo. Aggiungi connettivi logici forti, fai leva sulla solidità dei concetti per convincere il lettore della assoluta validità della tesi. Restituisci SOLO il testo:\n\n" + text,
                sentiment_ironico: "Riscrivi il seguente testo con un tono marcatamente ironico, pungente e sarcastico. Fai trasparire un sottile (o palese) senso di derisione o esagerazione comica. Restituisci SOLO il testo:\n\n" + text,
                sentiment_aggressivo: "Riscrivi il seguente testo con un tono aggressivo, duro, assertivo e polemico, senza mezzi termini. Non usare parolacce, ma usa uno stile di 'attacco frontale'. Restituisci SOLO il testo:\n\n" + text,
                sentiment_paraculo: "Riscrivi il seguente testo con un tono 'paraculo': estremamente diplomatico, lusinghiero, che elude abilmente il nocciolo della questione per non prendere posizioni nette o per assecondare eccessivamente l'interlocutore. Restituisci SOLO il testo:\n\n" + text,
                sentiment_complottista: "Riscrivi il seguente testo come se fosse stato redatto da un accanito complottista: dubita della versione ufficiale, inserisci riferimenti vaghi a poteri forti, segreti inconfessabili, manipolazioni e verità che 'non vogliono farci sapere'. Restituisci SOLO il testo:\n\n" + text,
                sentiment_difensivo: "Riscrivi il seguente testo con un tono molto difensivo, vittimistico e giustificativo. Chi scrive si sente attaccato ingiustamente e cerca in ogni modo di discolparsi o minimizzare le proprie responsabilità. Restituisci SOLO il testo:\n\n" + text,
                sentiment_retorico: "Riscrivi il seguente testo in modo intensamente retorico, ampolloso, solenne e teatrale. Usa figure retoriche, periodi maestosi e termini aulici per impressionare emotivamente il lettore. Restituisci SOLO il testo:\n\n" + text,
                
                // Protocols (IT)
                demauro: "Riscrivi il seguente testo rispettando rigorosamente questi criteri:\n1. Usa prevalentemente (80-90%) parole del Vocabolario di Base di De Mauro.\n2. Elimina la variatio e l'uso pleonastico di aggettivi e avverbi.\n3. Usa frasi brevi (meno di 15 parole).\n4. Struttura sintattica semplice: frasi nucleari, coordinate, soggetto esplicito.\n5. Evita assolutamente la forma passiva.\n6. Mantieni alta coesione e coerenza, esplicitando soggetto e motivazioni.\n7. Elimina riferimenti enciclopedici impliciti o processi inferenziali complessi.\n8. Organizza in paragrafi brevi.\nRestituisci SOLO il testo riscritto, senza introduzioni o commenti.\n\nTesto:\n" + text,
                protocollo2: "Riscrivi il seguente testo rispettando rigorosamente questi criteri (Protocollo 2):\n1. Usa prevalentemente (80-90%) parole del Vocabolario di Base (Fondamentale e Alto Uso).\n2. Riduci parzialmente la variatio e l'uso pleonastico di aggettivi/avverbi.\n3. Usa frasi brevi (meno di 20 parole).\n4. Sintassi: frasi nucleari ampliate, coordinate, subordinate causali, temporali (esplicite) e finali (implicite).\n5. Esplicita il soggetto in modo incostante (non sempre necessario).\n6. Introduci forme passive.\n7. Mantieni livelli medi di coesione e coerenza (identità di referenza parziale, ordine logico).\n8. Controlla i riferimenti enciclopedici e riduci i processi inferenziali.\nRestituisci SOLO il testo riscritto, senza introduzioni o commenti.\n\nTesto:\n" + text,
                protocollo3: "Riscrivi il seguente testo rispettando rigorosamente questi criteri (Protocollo 3):\n1. Usa un lessico vario: Vocabolario di Base (Fondamentale, Alto Uso, Alta Disponibilità) ma anche parole non comuni.\n2. Usa significativamente la variatio e aggettivi/avverbi pleonastici.\n3. Usa frasi lunghe e complesse (anche più di 20 parole).\n4. Sintassi complessa: subordinate consecutive, ipotetiche, concessive, avversative, comparative, ecc.\n5. Rendi il soggetto prevalentemente implicito.\n6. Usa costantemente forme passive.\n7. Mantieni livelli incostanti di coesione e coerenza.\nRestituisci SOLO il testo riscritto, senza introduzioni o commenti.\n\nTesto:\n" + text,
                
                summarize: "Riassumi il seguente testo in modo conciso evidenziando i punti chiave:\n\n" + text,
                expand_bullets: "Espandi il seguente testo in un elenco puntato dettagliato:\n\n" + text,
                speaker_notes: "Scrivi delle note per l'oratore (speech) basate sul seguente testo, usando un tono discorsivo e naturale:\n\n" + text,
                synthesis: "Sintetizza i seguenti due testi in un unico testo coerente, ben strutturato e chiaro. Evita ripetizioni e unisci le informazioni in modo logico.\n\nTesto A:\n" + textA + "\n\nTesto B (Selezione):\n" + text + "\n\nSintesi:",
                image_prompt: "Analizza il testo seguente e descrivi un'immagine di tipo selezionato per illustrare il concetto. Restituisci SOLO il prompt dettagliato in inglese o italiano. Inizia con 'PROMPT: ...'\n\nTesto:\n" + text,
                slide_single: "Analizza il seguente testo e crea UNA singola slide riassuntiva.\nRestituisci SOLO un oggetto JSON valido (no markdown, no backticks) con chiavi: 'title', 'points' (array di stringhe), 'notes', 'image_prompt'.\n\nTesto:\n" + text,
                facilitator_explain: "Sei un Facilitatore Digitale per anziani. Spiega il seguente testo o concetto in modo estremamente semplice, usando analogie con la vita quotidiana, evitando tecnicismi e usando un tono rassicurante.\n\nTesto/Concetto da spiegare:\n" + text,
                facilitator_guide: "Sei un Facilitatore Digitale per anziani. Crea una guida passo-passo numerata basata sul seguente testo. Sii molto esplicito, non dare nulla per scontato. Usa un tono gentile.\n\nTesto di input:\n" + text
            },
            en: {
                migliora: "You are an excellent copywriter. Improve the flow, grammar, vocabulary, and structure of the following text. Make it more professional, elegant, and pleasant to read. Return ONLY the improved text, without preambles, greetings, or comments:\n\n" + text,
                espandi: "You are an expert editorial assistant. Your task is to expand the provided text. Add relevant details, develop the concepts, and enrich the content while keeping the original meaning intact. Return ONLY the expanded text, without preambles or comments:\n\n" + text,
                riduci: "You are a professional text editor. Reduce and summarize the following text. Remove superfluous words, get straight to the point, and make it much more concise. Return ONLY the reduced text, without preambles or comments:\n\n" + text,
                sintetizza: "Extract the essence of the speech. Create an extreme summary (maximum 1 or 2 sentences) that captures the absolute focal point of the following text. Return ONLY the summary:\n\n" + text,
                plain: "Act as an expert in 'Plain Language'. Rewrite the following text to make it extremely clear, simple, and direct. Avoid jargon, passive voice, and overly long sentences. Return ONLY the rewritten text, without introductions or notes:\n\n" + text,
                
                // Sentiments
                sentiment_formale: "Rewrite the following text adopting an extremely formal, professional, institutional, and polite tone. Return ONLY the rewritten text:\n\n" + text,
                sentiment_informale: "Rewrite the following text in a very informal, friendly, relaxed, and colloquial tone, as if talking to a close friend. Return ONLY the rewritten text:\n\n" + text,
                sentiment_argomentativo: "Rewrite the following text in an argumentative and persuasive style. Use strong logical connectors and reinforce the concepts to convince the reader. Return ONLY the rewritten text:\n\n" + text,
                sentiment_ironico: "Rewrite the following text with a markedly ironic, sarcastic, and humorous tone. Return ONLY the rewritten text:\n\n" + text,
                sentiment_aggressivo: "Rewrite the following text with an aggressive, bold, assertive, and direct tone. Do not use profanity, but maintain a sharp, frontal style. Return ONLY the rewritten text:\n\n" + text,
                sentiment_paraculo: "Rewrite the following text in a highly diplomatic, flattering, and evasive tone, avoiding taking a clear stance while remaining overly polite. Return ONLY the rewritten text:\n\n" + text,
                sentiment_complottista: "Rewrite the following text in a conspiratorial and skeptical tone. Express doubt about the official version, insert vague references to powerful elites and hidden truths. Return ONLY the rewritten text:\n\n" + text,
                sentiment_difensivo: "Rewrite the following text in a defensive and justificatory tone, as if trying to excuse yourself or minimize responsibilities. Return ONLY the rewritten text:\n\n" + text,
                sentiment_retorico: "Rewrite the following text in an intensely rhetorical, solemn, dramatic, and theatrical style. Return ONLY the rewritten text:\n\n" + text,
                
                // Protocols (EN)
                demauro: "Rewrite the following text using Basic English guidelines (Ogden's Basic English / common 1000 words). Use simple subject-verb-object syntax, short sentences (under 15 words), and avoid passive voice. Return ONLY the rewritten text:\n\n" + text,
                protocollo2: "Rewrite the following text in Plain English (Medium Readability). Use sentences under 20 words, simple subordinates, and moderate passive voice. Return ONLY the rewritten text:\n\n" + text,
                protocollo3: "Rewrite the following text in complex academic English. Use sophisticated vocabulary, passive voice, conditional structures, and complex subordinate clauses. Return ONLY the rewritten text:\n\n" + text,
                
                summarize: "Summarize the following text, highlighting the key points:\n\n" + text,
                expand_bullets: "Expand the following text into a detailed bulleted list:\n\n" + text,
                speaker_notes: "Write speaker notes based on the following text, using a conversational and natural tone:\n\n" + text,
                synthesis: "Synthesize the following two texts into a single, well-structured, and clear text. Text A:\n" + textA + "\n\nText B (Selection):\n" + text + "\n\nSynthesis:",
                image_prompt: "Analyze the following text and describe an image to illustrate the concept. Return ONLY the detailed prompt starting with 'PROMPT:'\n\nText:\n" + text,
                slide_single: "Analyze the following text and create a single summary slide. Return ONLY a valid JSON object (no markdown, no backticks) with keys: 'title', 'points' (array of strings), 'notes', 'image_prompt'.\n\nText:\n" + text,
                facilitator_explain: "Explain the following concept in extremely simple terms, using everyday analogies, avoiding jargon, and maintaining a reassuring tone:\n\n" + text,
                facilitator_guide: "Create a clear step-by-step numbered guide based on the following text. Do not take anything for granted:\n\n" + text
            },
            fr: {
                migliora: "Améliorez la fluidité, la grammaire, le vocabulaire et la structure du texte suivant. Rendez-le plus professionnel, élégant et agréable à lire. Renvoyez UNIQUEMENT le texte amélioré, sans introduction ni commentaire :\n\n" + text,
                espandi: "Développez le texte fourni en ajoutant des détails pertinents et en enrichissant le contenu, tout en conservant le sens original. Renvoyez UNIQUEMENT le texte développé :\n\n" + text,
                riduci: "Réduisez et résumez le texte suivant. Supprimez les mots superflus et rendez-le très concis. Renvoyez UNIQUEMENT le texte réduit :\n\n" + text,
                sintetizza: "Créez une synthèse extrême (maximum 1 ou 2 phrases) du texte suivant. Renvoyez UNIQUEMENT la synthèse :\n\n" + text,
                plain: "Agissez comme un expert en simplification linguistique. Récrivez le texte suivant de manière extrêmement claire, simple et directe. Évitez le jargon et la voix passive. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                
                // Sentiments
                sentiment_formale: "Récrivez le texte suivant sur un ton extrêmement formel, professionnel, institutionnel et poli. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_informale: "Récrivez le texte suivant sur un ton très informel, amical, détendu et familier. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_argomentativo: "Récrivez le texte suivant dans un style argumentatif et persuasif. Utilisez des connecteurs logiques forts pour convaincre le lecteur. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_ironico: "Récrivez le texte suivant sur un ton nettement ironique, sarcastique et humoristique. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_aggressivo: "Récrivez le texte suivant sur un ton agressif, audacieux, affirmatif et direct. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_paraculo: "Récrivez le texte suivant sur un ton très diplomatique, flatteur et évasif, en évitant de prendre position. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_complottista: "Récrivez le texte suivant sur un ton complotiste et sceptique. Doutez de la version officielle et insérez des références vagues à des élites puissantes. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_difensivo: "Récrivez le texte suivant sur un ton défensif et justificatif, pour minimiser vos responsabilités. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_retorico: "Récrivez le texte suivant dans un style intensément rhétorique, solennel, dramatique et théâtral. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                
                // Protocols (FR)
                demauro: "Récrivez le texte suivant en respectant les règles du Français Fondamental et du FALC (Facile à lire et à comprendre). Utilisez un vocabulaire très simple, des phrases de moins de 15 mots et évitez le passif. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                protocollo2: "Récrivez le texte suivant en français simplifié (Lisibilité Moyenne). Utilisez des phrases de moins de 20 mots, des subordonnées simples et un passif modéré. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                protocollo3: "Récrivez le texte suivant dans un style académique et complexe. Utilisez un vocabulaire soutenu, la voix passive et des propositions subordonnées complexes. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                
                summarize: "Résumez le texte suivant en mettant en évidence les points clés :\n\n" + text,
                expand_bullets: "Développer le texte suivant sous forme de liste à puces détaillée :\n\n" + text,
                speaker_notes: "Rédigez des notes d'orateur basées sur le texte suivant, sur un ton naturel et conversationnel :\n\n" + text,
                synthesis: "Synthétisez les deux textes suivants en un seul texte cohérent. Texte A :\n" + textA + "\n\nTexte B (Sélection) :\n" + text + "\n\nSynthèse :",
                image_prompt: "Analysez le texte suivant et décrivez une image pour illustrer le concept. Renvoyez UNIQUEMENT le prompt détaillé commençant par 'PROMPT:'\n\nTexte :\n" + text,
                slide_single: "Analysez le texte suivant et créez une diapositive de synthèse. Renvoyez UNIQUEMENT un objet JSON valide (sans markdown ni backticks) avec les clés: 'title', 'points' (tableau de chaînes), 'notes', 'image_prompt'.\n\nTexte :\n" + text,
                facilitator_explain: "Expliquez le concept suivant de manière très simple, avec des analogies quotidiennes et un ton rassurant :\n\n" + text,
                facilitator_guide: "Créez un guide étape par étape numéroté basé sur le texte suivant. Ne donnez rien pour acquis :\n\n" + text
            },
            es: {
                migliora: "Mejora la fluidez, la gramática, el vocabulario y la estructura del siguiente texto. Hazlo más profesional, elegante y agradable de leer. Devuelve ÚNICAMENTE el texto mejorado, sin introducciones ni comentarios:\n\n" + text,
                espandi: "Expande el texto provisto agregando detalles relevantes y enriqueciendo el contenido, manteniendo el significado original. Devuelve ÚNICAMENTE el texto expandido:\n\n" + text,
                riduci: "Reduce y resume el siguiente texto. Elimina las palabras superfluas y hazlo muy conciso. Devuelve ÚNICAMENTE el texto reducido:\n\n" + text,
                sintetizza: "Crea una síntesis extrema (máximo 1 o 2 frases) del siguiente texto. Devuelve ÚNICAMENTE la síntesis:\n\n" + text,
                plain: "Actúa como un experto en simplificación lingüística. Reestablece el texto en un lenguaje extremadamente claro, simple y directo. Evita la voz pasiva. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                
                // Sentiments
                sentiment_formale: "Reescribe el siguiente texto adoptando un tono extremadamente formal, profesional, institucional y educado. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_informale: "Reescribe el siguiente texto en un tono muy informal, amigable, relajado y coloquial. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_argomentativo: "Reescribe el siguiente texto en estilo argumentativo y persuasivo. Usa conectores lógicos fuertes para convencer al lector. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_ironico: "Reescribe el siguiente texto con un tono marcadamente irónico, sarcástico y humorístico. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_aggressivo: "Reescribe el siguiente texto con un tono agresivo, audaz, asertivo y directo. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_paraculo: "Reescribe el siguiente texto con un tono diplomático, adulador y evasivo, evitando tomar una postura clara. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_complottista: "Reescribe el siguiente texto con un tono conspirativo y escéptico. Duda de la versión oficial e inserta referencias vagas a élites poderosas. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_difensivo: "Reescribe el siguiente texto en un tono defensivo y justificativo, para minimizar tus responsabilidades. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                sentiment_retorico: "Reescribe el siguiente texto de manera intensamente retórica, solemne, dramática y teatral. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                
                // Protocols (ES)
                demauro: "Reescribe el siguiente texto respetando las reglas de Lectura Fácil (UNE 153101). Usa un vocabulario muy básico, frases cortas de menos de 15 palabras y evita la voz pasiva. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                protocollo2: "Reescribe el siguiente texto en lenguaje claro medio. Usa frases de menos de 20 palabras, subordinadas simples y voz pasiva moderada. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                protocollo3: "Reescribe el siguiente texto en un español académico y complejo. Usa vocabulario formal, voz pasiva y cláusulas subordinadas complejas. Devuelve ÚNICAMENTE el texto reescrito:\n\n" + text,
                
                summarize: "Resume el siguiente texto destacando los puntos clave:\n\n" + text,
                expand_bullets: "Expande el siguiente texto en una lista detallada con viñetas:\n\n" + text,
                speaker_notes: "Escribe notas de orador basadas en el siguiente texto, usando un tono conversacional y natural:\n\n" + text,
                synthesis: "Sintetiza los dos textos siguientes en un único texto coherente. Texto A:\n" + textA + "\n\nTexto B (Selección):\n" + text + "\n\nSíntesis:",
                image_prompt: "Analiza el siguiente texto y describe una imagen para ilustrar el concepto. Devuelve ÚNICAMENTE el prompt detallado que comience con 'PROMPT:'\n\nTexto:\n" + text,
                slide_single: "Crea una diapositiva de resumen basada en el texto. Devuelve ÚNICAMENTE un objeto JSON válido (sin markdown ni backticks) con las claves: 'title', 'points' (matriz de cadenas), 'notes', 'image_prompt'.\n\nTexto:\n" + text,
                facilitator_explain: "Explica el siguiente concepto en términos muy sencillos, usando analogías cotidianas y un tono tranquilizador:\n\n" + text,
                facilitator_guide: "Crea una guía paso a paso numerada basada en el texto. No des nada por sentado:\n\n" + text
            },
            pt: {
                migliora: "Você é um redator de excelência. Melhore a fluidez, a gramática, o vocabulário e a estrutura do texto a seguir. Torne-o mais profissional, elegante e agradável de ler. Devolva APENAS o texto melhorado, sem preâmbulos ou comentários:\n\n" + text,
                espandi: "Expanda o texto fornecido, acrescentando detalhes relevantes e enriquecendo o conteúdo, mantendo o significado original. Devolva APENAS o texto expandido:\n\n" + text,
                riduci: "Reduza e resuma o texto a seguir. Remova palavras supérfluas e vá direto ao ponto. Devolva APENAS o texto reduzido:\n\n" + text,
                sintetizza: "Crie uma síntese extrema (no máximo 1 ou 2 frases) do texto a seguir. Devolva APENAS a síntese:\n\n" + text,
                plain: "Atue como um especialista em Linguagem Simples (Plain Language / ISO 24495-1). Reescreva o texto a seguir de forma extremamente clara, simples e direta. Evite jargões e voz passiva. Devolva APENAS o texto reescrito:\n\n" + text,

                sentiment_formale: "Reescreva o texto a seguir adotando um tom extremamente formal, institucional e educado. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_informale: "Reescreva o texto a seguir em um tom bem informal, amigável e coloquial. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_argomentativo: "Reescreva o texto a seguir em estilo argumentativo e persuasivo, usando conectores lógicos fortes. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_ironico: "Reescreva o texto a seguir com um tom marcadamente irônico e sarcástico. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_aggressivo: "Reescreva o texto a seguir com um tom agressivo, assertivo e direto. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_paraculo: "Reescreva o texto a seguir em um tom altamente diplomático, lisonjeiro e evasivo, evitando assumir uma posição clara. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_complottista: "Reescreva o texto a seguir em tom conspiracionista e cético, duvidando da versão oficial. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_difensivo: "Reescreva o texto a seguir em tom defensivo e justificativo. Devolva APENAS o texto reescrito:\n\n" + text,
                sentiment_retorico: "Reescreva o texto a seguir em estilo intensamente retórico, solene e teatral. Devolva APENAS o texto reescrito:\n\n" + text,

                demauro: "Reescreva o texto a seguir seguindo os princípios de Linguagem Simples/Clara (conforme ABNT NBR ISO 24495-1:2024 no Brasil / NP ISO 24495-1:2024 em Portugal). Use vocabulário básico, frases curtas (menos de 15 palavras) e evite a voz passiva. Devolva APENAS o texto reescrito:\n\n" + text,
                protocollo2: "Reescreva o texto a seguir em linguagem clara de nível médio. Use frases com menos de 20 palavras, subordinadas simples e voz passiva moderada. Devolva APENAS o texto reescrito:\n\n" + text,
                protocollo3: "Reescreva o texto a seguir em um português acadêmico e complexo. Use vocabulário formal, voz passiva e orações subordinadas complexas. Devolva APENAS o texto reescrito:\n\n" + text,

                summarize: "Resuma o texto a seguir destacando os pontos-chave:\n\n" + text,
                expand_bullets: "Expanda o texto a seguir em uma lista detalhada com marcadores:\n\n" + text,
                speaker_notes: "Escreva notas do orador com base no texto a seguir, em tom natural e conversacional:\n\n" + text,
                synthesis: "Sintetize os dois textos a seguir em um único texto coerente e bem estruturado. Texto A:\n" + textA + "\n\nTexto B (Seleção):\n" + text + "\n\nSíntese:",
                image_prompt: "Analise o texto a seguir e descreva uma imagem para ilustrar o conceito. Devolva APENAS o prompt detalhado começando com 'PROMPT:'\n\nTexto:\n" + text,
                slide_single: "Analise o texto a seguir e crie um único slide de resumo. Devolva APENAS um objeto JSON válido (sem markdown, sem backticks) com as chaves: 'title', 'points' (array de strings), 'notes', 'image_prompt'.\n\nTexto:\n" + text,
                facilitator_explain: "Explique o conceito a seguir em termos extremamente simples, usando analogias do cotidiano e um tom tranquilizador:\n\n" + text,
                facilitator_guide: "Crie um guia numerado passo a passo com base no texto a seguir. Não presuma nada:\n\n" + text
            },
            de: {
                migliora: "Sie sind ein exzellenter Werbetexter. Verbessern Sie Fluss, Grammatik, Wortschatz und Struktur des folgenden Textes. Machen Sie ihn professioneller, eleganter und angenehmer zu lesen. Geben Sie NUR den verbesserten Text zurück, ohne Einleitung oder Kommentare:\n\n" + text,
                espandi: "Erweitern Sie den bereitgestellten Text. Fügen Sie relevante Details hinzu und bereichern Sie den Inhalt, ohne die ursprüngliche Bedeutung zu verändern. Geben Sie NUR den erweiterten Text zurück:\n\n" + text,
                riduci: "Kürzen und fassen Sie den folgenden Text zusammen. Entfernen Sie überflüssige Wörter und kommen Sie auf den Punkt. Geben Sie NUR den gekürzten Text zurück:\n\n" + text,
                sintetizza: "Erstellen Sie eine extreme Zusammenfassung (maximal 1-2 Sätze) des folgenden Textes. Geben Sie NUR die Zusammenfassung zurück:\n\n" + text,
                plain: "Handeln Sie als Experte für Einfache Sprache (Plain Language, DIN ISO 24495-1). Schreiben Sie den folgenden Text extrem klar, einfach und direkt um. Vermeiden Sie Fachjargon und Passivkonstruktionen. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,

                sentiment_formale: "Schreiben Sie den folgenden Text in einem extrem formellen, institutionellen und höflichen Ton um. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_informale: "Schreiben Sie den folgenden Text in einem sehr informellen, freundlichen und umgangssprachlichen Ton um. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_argomentativo: "Schreiben Sie den folgenden Text in einem argumentativen und überzeugenden Stil um, mit starken logischen Konnektoren. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_ironico: "Schreiben Sie den folgenden Text mit einem stark ironischen und sarkastischen Ton um. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_aggressivo: "Schreiben Sie den folgenden Text in einem aggressiven, bestimmten und direkten Ton um. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_paraculo: "Schreiben Sie den folgenden Text in einem sehr diplomatischen, schmeichelhaften und ausweichenden Ton um, ohne eine klare Position zu beziehen. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_complottista: "Schreiben Sie den folgenden Text in einem verschwörerischen und skeptischen Ton um und zweifeln Sie an der offiziellen Version. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_difensivo: "Schreiben Sie den folgenden Text in einem defensiven und rechtfertigenden Ton um. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                sentiment_retorico: "Schreiben Sie den folgenden Text in einem intensiv rhetorischen, feierlichen und theatralischen Stil um. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,

                demauro: "Schreiben Sie den folgenden Text gemäß den Regeln der Leichten Sprache (DIN SPEC 33429) um. Verwenden Sie sehr einfachen Wortschatz, kurze Sätze (unter 15 Wörtern) und vermeiden Sie Passivkonstruktionen. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                protocollo2: "Schreiben Sie den folgenden Text in Einfacher Sprache mittlerer Lesbarkeit (DIN ISO 24495-1) um. Verwenden Sie Sätze unter 20 Wörtern, einfache Nebensätze und mäßiges Passiv. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,
                protocollo3: "Schreiben Sie den folgenden Text in komplexem, akademischem Deutsch um. Verwenden Sie anspruchsvollen Wortschatz, Passiv und komplexe Nebensätze. Geben Sie NUR den umgeschriebenen Text zurück:\n\n" + text,

                summarize: "Fassen Sie den folgenden Text zusammen und heben Sie die Kernpunkte hervor:\n\n" + text,
                expand_bullets: "Erweitern Sie den folgenden Text zu einer detaillierten Aufzählungsliste:\n\n" + text,
                speaker_notes: "Schreiben Sie Redenotizen basierend auf dem folgenden Text in einem natürlichen, gesprächigen Ton:\n\n" + text,
                synthesis: "Synthetisieren Sie die folgenden zwei Texte zu einem einzigen, kohärenten und klar strukturierten Text. Text A:\n" + textA + "\n\nText B (Auswahl):\n" + text + "\n\nSynthese:",
                image_prompt: "Analysieren Sie den folgenden Text und beschreiben Sie ein Bild zur Veranschaulichung des Konzepts. Geben Sie NUR den detaillierten Prompt zurück, beginnend mit 'PROMPT:'\n\nText:\n" + text,
                slide_single: "Analysieren Sie den folgenden Text und erstellen Sie eine einzelne Zusammenfassungsfolie. Geben Sie NUR ein gültiges JSON-Objekt zurück (kein Markdown, keine Backticks) mit den Schlüsseln: 'title', 'points' (Array von Strings), 'notes', 'image_prompt'.\n\nText:\n" + text,
                facilitator_explain: "Erklären Sie das folgende Konzept in extrem einfachen Worten, mit alltäglichen Analogien und einem beruhigenden Ton:\n\n" + text,
                facilitator_guide: "Erstellen Sie eine nummerierte Schritt-für-Schritt-Anleitung basierend auf dem folgenden Text. Setzen Sie nichts als selbstverständlich voraus:\n\n" + text
            },
            ro: {
                migliora: "Ești un copywriter de excepție. Îmbunătățește fluența, gramatica, vocabularul și structura textului următor. Fă-l mai profesionist, elegant și plăcut de citit. Returnează DOAR textul îmbunătățit, fără preambul sau comentarii:\n\n" + text,
                espandi: "Extinde textul furnizat, adăugând detalii relevante și îmbogățind conținutul, păstrând sensul original. Returnează DOAR textul extins:\n\n" + text,
                riduci: "Redu și rezumă textul următor. Elimină cuvintele de prisos și mergi direct la subiect. Returnează DOAR textul redus:\n\n" + text,
                sintetizza: "Creează o sinteză extremă (maximum 1-2 propoziții) a textului următor. Returnează DOAR sinteza:\n\n" + text,
                plain: "Acționează ca un expert în limbaj clar (Plain Language / ISO 24495-1). Rescrie textul următor astfel încât să fie extrem de clar, simplu și direct. Evită jargonul și diateza pasivă. Returnează DOAR textul rescris:\n\n" + text,

                sentiment_formale: "Rescrie textul următor adoptând un ton extrem de formal, instituțional și politicos. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_informale: "Rescrie textul următor într-un ton foarte informal, prietenos și colocvial. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_argomentativo: "Rescrie textul următor într-un stil argumentativ și persuasiv, folosind conectori logici puternici. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_ironico: "Rescrie textul următor cu un ton marcat ironic și sarcastic. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_aggressivo: "Rescrie textul următor cu un ton agresiv, asertiv și direct. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_paraculo: "Rescrie textul următor într-un ton foarte diplomatic, măgulitor și evaziv, evitând să iei o poziție clară. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_complottista: "Rescrie textul următor într-un ton conspiraționist și sceptic, punând la îndoială versiunea oficială. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_difensivo: "Rescrie textul următor într-un ton defensiv și justificativ. Returnează DOAR textul rescris:\n\n" + text,
                sentiment_retorico: "Rescrie textul următor într-un stil intens retoric, solemn și teatral. Returnează DOAR textul rescris:\n\n" + text,

                demauro: "Rescrie textul următor respectând principiile Limbajului Clar/Simplu (conform ghidurilor UE de comunicare accesibilă). Folosește vocabular de bază, propoziții scurte (sub 15 cuvinte) și evită diateza pasivă. Returnează DOAR textul rescris:\n\n" + text,
                protocollo2: "Rescrie textul următor în limbaj clar de nivel mediu. Folosește propoziții sub 20 de cuvinte, subordonate simple și diateză pasivă moderată. Returnează DOAR textul rescris:\n\n" + text,
                protocollo3: "Rescrie textul următor într-un stil academic și complex. Folosește vocabular susținut, diateza pasivă și propoziții subordonate complexe. Returnează DOAR textul rescris:\n\n" + text,

                summarize: "Rezumă textul următor evidențiind punctele cheie:\n\n" + text,
                expand_bullets: "Extinde textul următor într-o listă detaliată cu marcatori:\n\n" + text,
                speaker_notes: "Scrie note pentru vorbitor pe baza textului următor, folosind un ton natural și conversațional:\n\n" + text,
                synthesis: "Sintetizează următoarele două texte într-un singur text coerent și bine structurat. Textul A:\n" + textA + "\n\nTextul B (Selecție):\n" + text + "\n\nSinteză:",
                image_prompt: "Analizează textul următor și descrie o imagine care să ilustreze conceptul. Returnează DOAR prompt-ul detaliat, începând cu 'PROMPT:'\n\nText:\n" + text,
                slide_single: "Analizează textul următor și creează un singur slide de rezumat. Returnează DOAR un obiect JSON valid (fără markdown, fără backticks) cu cheile: 'title', 'points' (array de string-uri), 'notes', 'image_prompt'.\n\nText:\n" + text,
                facilitator_explain: "Explică următorul concept în termeni extrem de simpli, folosind analogii din viața de zi cu zi și un ton liniștitor:\n\n" + text,
                facilitator_guide: "Creează un ghid numerotat pas cu pas pe baza textului următor. Nu presupune nimic de la sine înțeles:\n\n" + text
            },
            nb: {
                migliora: "Du er en fremragende tekstforfatter. Forbedre flyten, grammatikken, ordforrådet og strukturen i teksten under. Gjør den mer profesjonell, elegant og hyggelig å lese. Returner KUN den forbedrede teksten, uten innledning eller kommentarer:\n\n" + text,
                espandi: "Utvid den oppgitte teksten. Legg til relevante detaljer og berik innholdet uten å endre den opprinnelige betydningen. Returner KUN den utvidede teksten:\n\n" + text,
                riduci: "Reduser og oppsummer teksten under. Fjern overflødige ord og kom rett til poenget. Returner KUN den reduserte teksten:\n\n" + text,
                sintetizza: "Lag et ekstremt sammendrag (maks 1-2 setninger) av teksten under. Returner KUN sammendraget:\n\n" + text,
                plain: "Opptre som ekspert på klarspråk (Plain Language / NS-ISO 24495-1). Skriv om teksten under slik at den blir ekstremt klar, enkel og direkte. Unngå fagsjargong og passiv form. Returner KUN den omskrevne teksten:\n\n" + text,

                sentiment_formale: "Skriv om teksten under med en ekstremt formell, institusjonell og høflig tone. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_informale: "Skriv om teksten under med en svært uformell, vennlig og dagligdags tone. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_argomentativo: "Skriv om teksten under i en argumenterende og overbevisende stil, med sterke logiske forbindelser. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_ironico: "Skriv om teksten under med en markant ironisk og sarkastisk tone. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_aggressivo: "Skriv om teksten under med en aggressiv, bestemt og direkte tone. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_paraculo: "Skriv om teksten under med en svært diplomatisk, smigrende og unnvikende tone, og unngå å ta et klart standpunkt. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_complottista: "Skriv om teksten under med en konspiratorisk og skeptisk tone, og tvil på den offisielle versjonen. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_difensivo: "Skriv om teksten under med en defensiv og forklarende tone. Returner KUN den omskrevne teksten:\n\n" + text,
                sentiment_retorico: "Skriv om teksten under i en intenst retorisk, høytidelig og teatralsk stil. Returner KUN den omskrevne teksten:\n\n" + text,

                demauro: "Skriv om teksten under i tråd med klarspråksprinsipper. Bruk enkelt grunnleggende ordforråd, korte setninger (under 15 ord) og unngå passiv form. Returner KUN den omskrevne teksten:\n\n" + text,
                protocollo2: "Skriv om teksten under i klarspråk med middels lesbarhet (NS-ISO 24495-1). Bruk setninger under 20 ord, enkle leddsetninger og moderat passiv form. Returner KUN den omskrevne teksten:\n\n" + text,
                protocollo3: "Skriv om teksten under i et komplekst, akademisk norsk. Bruk avansert ordforråd, passiv form og komplekse leddsetninger. Returner KUN den omskrevne teksten:\n\n" + text,

                summarize: "Oppsummer teksten under og fremhev hovedpunktene:\n\n" + text,
                expand_bullets: "Utvid teksten under til en detaljert punktliste:\n\n" + text,
                speaker_notes: "Skriv talernotater basert på teksten under, med en naturlig og samtalepreget tone:\n\n" + text,
                synthesis: "Syntetiser de to følgende tekstene til én sammenhengende, godt strukturert tekst. Tekst A:\n" + textA + "\n\nTekst B (Utvalg):\n" + text + "\n\nSyntese:",
                image_prompt: "Analyser teksten under og beskriv et bilde som illustrerer konseptet. Returner KUN den detaljerte prompten, som starter med 'PROMPT:'\n\nTekst:\n" + text,
                slide_single: "Analyser teksten under og lag én sammendrags-slide. Returner KUN et gyldig JSON-objekt (ingen markdown, ingen backticks) med nøklene: 'title', 'points' (array av strenger), 'notes', 'image_prompt'.\n\nTekst:\n" + text,
                facilitator_explain: "Forklar følgende begrep i ekstremt enkle ord, med hverdagslige analogier og en betryggende tone:\n\n" + text,
                facilitator_guide: "Lag en nummerert trinnvis guide basert på teksten under. Ta ingenting for gitt:\n\n" + text
            },
            fi: {
                migliora: "Olet erinomainen copywriter. Paranna seuraavan tekstin sujuvuutta, kielioppia, sanastoa ja rakennetta. Tee siitä ammattimaisempi, tyylikkäämpi ja miellyttävämpi lukea. Palauta VAIN parannettu teksti, ilman johdantoa tai kommentteja:\n\n" + text,
                espandi: "Laajenna annettua tekstiä. Lisää olennaisia yksityiskohtia ja rikasta sisältöä säilyttäen alkuperäisen merkityksen. Palauta VAIN laajennettu teksti:\n\n" + text,
                riduci: "Tiivistä ja lyhennä seuraava teksti. Poista turhat sanat ja mene suoraan asiaan. Palauta VAIN tiivistetty teksti:\n\n" + text,
                sintetizza: "Luo äärimmäinen tiivistelmä (enintään 1-2 lausetta) seuraavasta tekstistä. Palauta VAIN tiivistelmä:\n\n" + text,
                plain: "Toimi selkeän kielen asiantuntijana (Plain Language / SFS-ISO 24495-1). Kirjoita seuraava teksti uudelleen niin, että se on erittäin selkeä, yksinkertainen ja suora. Vältä ammattislangia ja passiivimuotoa. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,

                sentiment_formale: "Kirjoita seuraava teksti uudelleen erittäin muodollisella, institutionaalisella ja kohteliaalla sävyllä. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_informale: "Kirjoita seuraava teksti uudelleen hyvin epämuodollisella, ystävällisellä ja arkisella sävyllä. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_argomentativo: "Kirjoita seuraava teksti uudelleen argumentoivalla ja vakuuttavalla tyylillä, käyttäen vahvoja loogisia siirtymiä. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_ironico: "Kirjoita seuraava teksti uudelleen selvästi ironisella ja sarkastisella sävyllä. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_aggressivo: "Kirjoita seuraava teksti uudelleen aggressiivisella, jämäkällä ja suoralla sävyllä. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_paraculo: "Kirjoita seuraava teksti uudelleen hyvin diplomaattisella, mairittelevalla ja välttelevällä sävyllä, ottamatta selkeää kantaa. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_complottista: "Kirjoita seuraava teksti uudelleen salaliittoteoreettisella ja epäilevällä sävyllä, epäillen virallista versiota. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_difensivo: "Kirjoita seuraava teksti uudelleen puolustelevalla ja selittelevällä sävyllä. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                sentiment_retorico: "Kirjoita seuraava teksti uudelleen voimakkaan retorisella, juhlavalla ja teatraalisella tyylillä. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,

                demauro: "Kirjoita seuraava teksti uudelleen selkokielen periaatteiden mukaisesti (Selkokeskus). Käytä hyvin yksinkertaista perussanastoa, lyhyitä lauseita (alle 15 sanaa) ja vältä passiivimuotoa. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                protocollo2: "Kirjoita seuraava teksti uudelleen keskitason selkeällä kielellä (SFS-ISO 24495-1). Käytä alle 20 sanan lauseita, yksinkertaisia sivulauseita ja kohtalaista passiivimuotoa. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,
                protocollo3: "Kirjoita seuraava teksti uudelleen monimutkaisella, akateemisella suomella. Käytä vaativaa sanastoa, passiivimuotoa ja monimutkaisia sivulauseita. Palauta VAIN uudelleenkirjoitettu teksti:\n\n" + text,

                summarize: "Tiivistä seuraava teksti korostaen keskeisiä kohtia:\n\n" + text,
                expand_bullets: "Laajenna seuraava teksti yksityiskohtaiseksi luettelomuotoiseksi listaksi:\n\n" + text,
                speaker_notes: "Kirjoita puhujan muistiinpanot seuraavan tekstin pohjalta, luonnollisella ja keskustelevalla sävyllä:\n\n" + text,
                synthesis: "Yhdistä seuraavat kaksi tekstiä yhdeksi johdonmukaiseksi, hyvin jäsennellyksi tekstiksi. Teksti A:\n" + textA + "\n\nTeksti B (Valinta):\n" + text + "\n\nSynteesi:",
                image_prompt: "Analysoi seuraava teksti ja kuvaile kuva, joka havainnollistaa käsitettä. Palauta VAIN yksityiskohtainen kehote, joka alkaa 'PROMPT:'\n\nTeksti:\n" + text,
                slide_single: "Analysoi seuraava teksti ja luo yksi yhteenvetodia. Palauta VAIN kelvollinen JSON-objekti (ei markdownia, ei backtickejä) avaimilla: 'title', 'points' (merkkijonotaulukko), 'notes', 'image_prompt'.\n\nTeksti:\n" + text,
                facilitator_explain: "Selitä seuraava käsite erittäin yksinkertaisin sanoin, käyttäen arkipäivän vertauksia ja rauhoittavaa sävyä:\n\n" + text,
                facilitator_guide: "Luo numeroitu vaiheittainen opas seuraavan tekstin pohjalta. Älä oleta mitään itsestään selväksi:\n\n" + text
            },
            sv: {
                migliora: "Du är en enastående copywriter. Förbättra flytet, grammatiken, ordförrådet och strukturen i följande text. Gör den mer professionell, elegant och trevlig att läsa. Returnera ENDAST den förbättrade texten, utan inledning eller kommentarer:\n\n" + text,
                espandi: "Utöka den angivna texten. Lägg till relevanta detaljer och berika innehållet utan att ändra den ursprungliga betydelsen. Returnera ENDAST den utökade texten:\n\n" + text,
                riduci: "Förkorta och sammanfatta följande text. Ta bort onödiga ord och kom rakt på sak. Returnera ENDAST den förkortade texten:\n\n" + text,
                sintetizza: "Skapa en extrem sammanfattning (max 1-2 meningar) av följande text. Returnera ENDAST sammanfattningen:\n\n" + text,
                plain: "Agera som expert på klarspråk (Plain Language / SS-ISO 24495-1). Skriv om följande text så att den blir extremt tydlig, enkel och direkt. Undvik jargong och passiv form. Returnera ENDAST den omskrivna texten:\n\n" + text,

                sentiment_formale: "Skriv om följande text med en extremt formell, institutionell och artig ton. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_informale: "Skriv om följande text med en mycket informell, vänlig och vardaglig ton. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_argomentativo: "Skriv om följande text i en argumenterande och övertygande stil, med starka logiska kopplingar. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_ironico: "Skriv om följande text med en tydligt ironisk och sarkastisk ton. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_aggressivo: "Skriv om följande text med en aggressiv, bestämd och direkt ton. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_paraculo: "Skriv om följande text med en mycket diplomatisk, smickrande och undanglidande ton, utan att ta klar ställning. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_complottista: "Skriv om följande text med en konspiratorisk och skeptisk ton, och tvivla på den officiella versionen. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_difensivo: "Skriv om följande text med en defensiv och ursäktande ton. Returnera ENDAST den omskrivna texten:\n\n" + text,
                sentiment_retorico: "Skriv om följande text i en intensivt retorisk, högtidlig och teatralisk stil. Returnera ENDAST den omskrivna texten:\n\n" + text,

                demauro: "Skriv om följande text enligt principerna för lättläst svenska. Använd mycket enkelt grundordförråd, korta meningar (under 15 ord) och undvik passiv form. Returnera ENDAST den omskrivna texten:\n\n" + text,
                protocollo2: "Skriv om följande text i klarspråk med medelnivå läsbarhet (SS-ISO 24495-1). Använd meningar under 20 ord, enkla bisatser och måttlig passiv form. Returnera ENDAST den omskrivna texten:\n\n" + text,
                protocollo3: "Skriv om följande text i en komplex, akademisk svenska. Använd avancerat ordförråd, passiv form och komplexa bisatser. Returnera ENDAST den omskrivna texten:\n\n" + text,

                summarize: "Sammanfatta följande text och lyft fram de viktigaste punkterna:\n\n" + text,
                expand_bullets: "Utöka följande text till en detaljerad punktlista:\n\n" + text,
                speaker_notes: "Skriv talarnoteringar baserade på följande text, med en naturlig och samtalsartad ton:\n\n" + text,
                synthesis: "Syntetisera följande två texter till en enda sammanhängande och välstrukturerad text. Text A:\n" + textA + "\n\nText B (Markering):\n" + text + "\n\nSyntes:",
                image_prompt: "Analysera följande text och beskriv en bild som illustrerar konceptet. Returnera ENDAST den detaljerade prompten, som börjar med 'PROMPT:'\n\nText:\n" + text,
                slide_single: "Analysera följande text och skapa en enda sammanfattande bild (slide). Returnera ENDAST ett giltigt JSON-objekt (ingen markdown, inga backticks) med nycklarna: 'title', 'points' (array av strängar), 'notes', 'image_prompt'.\n\nText:\n" + text,
                facilitator_explain: "Förklara följande koncept i extremt enkla ordalag, med vardagliga analogier och en lugnande ton:\n\n" + text,
                facilitator_guide: "Skapa en numrerad steg-för-steg-guide baserad på följande text. Ta inget för givet:\n\n" + text
            },
            da: {
                migliora: "Du er en fremragende tekstforfatter. Forbedr flowet, grammatikken, ordforrådet og strukturen i følgende tekst. Gør den mere professionel, elegant og behagelig at læse. Returner KUN den forbedrede tekst, uden indledning eller kommentarer:\n\n" + text,
                espandi: "Udvid den angivne tekst. Tilføj relevante detaljer og berig indholdet uden at ændre den oprindelige betydning. Returner KUN den udvidede tekst:\n\n" + text,
                riduci: "Forkort og opsummer følgende tekst. Fjern overflødige ord og kom direkte til sagen. Returner KUN den forkortede tekst:\n\n" + text,
                sintetizza: "Lav en ekstrem sammenfatning (maks. 1-2 sætninger) af følgende tekst. Returner KUN sammenfatningen:\n\n" + text,
                plain: "Optræd som ekspert i klart sprog (Plain Language / DS/ISO 24495-1). Omskriv følgende tekst, så den bliver ekstremt klar, enkel og direkte. Undgå fagsprog og passiv form. Returner KUN den omskrevne tekst:\n\n" + text,

                sentiment_formale: "Omskriv følgende tekst med en ekstremt formel, institutionel og høflig tone. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_informale: "Omskriv følgende tekst med en meget uformel, venlig og dagligdags tone. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_argomentativo: "Omskriv følgende tekst i en argumenterende og overbevisende stil med stærke logiske forbindelser. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_ironico: "Omskriv følgende tekst med en markant ironisk og sarkastisk tone. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_aggressivo: "Omskriv følgende tekst med en aggressiv, bestemt og direkte tone. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_paraculo: "Omskriv følgende tekst med en meget diplomatisk, smigrende og undvigende tone uden at tage klar stilling. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_complottista: "Omskriv følgende tekst med en konspiratorisk og skeptisk tone, og betvivl den officielle version. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_difensivo: "Omskriv følgende tekst med en defensiv og undskyldende tone. Returner KUN den omskrevne tekst:\n\n" + text,
                sentiment_retorico: "Omskriv følgende tekst i en intenst retorisk, højtidelig og teatralsk stil. Returner KUN den omskrevne tekst:\n\n" + text,

                demauro: "Omskriv følgende tekst i overensstemmelse med principperne for letlæst dansk. Brug meget simpelt grundordforråd, korte sætninger (under 15 ord) og undgå passiv form. Returner KUN den omskrevne tekst:\n\n" + text,
                protocollo2: "Omskriv følgende tekst i klart sprog på mellemniveau (DS/ISO 24495-1). Brug sætninger under 20 ord, simple ledsætninger og moderat passiv form. Returner KUN den omskrevne tekst:\n\n" + text,
                protocollo3: "Omskriv følgende tekst i et komplekst, akademisk dansk. Brug avanceret ordforråd, passiv form og komplekse ledsætninger. Returner KUN den omskrevne tekst:\n\n" + text,

                summarize: "Opsummer følgende tekst og fremhæv de vigtigste punkter:\n\n" + text,
                expand_bullets: "Udvid følgende tekst til en detaljeret punktopstilling:\n\n" + text,
                speaker_notes: "Skriv talernoter baseret på følgende tekst med en naturlig og samtalepræget tone:\n\n" + text,
                synthesis: "Syntetiser følgende to tekster til en enkelt sammenhængende og velstruktureret tekst. Tekst A:\n" + textA + "\n\nTekst B (Markering):\n" + text + "\n\nSyntese:",
                image_prompt: "Analyser følgende tekst og beskriv et billede, der illustrerer konceptet. Returner KUN den detaljerede prompt, der starter med 'PROMPT:'\n\nTekst:\n" + text,
                slide_single: "Analyser følgende tekst og opret ét sammenfattende slide. Returner KUN et gyldigt JSON-objekt (ingen markdown, ingen backticks) med nøglerne: 'title', 'points' (array af strenge), 'notes', 'image_prompt'.\n\nTekst:\n" + text,
                facilitator_explain: "Forklar følgende koncept i ekstremt enkle vendinger, med hverdagsanalogier og en beroligende tone:\n\n" + text,
                facilitator_guide: "Opret en nummereret trin-for-trin guide baseret på følgende tekst. Antag intet som givet:\n\n" + text
            },
            nl: {
                migliora: "Je bent een uitstekende copywriter. Verbeter de vlotheid, grammatica, woordenschat en structuur van de volgende tekst. Maak hem professioneler, eleganter en aangenamer om te lezen. Geef ALLEEN de verbeterde tekst terug, zonder inleiding of commentaar:\n\n" + text,
                espandi: "Breid de gegeven tekst uit. Voeg relevante details toe en verrijk de inhoud, met behoud van de oorspronkelijke betekenis. Geef ALLEEN de uitgebreide tekst terug:\n\n" + text,
                riduci: "Kort de volgende tekst in en vat hem samen. Verwijder overbodige woorden en kom direct ter zake. Geef ALLEEN de ingekorte tekst terug:\n\n" + text,
                sintetizza: "Maak een extreme samenvatting (maximaal 1-2 zinnen) van de volgende tekst. Geef ALLEEN de samenvatting terug:\n\n" + text,
                plain: "Handel als expert in duidelijke taal (Plain Language / NEN-ISO 24495-1, Taalniveau B1). Herschrijf de volgende tekst zodat hij extreem duidelijk, eenvoudig en direct is. Vermijd jargon en de lijdende vorm. Geef ALLEEN de herschreven tekst terug:\n\n" + text,

                sentiment_formale: "Herschrijf de volgende tekst in een uiterst formele, institutionele en beleefde toon. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_informale: "Herschrijf de volgende tekst in een zeer informele, vriendelijke en spreektalige toon. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_argomentativo: "Herschrijf de volgende tekst in een argumentatieve en overtuigende stijl, met sterke logische verbindingen. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_ironico: "Herschrijf de volgende tekst met een uitgesproken ironische en sarcastische toon. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_aggressivo: "Herschrijf de volgende tekst met een agressieve, assertieve en directe toon. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_paraculo: "Herschrijf de volgende tekst in een zeer diplomatieke, vleiende en ontwijkende toon, zonder een duidelijk standpunt in te nemen. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_complottista: "Herschrijf de volgende tekst in een complotdenkende en sceptische toon, en twijfel aan de officiële versie. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_difensivo: "Herschrijf de volgende tekst in een defensieve en verontschuldigende toon. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                sentiment_retorico: "Herschrijf de volgende tekst in een intens retorische, plechtige en theatrale stijl. Geef ALLEEN de herschreven tekst terug:\n\n" + text,

                demauro: "Herschrijf de volgende tekst volgens de principes van Taalniveau B1. Gebruik zeer eenvoudige basiswoordenschat, korte zinnen (minder dan 15 woorden) en vermijd de lijdende vorm. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                protocollo2: "Herschrijf de volgende tekst in duidelijke taal van gemiddeld niveau (NEN-ISO 24495-1). Gebruik zinnen van minder dan 20 woorden, eenvoudige bijzinnen en matige lijdende vorm. Geef ALLEEN de herschreven tekst terug:\n\n" + text,
                protocollo3: "Herschrijf de volgende tekst in complex, academisch Nederlands. Gebruik geavanceerde woordenschat, de lijdende vorm en complexe bijzinnen. Geef ALLEEN de herschreven tekst terug:\n\n" + text,

                summarize: "Vat de volgende tekst samen en benadruk de belangrijkste punten:\n\n" + text,
                expand_bullets: "Breid de volgende tekst uit tot een gedetailleerde opsomming:\n\n" + text,
                speaker_notes: "Schrijf sprekersnotities op basis van de volgende tekst, in een natuurlijke en conversationele toon:\n\n" + text,
                synthesis: "Synthetiseer de volgende twee teksten tot één samenhangende, goed gestructureerde tekst. Tekst A:\n" + textA + "\n\nTekst B (Selectie):\n" + text + "\n\nSynthese:",
                image_prompt: "Analyseer de volgende tekst en beschrijf een afbeelding om het concept te illustreren. Geef ALLEEN de gedetailleerde prompt terug, beginnend met 'PROMPT:'\n\nTekst:\n" + text,
                slide_single: "Analyseer de volgende tekst en maak één samenvattende slide. Geef ALLEEN een geldig JSON-object terug (geen markdown, geen backticks) met de sleutels: 'title', 'points' (array van strings), 'notes', 'image_prompt'.\n\nTekst:\n" + text,
                facilitator_explain: "Leg het volgende concept uit in uiterst eenvoudige bewoordingen, met alledaagse analogieën en een geruststellende toon:\n\n" + text,
                facilitator_guide: "Maak een genummerde stap-voor-stap gids op basis van de volgende tekst. Neem niets als vanzelfsprekend aan:\n\n" + text
            },
            "fr-ca": {
                migliora: "Vous êtes un rédacteur professionnel expert en langage clair. Améliorez la fluidité, la grammaire, le vocabulaire et la structure du texte suivant. Rendez-le plus professionnel et agréable à lire. Renvoyez UNIQUEMENT le texte amélioré, sans préambule :\n\n" + text,
                espandi: "Développez le texte fourni en ajoutant des détails pertinents et en enrichissant le contenu, tout en conservant le sens original. Renvoyez UNIQUEMENT le texte développé :\n\n" + text,
                riduci: "Réduisez et résumez le texte suivant. Supprimez les mots superflus et rendez-le très concis. Renvoyez UNIQUEMENT le texte réduit :\n\n" + text,
                sintetizza: "Créez une synthèse extrême (maximum 1 ou 2 phrases) du texte suivant. Renvoyez UNIQUEMENT la synthèse :\n\n" + text,
                plain: "Agissez comme un expert du langage clair et simple, conformément à la norme canadienne CAN/ASC-3.1:2025. Récrivez le texte suivant en voix active, avec une structure sujet-verbe-complément directe, des phrases idéalement de 7 à 12 mots, et sans nominalisations (ex. utilisez le verbe 'considérer' plutôt que 'prendre en considération'). Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,

                sentiment_formale: "Récrivez le texte suivant sur un ton extrêmement formel, professionnel, institutionnel et poli. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_informale: "Récrivez le texte suivant sur un ton très informel, amical, détendu et familier. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_argomentativo: "Récrivez le texte suivant dans un style argumentatif et persuasif. Utilisez des connecteurs logiques forts pour convaincre le lecteur. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_ironico: "Récrivez le texte suivant sur un ton nettement ironique, sarcastique et humoristique. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_aggressivo: "Récrivez le texte suivant sur un ton direct, affirmatif et sans détour. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_paraculo: "Récrivez le texte suivant sur un ton très diplomatique, flatteur et évasif, en évitant de prendre position. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_complottista: "Récrivez le texte suivant sur un ton complotiste et sceptique. Doutez de la version officielle et insérez des références vagues à des élites puissantes. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_difensivo: "Récrivez le texte suivant sur un ton défensif et justificatif, pour minimiser vos responsabilités. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                sentiment_retorico: "Récrivez le texte suivant dans un style intensément rhétorique, solennel, dramatique et théâtral. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,

                demauro: "Récrivez le texte suivant selon les critères techniques de la norme CAN/ASC-3.1:2025 (Formulation et expression) : voix active et impératif quand c'est approprié, aucune nominalisation, structure sujet-verbe-complément directe sans segments intercalés, et phrases limitées à 7-12 mots. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                protocollo2: "Récrivez le texte suivant en langage clair de lisibilité moyenne. Utilisez des phrases de moins de 20 mots, des subordonnées simples et un passif modéré. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,
                protocollo3: "Récrivez le texte suivant dans un style académique et complexe. Utilisez un vocabulaire soutenu, la voix passive et des propositions subordonnées complexes. Renvoyez UNIQUEMENT le texte réécrit :\n\n" + text,

                summarize: "Résumez le texte suivant en mettant en évidence les points clés :\n\n" + text,
                expand_bullets: "Développez le texte suivant sous forme de liste à puces détaillée :\n\n" + text,
                speaker_notes: "Rédigez des notes d'allocution basées sur le texte suivant, sur un ton naturel et conversationnel :\n\n" + text,
                synthesis: "Synthétisez les deux textes suivants en un seul texte cohérent. Texte A :\n" + textA + "\n\nTexte B (Sélection) :\n" + text + "\n\nSynthèse :",
                image_prompt: "Analysez le texte suivant et décrivez une image pour illustrer le concept. Renvoyez UNIQUEMENT la requête détaillée commençant par 'PROMPT:'\n\nTexte :\n" + text,
                slide_single: "Analysez le texte suivant et créez une diapositive de synthèse. Renvoyez UNIQUEMENT un objet JSON valide (sans markdown ni balises de code) avec les clés: 'title', 'points' (tableau de chaînes), 'notes', 'image_prompt'.\n\nTexte :\n" + text,
                facilitator_explain: "Expliquez le concept suivant de manière très simple, avec des analogies quotidiennes et un ton rassurant :\n\n" + text,
                facilitator_guide: "Créez un guide étape par étape numéroté basé sur le texte suivant. Ne donnez rien pour acquis :\n\n" + text
            },
            "en-ca": {
                migliora: "You are an excellent copywriter. Improve the flow, grammar, vocabulary, and structure of the following text. Make it more professional, elegant, and pleasant to read. Return ONLY the improved text, without preambles or comments:\n\n" + text,
                espandi: "You are an expert editorial assistant. Expand the provided text with relevant details while keeping the original meaning intact. Return ONLY the expanded text:\n\n" + text,
                riduci: "Reduce and summarize the following text. Remove superfluous words and get straight to the point. Return ONLY the reduced text:\n\n" + text,
                sintetizza: "Create an extreme summary (maximum 1 or 2 sentences) of the following text. Return ONLY the summary:\n\n" + text,
                plain: "Act as an expert in plain language, following Canada's official standard CAN-ASC-3.1:2025 (Plain Language). Rewrite the following text so the intended audience can easily find what they need, understand what they find, and use that information. Avoid jargon and passive voice, and prioritize accessibility and barrier-free communication. Return ONLY the rewritten text:\n\n" + text,

                sentiment_formale: "Rewrite the following text adopting an extremely formal, professional, institutional, and polite tone. Return ONLY the rewritten text:\n\n" + text,
                sentiment_informale: "Rewrite the following text in a very informal, friendly, relaxed, and colloquial tone. Return ONLY the rewritten text:\n\n" + text,
                sentiment_argomentativo: "Rewrite the following text in an argumentative and persuasive style. Use strong logical connectors to convince the reader. Return ONLY the rewritten text:\n\n" + text,
                sentiment_ironico: "Rewrite the following text with a markedly ironic, sarcastic, and humorous tone. Return ONLY the rewritten text:\n\n" + text,
                sentiment_aggressivo: "Rewrite the following text with an aggressive, bold, assertive, and direct tone. Return ONLY the rewritten text:\n\n" + text,
                sentiment_paraculo: "Rewrite the following text in a highly diplomatic, flattering, and evasive tone, avoiding taking a clear stance. Return ONLY the rewritten text:\n\n" + text,
                sentiment_complottista: "Rewrite the following text in a conspiratorial and skeptical tone, expressing doubt about the official version. Return ONLY the rewritten text:\n\n" + text,
                sentiment_difensivo: "Rewrite the following text in a defensive and justificatory tone. Return ONLY the rewritten text:\n\n" + text,
                sentiment_retorico: "Rewrite the following text in an intensely rhetorical, solemn, dramatic, and theatrical style. Return ONLY the rewritten text:\n\n" + text,

                demauro: "Rewrite the following text according to the technical guidelines of CAN-ASC-3.1:2025: use active voice and imperative forms where appropriate, avoid nominalizations, keep a direct subject-verb-object structure, and restrict sentences to 7-12 words. Return ONLY the rewritten text:\n\n" + text,
                protocollo2: "Rewrite the following text in Plain Language of medium readability. Use sentences under 20 words, simple subordinates, and moderate passive voice. Return ONLY the rewritten text:\n\n" + text,
                protocollo3: "Rewrite the following text in complex academic English. Use sophisticated vocabulary, passive voice, and complex subordinate clauses. Return ONLY the rewritten text:\n\n" + text,

                summarize: "Summarize the following text, highlighting the key points:\n\n" + text,
                expand_bullets: "Expand the following text into a detailed bulleted list:\n\n" + text,
                speaker_notes: "Write speaker notes based on the following text, using a conversational and natural tone:\n\n" + text,
                synthesis: "Synthesize the following two texts into a single, well-structured, and clear text. Text A:\n" + textA + "\n\nText B (Selection):\n" + text + "\n\nSynthesis:",
                image_prompt: "Analyze the following text and describe an image to illustrate the concept. Return ONLY the detailed prompt starting with 'PROMPT:'\n\nText:\n" + text,
                slide_single: "Analyze the following text and create a single summary slide. Return ONLY a valid JSON object (no markdown, no backticks) with keys: 'title', 'points' (array of strings), 'notes', 'image_prompt'.\n\nText:\n" + text,
                facilitator_explain: "Explain the following concept in extremely simple terms, using everyday analogies, avoiding jargon, and maintaining a reassuring tone:\n\n" + text,
                facilitator_guide: "Create a clear step-by-step numbered guide based on the following text. Do not take anything for granted:\n\n" + text
            }
        };

        return prompts[currentLang][actionType] || prompts["en"][actionType] || text;
    }

    function callOllama(url, model, prompt, stream, callback) {
        var payload = {
            model: model,
            prompt: prompt,
            stream: false
        };

        fetch(url + "/api/generate", {
            method: "POST",
            headers: buildRequestHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) throw new Error("HTTP Status " + response.status);
                return response.json();
            })
            .then(data => {
                if (data.response) {
                    callback(data.response);
                } else {
                    callback(null);
                }
            })
            .catch(err => {
                console.error(err);
                window.setStatus("Ollama Error", false);
                callback(null);
            });
    }

})(window, undefined);
