# The Museum of Us

A private 3D museum for a six-month anniversary. She tears an admission ticket, the doors swing open,
and she walks through a candlelit gallery of your photos. Each photo has a curator's note, three of them
are turned into oil-painting "masterpieces", and the Future Wing at the end holds a letter.

## Make it yours (about 20 minutes)

### 1. Photos

The 18 photos live in `public/photos/`, named `01.jpg` to `18.jpg`.

| Files | Where they hang |
| --- | --- |
| `01.jpg` – `15.jpg` | Gallery I, oldest first, alternating left and right walls |
| `16.jpg` | The centrepiece, *La Gioconda*: a portrait of her works best |
| `17.jpg` | *The Kiss (after Klimt)*: a photo of the two of you |
| `18.jpg` | *The Persistence of Memory*: a fun or dreamy one |

- To swap a photo, replace its file and keep the name. JPG, PNG or WebP all work. iPhone HEIC photos won't
  load: in Photos, choose **File → Export → Export 1 Photo** as JPEG.
- Frames are shaped to each photo, portrait or landscape. Large photos are scaled down when the museum loads.
- Photos straight off a phone carry hidden location data. The ones in `public/photos/` were cleaned of it. Your
  originals in `images/` still have it, so that folder is kept out of git and the site never uses it.
- A missing photo shows a painted placeholder.

### 2. Edit `src/config/museum.js`

This is the only file you need to touch.

- `herName`, `yourName`: appear on the ticket, banners, labels and letter.
- `ticket.dedication`: the line on the admission ticket under the title.
- `startDate`: the day it began (`YYYY-MM-DD`). Drives the live "days, and counting" counter in the lobby.
- Each exhibit's `title` and `date`, one picture per line. To rename one, change only the words inside the quotes
  after `title:`.
- Optional extras per exhibit: `note` (a description under the title), `medium`, and `artist` (the credit under
  the title, e.g. "A kind stranger"). Without an `artist`, the label credits the two of you.
- `guide`: the tour guide who greets her in the lobby once the doors open. `speech` is shown one line at a time,
  `portrait` is a photo from `public/photos/` (leave it out for a gold monogram), and `name` and `role` sit beside
  it. Delete the whole block to skip the speech.
- `finalLetter`: the letter at the very end. Please write this one yourself.
- `secretNote`: the reward for finding all six hidden hearts.

Write `{her}` or `{me}` anywhere and it is replaced with the names. If something in the file is wrong, the page
tells you exactly what to fix instead of breaking.

### 3. Optional: your song

Drop an mp3 into `public/audio/` and set `music: 'audio/our-song.mp3'`. Without one, the museum plays its own
soft music-box ambience. Sound starts when she tears the ticket, and there's a mute button.

## Preview it

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173). To try it on your phone, run `npm run dev -- --host`
and open the "Network" address on a phone on the same Wi-Fi.

## Send it to her

The museum is live at **https://museum-of-us-one.vercel.app**. It's hosted on Vercel (project `museum-of-us`),
which is connected to the GitHub repo, so updating it is just:

```bash
git push        # Vercel rebuilds and publishes main in about a minute
```

`vercel deploy --prod` from this folder does the same without GitHub. Search engines are told not to index the
site, but anyone with the link can open it, so share it privately.

`vercel.json` sets the security headers, and `.vercelignore` keeps `images/` (the originals with location data)
from ever being uploaded.

It works on phones, tablets and computers in current Chrome, Safari, Firefox and Edge.

## What she can do inside

- **Meet the guide**: in the lobby, the guide gives a short welcome speech. At the end she can begin the tour,
  which glides her to the first photo, or explore on her own. The close button or Escape skips it.
- **Walk**: drag to look around. On a computer, W A S D or arrow keys (Shift to hurry). On a phone, the
  on-screen stick.
- **Tap any picture** to glide up to it and read its label, then use Previous and Next to take the tour in order.
- **Restoration view**: on each masterpiece, a slider wipes the oil paint away to reveal the original photo.
- **Floor plan** (map button, or M): every exhibit, what she's seen, and a tap to travel there.
- **Six hidden hearts**, one per month. Found hearts are remembered on her device. Spoilers, for you only: by a lamp
  post outside, in a lobby corner by the entrance, at the end of a gallery bench, in the far corner of Gallery I
  next to the salon door, behind the Mona Lisa's wall, and in a corner of the Future Wing.
- **The letter**, on a plinth at the end of the Future Wing, with a membership renewal she can't decline.
  The "Let it expire" button won't stay still.

Other details: a live counter of days, hours, minutes and seconds since `startDate`, a marble heart sculpture in
the lobby with its own label, and the empty "reserved" frames in the Future Wing.

## For the curious

```bash
npm test               # unit tests (floor plan, pathfinding, springs, config checks)
npm run test:coverage  # with coverage
npm run test:e2e       # Playwright: walks through the museum in desktop and phone browsers
```

```
src/config/museum.js   everything personal
src/lib/               pure logic: floor plan, collision, pathfinding, springs, config validation
src/world/             the 3D building: rooms, exterior, frames, lighting, oil-painting shader
src/controls/          walking, looking, gliding, picking
src/ui/                ticket, HUD, labels, letter, floor plan, sound
src/app/               ties it together
```

Movement uses critically damped springs and momentum, and any glide can be interrupted mid-flight. The
masterpieces are painted on the GPU (a Kuwahara filter for brush strokes, then varnish, canvas weave and
craquelure). Users who prefer reduced motion get gentle fades instead of camera flights.
