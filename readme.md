# 🚀 aimg.js

Official AIMG API client for Node.js. Allows you to generate dynamic images (PNG/GIF) using HTML templates. ✨

## 📦 Installation

```bash
npm install aimg.js
# or
pnpm install aimg.js
# or
yarn add aimg.js
```

## 🛠️ Usage

First, import the client and initialize it with your API key:

```javascript
// filepath: example.js
const { AIMGClient } = require("aimg.js");
// or with ES Modules:
// import { AIMGClient } from "aimg.js";

const client = new AIMGClient({
  apiKey: "YOUR_API_KEY", // Enter your API Key here
  templatesPath: "./templates" // (Optional) Path to your templates folder, default: process.cwd()/templates
});
```

### 🖼️ Rendering a Template (`renderTemplate`)

Renders an image using the specified template name. It reads the files (`template.aimg.html`, `session.aimg.json`, `data.aimg.json`, `animation.aimg.json`) from the template folder and sends them to the AIMG API.

You can see example templates in the [templates](https://github.com/TheArmagan/aimg-client/tree/main/templates) folder.

```javascript
// filepath: exampleRenderTemplate.js
const { AIMGClient } = require("aimg.js");
const fs = require("fs");

const client = new AIMGClient({ apiKey: "YOUR_API_KEY" });

async function renderMyTemplate() {
  try {
    // Render the 'level' template with default data.aimg.json
    const result = await client.renderTemplate("level");

    // Or render with custom data
    const customData = {
      user: {
        name: "Custom User",
        displayName: "Custom User | 99",
        avatarUrl: "https://example.com/avatar.png",
        avatarColor: "#ff0000"
      },
      levels: [ /* ... level data ... */ ]
    };
    const resultWithData = await client.renderTemplate("level", customData);

    console.log("Render successful!", result.filename);
    // Example: Save the image to a file
    fs.writeFileSync(result.filename, result.buffer);
    console.log(`Image saved as ${result.filename}.`);

  } catch (error) {
    console.error("Render error:", error);
  }
}

renderMyTemplate();
```

### ⚙️ Rendering Custom HTML (`render`)

Renders an image by directly providing HTML content, configuration, and session settings.

```javascript
// filepath: exampleRenderCustom.js
const { AIMGClient } = require("aimg.js");
const fs = require("fs");

const client = new AIMGClient({ apiKey: "YOUR_API_KEY" });

async function renderCustomHtml() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Custom</title></head>
    <body><h1>Hello, <%= it.name %>!</h1></body>
    </html>
  `;

  const config = {
    data: { name: "World" },
    // Animation settings if needed
    // animation: { ... }
  };

  const sessionConfig = {
    type: "NoScriptStatic", // or "NoScriptAnimated"
    // Profiles if needed
    profiles: []
    // profiles: [{ name: "TailwindCSS" }]
  };

  try {
    const result = await client.render(htmlContent, config, sessionConfig);
    console.log("Custom render successful!", result.filename);
    // Example: Save the image to a file
    fs.writeFileSync(result.filename, result.buffer);
    console.log(`Image saved as ${result.filename}.`);
  } catch (error) {
    console.error("Custom render error:", error);
  }
}

renderCustomHtml();
```

## 📂 Template Structure

Each subfolder within the `templatesPath` represents a template:

*   `template.aimg.html`: The HTML structure of the image. Supports data injection using EJS-like `<%= ... %>` syntax (via the `it` variable).
*   `session.aimg.json`: Render session settings ([`RestSessionInstance`](src/classes/Rest/Sessions.ts)). Specifies the `type` (`NoScriptStatic` or `NoScriptAnimated`) and the `profiles` to use (e.g., `TailwindCSS`, `Unovis`, `GSAP`).
*   `data.aimg.json` (Optional): Default data to be used in the template. This file is used if the `data` parameter is not provided in the `renderTemplate` call.
*   `animation.aimg.json` (Optional): Contains animation definitions if `type` is set to `NoScriptAnimated` in `session.aimg.json`.

Check the [templates](templates) folder for example templates.

## 📚 API Reference

### `new AIMGClient(options)`

Creates a new client instance.

*   `options`: [`AIMGClientOptions`](src/classes/AIMGClient.ts)
    *   `apiKey` (string, **required**): Your AIMG API key.
    *   `rest?`: [`RestOptions`](src/classes/Rest/index.ts) (Optional) Additional settings for the REST client (e.g., `baseUrl`, `timeout`, `headers`).
    *   `templatesPath?`: (string, Optional) Path to the folder containing templates. Default: `path.join(process.cwd(), "templates")`.

### `async renderTemplate(name, data?)`

Renders a template.

*   `name` (string): The name of the template folder within `templatesPath`.
*   `data?` (Record<string, any>, Optional): Custom data to send to the template. If not specified, the template's `data.aimg.json` file is used.
*   **Returns:** `Promise<{ buffer: Buffer, filename: string, content_type: "image/png" | "image/gif", statistics: any }>`

### `async render(html, config, sessionConfig)`

Renders custom HTML content.

*   `html` (string): The HTML content to render.
*   `config`: [`RestRenderSessionOptions['config']`](src/classes/Rest/Sessions.ts)
    *   `data` (Record<string, any>): Data to inject into the HTML.
    *   `animation?`: Animation settings (if `sessionConfig.type` is animated).
*   `sessionConfig`: [`RestSessionInstance`](src/classes/Rest/Sessions.ts) Specifies the session type and profiles.
*   **Returns:** `Promise<{ buffer: Buffer, filename: string, content_type: "image/png" | "image/gif", statistics: any }>`

## 💻 Development

To build the project:

```bash
npm run build
```

This command compiles the TypeScript source code from [src](src) into JavaScript in the `dist` folder.

## 📜 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).