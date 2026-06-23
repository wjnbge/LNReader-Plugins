---
name: lnreader-plugin-dev
description: >-
  Guide for developing, modifying, and debugging LNReader (v3.x) plugins. Covers ES5 syntax constraints, Cheerio parsing, async networking, local server setup, and plugins.min.json configuration.
---

# LNReader Plugin Development Guide

## Overview
This skill provides instructions for building and debugging plugins for LNReader v3.x. LNReader plugins are written in JavaScript and executed inside a React Native JavaScriptCore (JSC) environment. They do not run in a browser or a Node.js environment, which imposes strict syntax and API limitations.

## Core Development Rules

### 1. Strict ES5 Syntax
Because the code runs in JSC, modern ES6+ features will cause the plugin to fail silently or crash the app.
*   **DO NOT use** `let` or `const`. Always use `var`.
*   **DO NOT use** arrow functions `() => {}`. Always use `function() {}`.
*   **DO NOT use** `async` / `await`. Use `.then()` and `.catch()` for Promises.
*   **DO NOT use** the `class` keyword. Use constructor functions and prototypes.
*   **DO NOT use** template literals (backticks). Use string concatenation `+`.

### 2. Required Plugin Structure
Every plugin must export a class instance using `module.exports` and have specific lifecycle methods:

```javascript
var fetchAPI = require('fetchAPI');
var cheerio = require('cheerio');

function MyPlugin() {
    this.id = 'my_plugin_id';
    this.name = 'My Plugin';
    this.site = 'https://www.example.com';
    this.version = '1.0.0';
    this.fetchOptions = { headers: { 'User-Agent': 'Mozilla/5.0' } };
}

MyPlugin.prototype.popularNovels = function(pageNo, options) { /* Return Promise of novels */ };
MyPlugin.prototype.parseNovel = function(novelPath) { /* Return Promise of novel details */ };
MyPlugin.prototype.parseChapter = function(novelPath, chapterPath) { /* Return Promise of chapter text */ };
MyPlugin.prototype.searchNovels = function(searchTerm, pageNo) { /* Return Promise of search results */ };

module.exports = new MyPlugin();
```

### 3. Parsing HTML
LNReader exposes `cheerio` for parsing. 
*   Use `var $ = cheerio.load(body);` to parse the HTML string.
*   Select elements using standard jQuery-like selectors (`$.find()`, `$.attr()`, `$.text()`).
*   Be careful with empty fields. Use `.trim()` and fallback operators (`||`).
*   Images should be converted to absolute URLs.

### 4. Network Requests
Use the built-in `fetchAPI.fetchText(url, options)` which returns a Promise resolving to a text string (the HTML). Do not use the native `fetch` directly for HTML parsing if possible.

## Best Practices & Common Pitfalls

### Performance Optimization for Lists
Some websites do not include book covers (`<img>` tags) in their category or ranking list pages.
*   **Avoid** doing `Promise.all` over 50 items to fetch each novel's detail page just for the cover. This causes extreme lag and can get the user IP-banned.
*   **Solution**: Return empty cover strings (`cover: ''`) for list pages.

### Homepage Curation
If users expect to see a visually pleasing Homepage with covers:
*   Configure the plugin's `filters` to include a "Homepage" (首页) rank option.
*   Route that specific filter to fetch the actual website index page (`/`), which typically contains `img` tags.
*   Note that homepages usually do not support pagination, so return `[]` if `pageNo > 1`.

### Local Testing and Deployment
To test plugins on a physical device:
1.  Run a local Python HTTP server in the plugin directory: `python -m http.server 8000`.
2.  In `plugins.min.json`, ensure the `url` uses the absolute LAN IP address (e.g., `http://192.168.31.125:8000/MyPlugin.js`).
3.  **NEVER** use `localhost` or `127.0.0.1` in `plugins.min.json` because the phone cannot resolve it to your PC.
4.  Ensure `plugins.min.json` strictly adheres to JSON format (no trailing commas).
5.  In the LNReader app, refresh the repository to pull the latest JSON, then update/install the plugin.

## Workflow

### 1. Analyze the Target Website
*   Use Python (e.g., `urllib.request` and `re`) to quickly test URL structure, pagination, and fetch HTML locally. Note that `bs4` might not be installed, so use regex for quick checks if needed.
*   Verify if list pages actually contain image URLs.

### 2. Implement and Refactor
*   Maintain ES5 compliance.
*   Route `options.showLatestNovels` or default filters sensibly.

### 3. Version Bump
*   Whenever you modify the `.js` file, you **must** update the version in both the JS file and `plugins.min.json`, otherwise the LNReader app will not detect an update.

### 4. Test
*   Update the plugin in the LNReader app on the phone. Check lists, search, and reading functionality.
