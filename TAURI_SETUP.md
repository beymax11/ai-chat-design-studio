# Tauri Setup Guide

Ang application mo ay naka-setup na para sa both **web deployment** at **desktop app** gamit ang Tauri!

## Prerequisites

Bago mo magamit ang Tauri, kailangan mo i-install ang **Rust**:

### Option 1: Download Installer (Recommended for Windows)
1. Visit: https://www.rust-lang.org/tools/install
2. Download at run ang `rustup-init.exe`
3. Follow ang installation wizard
4. I-restart ang terminal after installation

### Option 2: PowerShell Command (Windows)
```powershell
Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
.\rustup-init.exe
```

### Option 3: Using winget (Windows Package Manager)
```powershell
winget install Rustlang.Rustup
```

After installation, i-restart ang terminal/command prompt.

## Available Commands

### Web Development (existing)
```bash
npm run dev          # Start web dev server
npm run build        # Build para sa web (Netlify)
npm run preview      # Preview web build
```

### Desktop App Development (Tauri)
```bash
npm run tauri:dev    # Start Tauri dev mode (opens desktop app)
npm run tauri:build  # Build desktop app installer
```

## Development Workflow

### Para sa Web:
1. Run `npm run dev` - mag-o-open sa browser
2. Deploy sa Netlify gamit ang existing `netlify.toml`

### Para sa Desktop App:
1. Run `npm run tauri:dev` - mag-o-open ang desktop app window
2. Auto-reload kapag may changes sa code
3. Build installer: `npm run tauri:build`

## Build Outputs

- **Web**: `dist/` folder (para sa Netlify)
- **Desktop**: `src-tauri/target/release/` (installer files)

## App Icons

✅ **Icons are already set up!** All required icon sizes have been generated.

Para mag-update ng app icon in the future:

1. Mag-prepare ng 1024x1024 square PNG image
2. Run: `npm run tauri icon <path-to-your-icon.png>`
3. Auto-generate ang lahat ng required icon sizes
4. Icons are saved sa `src-tauri/icons/` directory

## Configuration Files

- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/src/main.rs` - Rust backend code
- `vite.config.ts` - Updated para sa Tauri support

## Notes

- Parehong codebase ang ginagamit para sa web at desktop
- Parehong features at UI
- Parehong build process, iba lang ang output
- Tauri uses system webview (mas maliit ang bundle size kaysa Electron)

## Troubleshooting

### Rust not found
- **Windows PowerShell**: Use `Invoke-WebRequest` or download installer from https://www.rust-lang.org/tools/install
- **Windows (winget)**: `winget install Rustlang.Rustup`
- I-restart ang terminal after installation
- Verify: `rustc --version` (dapat may output)

### Build errors
- Check kung naka-install ang Rust toolchain
- Run `rustc --version` para i-verify

### Port already in use
- I-check ang `vite.config.ts` - port 8080 ang default
- Pwede mo i-change kung may conflict

