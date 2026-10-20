/**
 * THE MUSEUM OF US: everything personal lives in this one file.
 *
 * 1. Put your photos in /public/photos/ (JPG, PNG or WebP; phone photos are fine).
 * 2. Point each exhibit's `src` at its file name.
 * 3. Rewrite the titles and notes in your own words. `{her}` and `{me}` are
 *    replaced with the two names below wherever they appear.
 *
 * Exhibits marked `kind: 'masterpiece'` hang in the red salon and get turned
 * into oil paintings. Styles: 'renaissance' (Mona Lisa), 'gilded' (Klimt),
 * 'surreal' (Dali). Up to 15 photos and 3 masterpieces.
 */
export const MUSEUM = {
  herName: 'My Chocolate Brownie',
  yourName: 'The Supreme Leader',
  /** The day it all began, YYYY-MM-DD. Drives the live counter in the lobby. */
  startDate: '2026-04-20',
  /** Optional: drop an mp3 in /public/audio/ and put e.g. 'audio/our-song.mp3' here. */
  music: '',

  museumName: 'The Museum of Us',
  exhibitionTitle: 'Six Months: A Retrospective',

  ticket: {
    admit: 'Admit one',
    dedication: 'Curated by the Supreme Leader for my Chocolate Brownie',
    ticketClass: 'VIP · Very Important Partner',
    validity: 'Valid forever',
  },

  welcome:
    'This exhibition gathers eighteen moments from the first six months of a love story that is still in progress. ' +
    'Fifteen are photographs. Three, by popular demand, have been promoted to masterpieces. ' +
    'Please take your time. Touching the art is not permitted. Holding hands with the curator is.',

  exhibits: [
    {
      kind: 'photo',
      src: 'photos/01.jpg',
      title: 'Exhibit A: Where It Began',
      date: 'April 2026',
      medium: 'Phone camera, nervous hands',
      note:
        'The oldest piece in the collection. Both subjects are clearly trying very hard to look relaxed. ' +
        'The curator remembers looking at this photo many, many times on the way home.',
    },
    {
      kind: 'photo',
      src: 'photos/02.jpg',
      title: 'First Date, Slightly Overdressed',
      date: 'Early days',
      medium: 'Best outfit, borrowed confidence',
      note:
        'Two people, one table, and an evening that felt like ten minutes. Note the forgotten drink: ' +
        'the curator was too busy listening to you to remember it was there.',
    },
    {
      kind: 'photo',
      src: 'photos/03.jpg',
      title: 'Study of a Laugh',
      date: 'June 2026',
      medium: 'Candid photograph',
      note:
        'Captured mid-laugh, a rare and precious phenomenon. Since then the curator has devoted serious research ' +
        'to reproducing it. Success rate: high. Terrible jokes required: many.',
    },
    {
      kind: 'photo',
      src: 'photos/04.jpg',
      title: 'Selfie, Mildly Blurred',
      date: 'June 2026',
      medium: 'Phone camera, unsteady hand',
      note:
        'Historians blame the blur on a shaky hand, a moving car, or simply the excitement of the moment. ' +
        'It was the excitement. The curator refuses to delete it on principle.',
    },
    {
      kind: 'photo',
      src: 'photos/05.jpg',
      title: 'The 3 a.m. Conversation',
      date: 'July 2026',
      medium: 'Phone camera, zero sleep',
      note:
        'No camera could capture the conversation itself, so this photo stands in for it. ' +
        'Topics covered: everything. Hours slept: not enough. Regrets: none.',
    },
    {
      kind: 'photo',
      src: 'photos/06.jpg',
      title: 'Dinner, With the Real Subject in the Background',
      date: 'July 2026',
      medium: 'Food photography (officially)',
      note:
        'Catalogued as a photo of dinner. Close inspection reveals the curator was really photographing you ' +
        'and only pretending to care about the food.',
    },
    {
      kind: 'photo',
      src: 'photos/07.jpg',
      title: 'Matching Outfits (Accidental)',
      date: 'July 2026',
      medium: 'Coincidence, allegedly',
      note: 'Neither subject will admit who copied whom. The museum’s official position: great minds dress alike.',
    },
    {
      kind: 'photo',
      src: 'photos/08.jpg',
      title: 'Portrait in Golden Hour',
      date: 'July 2026',
      medium: 'Natural light, no filter needed',
      note: 'The light did a lot of the work here. In fairness, the light had excellent material.',
    },
    {
      kind: 'photo',
      src: 'photos/09.jpg',
      title: 'The Day That Went Off-Plan',
      date: 'July 2026',
      medium: 'Phone camera, several wrong turns',
      note:
        'Nothing went according to plan, and it became one of the best days. The museum notes that every great ' +
        'story in this collection includes at least one wrong turn.',
    },
    {
      kind: 'photo',
      src: 'photos/10.jpg',
      title: 'Candid, Unaware of Camera',
      date: 'July 2026',
      medium: 'Stealth photography',
      note:
        'Taken while you weren’t looking: the curator’s favourite genre. You will ask for this one to be taken down. ' +
        'Request denied.',
    },
    {
      kind: 'photo',
      src: 'photos/11.jpg',
      title: 'Somewhere, Smiling',
      date: 'July 2026',
      medium: 'Phone camera, priceless subject',
      note:
        'The museum’s insurers list this smile as the most valuable item in the building. ' +
        'They refused to put a number on it.',
    },
    {
      kind: 'photo',
      src: 'photos/12.jpg',
      title: 'An Afternoon Outdoors',
      date: 'August 2026',
      medium: 'Natural light, good company',
      note:
        'Proof that the two of you can turn an ordinary afternoon into an exhibit. ' +
        'The curator has no notes. It was perfect.',
    },
    {
      kind: 'photo',
      src: 'photos/13.jpg',
      title: 'Reflection, Late August',
      date: 'August 2026',
      medium: 'Window glass, two show-offs',
      note:
        'A double portrait by way of the nearest reflective surface. Museum policy: any mirror within ten metres ' +
        'of the two of you is automatically part of the collection.',
    },
    {
      kind: 'photo',
      src: 'photos/14.jpg',
      title: 'Shades On, After Dark',
      date: 'August 2026',
      medium: 'Sunglasses indoors, no regrets',
      note:
        'Experts advise against wearing sunglasses at night. ' +
        'The experts have clearly never looked this good doing it.',
    },
    {
      kind: 'photo',
      src: 'photos/15.jpg',
      title: 'Month Six',
      date: 'September 2026',
      medium: 'The latest acquisition',
      note:
        'The newest piece in the collection, and proof that the collection is still growing. ' +
        'The curator has a feeling the best pictures haven’t been taken yet.',
    },
    {
      kind: 'masterpiece',
      style: 'renaissance',
      src: 'photos/16.jpg',
      title: 'La Gioconda di {her}',
      date: 'c. 2026',
      medium: 'Oil on canvas (allegedly). Phone camera (actually).',
      note:
        'The museum’s most celebrated work, kept behind glass because it is irreplaceable. For centuries (well, months) ' +
        'scholars have argued about that smile. Amusement? Mischief? Did someone just say something ridiculous? ' +
        'The curator was there and can confirm: all three. Staring at it for a very long time is permitted, and encouraged.',
    },
    {
      kind: 'masterpiece',
      style: 'gilded',
      src: 'photos/17.jpg',
      title: 'The Kiss (after Klimt)',
      date: '2026',
      medium: 'Gold leaf, good lighting, a little luck',
      note:
        'Klimt spent months layering gold leaf onto his version. Ours took one second and a slightly awkward arm angle. ' +
        'The museum considers ours the superior work. Notice how everything else dissolves into gold. ' +
        'That is exactly what it felt like.',
    },
    {
      kind: 'masterpiece',
      style: 'surreal',
      src: 'photos/18.jpg',
      title: 'The Persistence of Memory (Six Months)',
      date: '2026',
      medium: 'Melted clocks, oil on canvas, one unforgettable day',
      note:
        'Dalí painted time melting. The curator finally understands why. Six months with you has felt like a single ' +
        'weekend and a whole lifetime at the same time. Experts cannot explain this. The curator is not asking them to.',
    },
  ],

  sculpture: {
    title: 'Untitled (Heart)',
    medium: 'Carrara marble, 2026',
    note:
      'Carved over six months from one block of ordinary days. The sculptor wishes to note that it was not difficult: ' +
      'every day with you came out looking like this.',
  },

  /** Empty frames in the Future Wing, waiting to be filled. Up to 4. */
  futureExhibits: ['Month Seven', 'Our First Trip Together', 'Inside Jokes We Haven’t Made Yet', 'Everything After'],

  finalLetter: {
    greeting: 'Dear {her},',
    paragraphs: [
      'Six months ago I didn’t know one person could become the best part of every single day. Now I can’t really remember what my days looked like before you.',
      'Thank you for the laughs, the late-night conversations, the patience when I’m being ridiculous, and for being exactly who you are. This museum is small, but it holds the most valuable collection I own.',
      'Every frame in the Future Wing is empty on purpose. I can’t wait to fill them with you.',
    ],
    signoff: 'Yours, always,\n{me}',
  },

  renewal: {
    question: 'Your membership to the Museum of Us is up for renewal. Renew for the next six months (and the six after that)?',
    yes: 'Renew my membership',
    no: 'Let it expire',
    thanks: 'Membership renewed. The curator is very, very happy.',
  },

  secretNote:
    'You found all six hearts, one for every month, the same way you found your way into mine. ' +
    'This screen can be exchanged for one (1) kiss and one (1) dessert of your choice. ' +
    'Present it to the curator. It never expires.',
};
