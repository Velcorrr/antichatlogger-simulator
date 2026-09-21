# AntiChatLogger Simulator

A playable first-person browser game about Steven, a late night in his room, and the group chat. Built with Three.js, plain JavaScript and Vite.

## Run locally

Use Node.js 22.12 or newer, then run these commands in this folder:

```sh
npm install
npm run dev
```

Open the local URL Vite prints. Use a desktop browser with WebGL, a keyboard and a mouse. Click **New game** to begin, then click the room if the browser asks you to capture the mouse. Sound starts after interaction; available spoken voices depend on your browser and operating system.

```sh
npm test          # simulation and persistent social-state tests
npm run build    # produce a static website in dist/
npm run preview  # serve the production build locally
```

Serve the game over HTTP or HTTPS; opening `index.html` directly from disk does not run the module build. The production build uses relative asset paths so it can run in a GitHub Pages project subdirectory. Publish the contents of `dist/`, not the unbuilt source folder.

## How to play

Walk to the desk and interact with a screen or the chair to use the computer. Open apps from desktop icons or the taskbar. Use **Leave desk** to return to the room. Order dinner, explore the saved internet, put on a track, check the GC, or launch an Operator match.

| Control | Room / desktop | Operator |
| --- | --- | --- |
| WASD + mouse | Move and look | Move and aim |
| E | Interact; get out of bed | Hold near terminal A to extract data |
| F | Pick up or drop a small object | — |
| Left click | Use the held object; click desktop apps | Fire |
| Right click | — | Aim down sights |
| Shift | Sprint | Sprint |
| C / left Ctrl | Crouch | Crouch |
| Tab | Open / close phone in the room or bed | Hold for scoreboard |
| R | — | Reload |
| Enter | Send a composed chat message | Open match chat; send message |
| F2 / Alt + Q | Return to a running Operator match | Switch to Discord |
| Space | — | Cycle living teammates while spectating |
| Escape | Release captured mouse / pause; close phone | Release mouse / return to desktop |

The browser reserves Alt-Tab for real applications. Use F2 to switch in-game apps. Click the match to capture the mouse again. An Operator round continues while you are on the in-game desktop.

## Included in this build

- A 3D bedroom with lighting, blinds, rain, a fan, movable small objects, bed, phone, food delivery, hygiene and cleaning interactions.
- A day/night clock, needs, money, hardware purchases, fictional paid tasks, and local saves.
- A windowed desktop with Discord-style GC and DMs, friend profiles, delayed replies, unread messages, a simulated group call and Liltism's animated webcam scene. Velcorr communicates through text only.
- CloudTracks with synthesized music, likes, playlists and comments; a fictional browser, video scenes, files, settings and task manager.
- Operator: an Office map, local bot teams, weapons, ammunition, reloads, health and armor, an extraction objective, rounds, spectator mode, scoreboard and saved match statistics.

This is a local simulation. Characters, calls, webcam, websites, videos, stores, purchases and game opponents are simulated; there is no live Discord connection, real shopping, matchmaking or multiplayer server. Music and effects are synthesized with Web Audio. Dialogue uses browser speech synthesis when available. No microphone or webcam capture is required.

## Saves

Progress is autosaved in this browser's local storage, including room state, purchases and conversations. Use **Escape → Export save**, or the desktop Settings app, to download a JSON backup. Import it to restore progress in another browser. Saves on a local development URL and saves on a published GitHub Pages URL are separate; clearing browser storage removes that URL's local save.

The Node tests check simulation and social-state behavior without WebGL or browser UI. They do not replace a playtest of rendering, pointer capture or audio.
