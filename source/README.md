# AntiChatLogger Simulator

A playable first-person browser game about Steven, a late night in his room, and the group chat. Built with Three.js, plain JavaScript and Vite.

## Run locally

Use Node.js 22.12 or newer, then run these commands in this folder:

```sh
npm install
npm run dev
```

Open the local URL Vite prints in a browser with WebGL. The game supports a desktop keyboard and mouse or mobile touch controls. Tap or click **New game** to begin; on desktop, click the room if the browser asks you to capture the mouse. Sound starts after interaction; available spoken voices depend on your browser and operating system.

```sh
npm test          # simulation, dialogue, AI, challenge and input tests
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

### Touch controls

Touch controls appear automatically on phones and tablets. Drag the left joystick to move; drag across the open right side of the view to look around. Use both at once to walk and look. Tap **Run** or **Crouch** to toggle those movement modes.

| Touch button | Action |
| --- | --- |
| Interact / Pick / drop / Use | Interact with the room, pick up or drop an object, or use the held object |
| Phone / Pause | Open the phone or pause menu |
| Fire | Hold to shoot in Operator; drag the held button to keep looking while firing |
| Aim / Reload | Hold to aim down sights; tap to reload |
| Extract | Hold while near terminal A to extract data |
| Scores / Chat / Spectate | Toggle the scoreboard, open match chat, or cycle living teammates after dying |
| Discord | Switch from Operator to the in-game desktop |

Use the desktop's on-screen match button to return to the running Operator match. Desktop apps and the phone work by tapping their buttons and fields; tapping a message field opens the device keyboard. The interface adapts to portrait and landscape, including scrollable app panels and chat. Landscape gives the most room for the 3D view and touch controls. Keyboard, mouse and pointer capture remain available for desktop play. In **Settings → Touch controls**, choose **Auto**, **On** or **Off** to override automatic detection.

## Included in this build

- Hangouts: Liltism's braking challenge, Bitsproxy's routing maze, and Fear's tablet logic puzzle. Open **Things to do** from the room, phone, pause menu or Discord, or launch Hangouts from the desktop. First wins earn $8–$12 in game money; clearing all three earns an extra $15. Replays earn $1.50 at most once per challenge every 20 game minutes. Records and progress are saved, and timers pause when switching apps or pausing.
- Optional AI conversations with distinct character personalities, recent conversation context, and reactions to challenge progress. Scripted replies remain available without an account or connection.

- A 3D bedroom with lighting, blinds, rain, a fan, movable small objects, bed, phone, food delivery, hygiene and cleaning interactions.
- A day/night clock, needs, money, hardware purchases, fictional paid tasks, and local saves.
- A windowed desktop with Discord-style GC and DMs, friend profiles, delayed replies, unread messages, a simulated group call and Liltism's animated webcam scene. Velcorr communicates through text only.
- CloudTracks with synthesized music, likes, playlists and comments; a fictional browser, video scenes, files, settings and task manager.
- Operator: an Office map, local bot teams, weapons, ammunition, reloads, health and armor, an extraction objective, rounds, spectator mode, scoreboard and saved match statistics.

This is a local simulation. Characters, calls, webcam, websites, videos, stores, purchases and game opponents are simulated; there is no live Discord connection, real shopping, matchmaking or multiplayer server. Music and effects are synthesized with Web Audio. Dialogue uses browser speech synthesis when available. No microphone or webcam capture is required.

### AI conversations

Choose **Connect AI** in the in-game Discord toolbar, or **AI conversations** in the pause menu, then connect through Puter. The game uses Puter's hosted `openai/gpt-4.1-nano` model through its browser SDK. Each player connects their own Puter session; no shared API key is included in the website.

Puter offers a limited free allowance, not unlimited free AI. Availability and limits can change; if the allowance runs out, Puter may offer a paid upgrade or use existing paid credits. See [Puter's quotas and credits](https://docs.puter.com/rate-limits-and-quotas/). You can keep playing with scripted replies and turn AI off at any time.

After you connect, sending a game chat message sends that message, a short recent conversation, character descriptions and a small amount of challenge context to Puter and its model provider. Notes, photos and the full save are not sent. Ambient chat and challenge announcements stay scripted. Network errors and unavailable AI fall back to scripted replies; replies are labeled **AI** or **scripted** so the source is clear. Velcorr remains text-only.

## Saves

Progress is autosaved in this browser's local storage, including room state, purchases and conversations. Use **Escape → Export save**, the touch pause button or the desktop Settings app to download a JSON backup. Import it to restore progress in another browser. Saves on a local development URL and saves on a published GitHub Pages URL are separate; clearing browser storage removes that URL's local save.

The Node tests check simulation, social-state, dialogue, mocked AI connections, challenge rules and touch-input behavior without WebGL or browser UI. They do not replace a playtest of rendering, touch gestures, pointer capture, the mobile keyboard or audio, or a real authenticated AI session.
