# Nightglass Browser — Windows ZIP Project

A free, privacy-minded browser starter for Windows. It uses Electron (Chromium) to display real websites in separate tabs.

## What is included

- Dark, minimal browser interface
- Tabs, address/search bar, back/forward, reload, home
- DuckDuckGo search by default
- Temporary, in-memory browser session (no persistent profile partition)
- Small built-in tracker-domain blocklist
- Camera, microphone, location and notification permissions denied by default
- Clear-session control for cookies, site storage and cache
- Basic Electron security settings: sandbox, context isolation, no Node integration in web content

## Requirements

- Windows 10 or 11, 64-bit
- Node.js LTS (includes npm): https://nodejs.org/
- Internet connection to install the development dependencies

## Run it (beginner-friendly)

1. Extract the entire ZIP into a folder, for example `C:\\NightglassBrowser`.
2. Install Node.js LTS from https://nodejs.org/ if you do not already have it. During setup, keep the default options.
3. Open the extracted `NightglassBrowser` folder in File Explorer.
4. Click the folder address bar, type `cmd`, and press Enter. A Command Prompt opens in that folder.
5. Run this command and wait for it to finish:

   ```bat
   npm install
   ```

6. Start the browser:

   ```bat
   npm start
   ```

7. A Nightglass Browser window should open. Enter a website or a search phrase in the top address bar.

### Optional: build a portable Windows executable

After `npm install` completes, run:

```bat
npm run dist:win
```

The output will be placed in the `dist` folder. The first build can take several minutes and requires downloading Electron build tools. Windows SmartScreen may show a warning because this personal build is unsigned. Only run software you built or trust.

## Important privacy limitations

Nightglass is a starter project, not a fully audited security product.

- **Not anonymity:** it does not hide your IP address. Websites and your ISP/network operator can still see connections and, depending on DNS/TLS details, destinations.
- **Not Tor or a VPN:** traffic is not routed through Tor or a VPN.
- **Tracker filtering is basic:** it blocks a short hard-coded list of common tracking/ad hosts. It will miss many trackers and can occasionally break site features.
- **Temporary profile:** the browser session is configured without a persistent profile partition, so cookies/site storage/cache are intended to be memory-only and disappear when the app fully exits. This is not a forensic guarantee; downloads, screenshots, Windows logs, DNS caches, swap/pagefile, crash reports, and files saved by websites may persist.
- **Downloads:** downloaded files are saved to disk and are not automatically erased.
- **Browser fingerprinting:** sites may still identify a browser through device/browser characteristics.
- **Extensions:** extension management is not included in this starter.
- **Websites still matter:** HTTPS protects data in transit to the site, but does not make a malicious site safe. Keep Windows updated and avoid unknown downloads.
- **Not independently audited:** do not rely on this build for high-risk threat models, evading lawful monitoring, or handling highly sensitive information.

## Keyboard shortcuts

- `Ctrl + L`: focus address bar
- `Ctrl + T`: new tab
- `Ctrl + W`: close current tab

## Troubleshooting

- If `npm` is not recognized, close and reopen Command Prompt after installing Node.js. If it still fails, restart Windows.
- If `npm install` fails, check internet access and try again.
- Some websites may refuse to load inside desktop browser wrappers. This project does not include every feature of a mature browser.
- If a website breaks, try the Clear session button or use the website in a mainstream browser.

## License

This project is provided as-is for personal use. Electron and its dependencies have their own licenses.


## Quick-start batch files

- Double-click `RUN_ME_FIRST.bat` for first-time setup and launch. It checks for Node.js, opens the official download page if needed, installs dependencies, and starts the browser.
- After setup, double-click `START_BROWSER.bat` to launch it again.

These are Windows command scripts, not a standalone `.exe`. A standalone portable `.exe` must be built on a Windows machine with Node.js and the required packages installed using `npm run dist:win`.


## Important: this ZIP is not yet a ready-to-run EXE

The current ZIP contains source code and requires Node.js to run/build. If you want a normal Windows `.exe` without installing Node.js, the app must first be packaged on a Windows build environment. Do not install Node.js just to use the browser if that is not what you want.


## Build a Windows EXE without installing Node.js locally

See `BUILD-EXE-WITH-GITHUB.md` for a hosted GitHub Actions build route. It builds the portable `.exe` on a Windows runner and uploads it as a downloadable artifact. This requires a GitHub account and uploading this project to a repository; this chat environment could not download npm dependencies to compile the executable directly.
