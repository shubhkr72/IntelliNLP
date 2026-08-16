# Project Workflow

This document describes the runtime workflow for the IntelliNLP sentiment analysis Flask project.

## High-level application flow

```mermaid
flowchart TD
    A[User opens app] --> B[Flask GET /]
    B --> C[Render templates/index.html]
    C --> D[Load static assets]
    D --> D1[static/css/styles.css]
    D --> D2[static/index.js]
    D --> D3[Bootstrap, Font Awesome, Chart.js]

    C --> E[User enters text or uploads .txt/.csv]
    E --> F[Frontend validates input]
    F --> F1[Minimum 4 words]
    F --> F2[Maximum 300 words]
    F --> F3[Text input and file upload are mutually exclusive]

    F --> G[User selects model]
    G --> G1[DistilBERT]
    G --> G2[RoBERTa]
    G --> G3[Emotion model]

    G --> H[Submit POST /analyze]
    H --> I[Flask analyze route]
    I --> J{File uploaded?}
    J -->|Yes| K[read_file reads .txt or .csv]
    J -->|No| L[Use textarea input]
    K --> M[Validate server-side word count]
    L --> M
    M -->|Invalid| N[Render index.html with error]
    M -->|Valid| O[Run NLP preprocessing]
    O --> P[Run model inference]
    P --> Q[Generate word-level distribution]
    Q --> R[Generate static/wordcloud.png]
    R --> S[Store latest result in memory for download]
    S --> T[Render results in index.html]
    T --> U[Charts, word cloud, NER, POS, and download controls]
```

## NLP analysis pipeline

```mermaid
flowchart LR
    A[Raw text] --> B[Clean whitespace]
    B --> C[spaCy document]
    C --> D[Remove stop words, punctuation, URLs, emails]
    D --> E[Cleaned text]
    D --> F[Removed text]
    E --> G[Normalize to lowercase]
    G --> H[NLTK word tokenization]
    H --> I[spaCy POS tagging]
    H --> J[Porter stemming]
    I --> K[Lemmatization]
    C --> L[Named entity recognition]
    K --> M[Join lemmatized tokens]
    M --> N[Transformer sentiment pipeline]
    N --> O[Overall label and confidence]
    K --> P[Per-word model calls]
    P --> Q[Positive, neutral, negative, or emotion word groups]
```

## Backend route flow

```mermaid
flowchart TD
    A[app.py starts] --> B[Configure NLTK data directory]
    B --> C[Download or reuse NLTK packages]
    C --> D[Create Flask app]
    D --> G[Load sentiment_model.py]
    G --> H[Load spaCy en_core_web_md]
    H --> I[Preload Hugging Face pipelines]

    D --> J[GET /]
    J --> K[Render empty home page]

    D --> L[POST /analyze]
    L --> M[Read text or uploaded file]
    M --> N[Validate 4 to 300 words]
    N --> O[preprocess_text]
    O --> P[analyze_sentiment]
    P --> Q[Build result data]
    Q --> R[Generate word cloud image]
    R --> S[Render results page]

    D --> T[GET /download]
    T --> U{analysis_result exists?}
    U -->|No| V[Return 400]
    U -->|Yes| W[Build TXT report]
    W --> X[Return sentiment_analysis_result.txt]
```

## Frontend interaction flow

```mermaid
flowchart TD
    A[index.html loads] --> B[index.js initializes]
    B --> C[Hide remove file button]
    B --> D[Sync SSR input state]
    D --> E{Text exists?}
    E -->|Yes| F[Disable file input]
    E -->|No| G[Enable file input]

    H[User types text] --> I[Count words]
    I --> J{Word count valid?}
    J -->|Less than 4| K[Show minimum word warning]
    J -->|More than 300| L[Show limit warning]
    J -->|4 to 300| M[Enable analyze button]

    N[User selects file] --> O[Disable textarea]
    O --> P[Show uploaded file name]
    P --> Q[Enable analyze button]

    R[Remove file] --> S[Clear file input]
    S --> T[Re-enable textarea]
    T --> U[Recalculate analyze button state]

    V[Results page loads] --> W[Read JSON script data]
    W --> X[Render sentiment doughnut chart]
    W --> Y[Render emotion bar chart when available]
    W --> Z[Enable copy, download, expand, fullscreen helpers]
```

## Main files and responsibilities

| File | Responsibility |
| --- | --- |
| `app.py` | Flask routes, validation, word cloud generation, download response |
| `sentiment_model.py` | spaCy and Transformer model loading, preprocessing, file reading, sentiment inference |
| `templates/index.html` | Main page markup, Jinja rendering, results layout, embedded JSON for charts |
| `static/index.js` | Form interactions, validation state, charts, copy/download/expand helpers |
| `static/css/styles.css` | Application styling |
| `static/wordcloud.png` | Generated word cloud output |

## Notes

- The `/analyze` route stores the latest analysis in the global `analysis_result` variable for download during the current app session.
- The `/download` route returns the most recent analysis result as `sentiment_analysis_result.txt`.
- `static/wordcloud.png` is overwritten each time a new valid analysis runs.
