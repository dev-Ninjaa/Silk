# Pulm Notes

A local-first, offline-capable personal note-taking app.

Available as both a **web app** and a **native desktop app** (via Tauri).

## Prerequisites

- Node.js 18+ (or bun 1.0+)
- bun package manager
- **For desktop app:** Rust toolchain (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

## Installation & Setup

1. Install dependencies using bun:
   ```bash
   bun install
   ```

2. **Web App:** Start the development server:
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

3. **Desktop App:** Run the Tauri development build:
   ```bash
   bun run tauri:dev
   ```

## Build for Production

**Web App:**
```bash
bun run build
bun start
```

**Desktop App:**
```bash
bun run tauri:build
```
Installers will be created in `src-tauri/target/release/bundle/`

## Technology

- **Framework**: Next.js 15 (App Router)
- **Desktop Shell**: Tauri 2.0 (Rust)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Package Manager**: bun

## Features

- **Local-first**: All data stays on your device
- **Offline-capable**: Works without internet
- **Private**: No cloud, no tracking, no accounts
- Minimalist text editor interface
- Slash command menu (type `/` to open)
- Support for multiple block types (headings, lists, code, quotes, etc.)
- Keyboard shortcuts for navigation and editing
- Clean, responsive design
- **Desktop app**: Native performance with Tauri

## Migration Notes

- **Next.js Migration**: See `docs/NEXT_MIGRATION_LOG.md`
- **Tauri Integration**: See `TAURI_AUDIT_LOG.md` for desktop architecture details
