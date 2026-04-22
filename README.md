# swagger-blueprint

> Fork ของ [swagger-api/swagger-ui](https://github.com/swagger-api/swagger-ui) v5.32.4  
> ออกแบบใหม่ด้วย Dark-first design + รองรับ **Mermaid Diagrams** และ **Full Markdown** ใน description fields

---

## ✨ Features

| Feature | รายละเอียด |
|---------|-----------|
| 🎨 **UI Redesign** | Dark-first, Violet accent (`#6366f1`), Glass topbar, Blueprint Inset frames |
| 📊 **Mermaid Diagrams** | ใส่ ` ```mermaid ``` ` ใน description → render เป็น SVG ทันที |
| 📝 **Full Markdown** | GFM Tables, Task Lists, Strikethrough, Code Highlighting, Blockquotes |
| 🖼️ **Images** | รองรับรูปภาพใน Markdown `![alt](url)` |
| 🔗 **Auto Links** | ทุก link เปิดใน new tab พร้อม `noopener noreferrer` |
| ⚡ **Lazy Mermaid** | mermaid.js (~2.5MB) โหลดเฉพาะเมื่อมี diagram ในหน้า |
| 🛡️ **XSS Safe** | DOMPurify + strict securityLevel |

---

## 📊 Mermaid Diagram Types ที่รองรับ

| # | ประเภท | Directive | ใช้สำหรับ |
|---|--------|-----------|----------|
| 1 | Flowchart TD | `flowchart TD` | Process flow แนวตั้ง |
| 2 | Flowchart LR | `flowchart LR` | Process flow แนวนอน |
| 3 | Flowchart RL | `flowchart RL` | Flow จากขวาไปซ้าย |
| 4 | Flowchart BT | `flowchart BT` | Flow จากล่างขึ้นบน |
| 5 | Sequence | `sequenceDiagram` | API interactions, message flow |
| 6 | Class | `classDiagram` | OOP, data models |
| 7 | State | `stateDiagram-v2` | State machines, order status |
| 8 | ER | `erDiagram` | Database schema |
| 9 | Gantt | `gantt` | Project timeline |
| 10 | Pie | `pie` | Traffic distribution |
| 11 | Git Graph | `gitGraph` | Branch history |
| 12 | User Journey | `journey` | User experience maps |
| 13 | Mindmap | `mindmap` | Concept maps |
| 14 | Timeline | `timeline` | Development history |
| 15 | Quadrant | `quadrantChart` | Priority matrix |
| 16 | XY Chart | `xychart-beta` | Metrics over time |

---

## 🚀 Quick Start

### ติดตั้งและรัน Dev Server

```bash
# 1. Clone
git clone https://github.com/<your-username>/swagger-blueprint.git
cd swagger-blueprint

# 2. ติดตั้ง dependencies
npm install

# 3. รัน dev server (hot reload)
npm run dev
# → http://localhost:3200/
```

### Build สำหรับ Production

```bash
npm run build
# Output อยู่ใน dist/
```

---

## 📦 วิธีนำไปใช้ในโปรเจคอื่น

### Option 1 — Static HTML (เร็วที่สุด)

คัดลอกไฟล์จาก `dist/` แล้วสร้าง `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My API Docs</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="./dist/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="./dist/swagger-ui-bundle.js"></script>
  <script src="./dist/swagger-ui-standalone-preset.js"></script>
  <script>
    SwaggerUIBundle({
      url: "./openapi.yaml",   // ← ชี้ไปที่ spec ของคุณ
      dom_id: "#swagger-ui",
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset,
      ],
      layout: "StandaloneLayout",
    })
  </script>
</body>
</html>
```

### Option 2 — npm Package

```bash
npm install swagger-ui-dist
```

```javascript
import SwaggerUI from "swagger-ui-dist"
import "swagger-ui-dist/swagger-ui.css"

SwaggerUI({
  url: "/api/openapi.yaml",
  dom_id: "#swagger-ui",
})
```

### Option 3 — React Component

```bash
npm install swagger-ui-react
```

```jsx
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiDocs() {
  return <SwaggerUI url="/api/openapi.yaml" />
}
```

### Option 4 — Docker

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY your-openapi.yaml /usr/share/nginx/html/openapi.yaml
```

```bash
docker build -t my-api-docs .
docker run -p 8080:80 my-api-docs
# → http://localhost:8080/
```

---

## 📝 วิธีใช้ Mermaid ใน OpenAPI Spec

ใส่ code block ` ```mermaid ``` ` ใน `description` field ของ OpenAPI ได้เลย:

````yaml
openapi: 3.0.0
info:
  title: My API
  description: |
    # System Architecture

    ```mermaid
    flowchart TD
      Client --> API[REST API]
      API --> DB[(Database)]
      API --> Cache[(Redis)]
    ```

    ## Request Flow

    ```mermaid
    sequenceDiagram
      Client->>API: POST /login
      API->>DB: SELECT user
      DB-->>API: user data
      API-->>Client: JWT token
    ```

    ## ใส่รูปภาพ

    ![Architecture](https://example.com/arch.png)

paths:
  /users:
    get:
      description: |
        Returns all users.

        ```mermaid
        erDiagram
          USER {
            int id PK
            string email
            string name
          }
        ```
````

> ดูตัวอย่างครบทุก diagram type ได้ที่ `dev-helpers/mermaid-test.yaml`

---

## 🗂️ โครงสร้างที่เพิ่ม/แก้ไข

```
src/
├── core/
│   ├── components/
│   │   ├── MermaidBlock.jsx          ← Mermaid renderer (lazy-loaded)
│   │   └── providers/
│   │       └── markdown.jsx          ← Base Markdown (react-markdown + GFM)
│   └── plugins/
│       └── oas3/wrap-components/
│           └── markdown.jsx          ← OAS3 Markdown wrapper
└── style/
    ├── _tokens.scss                  ← Design tokens (CSS custom properties)
    ├── _mermaid.scss                 ← Blueprint Inset frame styles
    ├── _topbar.scss                  ← Glass navigation bar
    └── main.scss                     ← Main entry (loads all partials)

dev-helpers/
└── mermaid-test.yaml                 ← ตัวอย่างทุก diagram type
```

---

## ⚙️ Configuration Options

```javascript
SwaggerUIBundle({
  url: "./openapi.yaml",       // URL ของ spec file
  dom_id: "#swagger-ui",       // container element ID
  deepLinking: true,           // URL reflects active operation
  defaultModelsExpandDepth: 1, // ขยาย model schema กี่ชั้น
  docExpansion: "list",        // none | list | full
  filter: true,                // เปิด search bar
  useUnsafeMarkdown: false,    // อนุญาต raw HTML ใน description
  tryItOutEnabled: true,       // เปิด Try it out ทันที
})
```

---

## 🛠️ Commands

```bash
npm run dev           # Dev server → http://localhost:3200
npm run build         # Production build → dist/
npm run test:unit     # Unit tests (Jest)
npm run cy:dev        # E2E tests (Cypress interactive)
npm run lint          # ESLint + Stylelint
npm run lint-fix      # Auto-fix lint issues
```

---

## 📋 Requirements

- **Node.js** >= 24.14.0
- **npm** >= 11.9.0

---

## 📄 License

Apache 2.0 — based on [swagger-api/swagger-ui](https://github.com/swagger-api/swagger-ui)
