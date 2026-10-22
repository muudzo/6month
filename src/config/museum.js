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
    'This exhibition gathers seventeen moments from the first six months of a love story that is still in progress. ' +
    'Fourteen are photographs. Three, by popular demand, have been promoted to masterpieces. ' +
    'Please take your time. Touching the art is not permitted. Holding hands with the curator is.',

  /**
   * The guide who greets her in the lobby, one line at a time. Remove this
   * whole block to skip the speech. `portrait` is a photo from /public/photos/;
   * leave it out for a gold monogram instead.
   */
  guide: {
    name: '{me}',
    role: 'Chief curator and your guide tonight',
    portrait: 'photos/03.jpg',
    speech: [
      'Happy 6 months, baby girl. I chose some memories we have together that have great stories behind them.',
      'Welcome to the Museum of Us. I’m the Supreme Leader: founder, chief curator, head of security and, tonight, your personal guide.',
      'A few house rules before we begin. No flash photography. No touching the art. Holding hands with the guide is not only allowed, it is strongly encouraged.',
      'Gallery I holds fourteen photographs, hung in the order they happened. Through the door at the far end, in the red salon, three of them were so important they were promoted to masterpieces.',
      'Six hearts are hidden around the building, one for every month. Find them all and there is a reward. I am not allowed to tell you what it is.',
      'And at the very end, in the Future Wing, there is a letter waiting for you. I wrote it myself, so please be gentle with the curator.',
      'Shall we begin, my Chocolate Brownie?',
    ],
  },

  /**
   * The pictures, oldest first. To rename one, change only the words inside
   * the quotes after `title:`. Keep the quotes and the comma at the end of the line.
   * Optional extras per picture: `note` (a description), `medium`, `artist`.
   */
  exhibits: [
    { kind: 'photo', src: 'photos/01.jpg', date: 'April 2026', title: 'The Day We Met' },
    { kind: 'photo', src: 'photos/02.jpg', date: 'Early days', title: 'Study in Pink, Behind a Phone' },
    { kind: 'photo', src: 'photos/03.jpg', date: 'June 2026', title: 'Self-Portrait of the Curator' },
    { kind: 'photo', src: 'photos/04.jpg', date: 'June 2026', title: 'My Coolness Was Rubbing Off on You' },
    { kind: 'photo', src: 'photos/05.jpg', date: 'July 2026', title: 'The Face You Make When You’re the One Paying (My Second Favorite Date)' },
    { kind: 'photo', src: 'photos/06.jpg', date: 'July 2026', title: 'Still Life with Roses (and Her)' },
    { kind: 'photo', src: 'photos/07.jpg', date: 'July 2026', title: 'Chop Chop Was a Favorite' },
    { kind: 'photo', src: 'photos/08.jpg', date: 'July 2026', title: 'The Pout, a Study in Two Parts' },
    { kind: 'photo', src: 'photos/09.jpg', date: 'July 2026', title: 'Blue Period' },
    { kind: 'photo', src: 'photos/10.jpg', date: 'July 2026', title: 'Crazy Night, This One' },
    { kind: 'photo', src: 'photos/12.jpg', date: 'August 2026', title: 'I Suck at Drawing, I’m Just Good at Speaking' },
    { kind: 'photo', src: 'photos/13.jpg', date: 'August 2026', title: '4th' },
    { kind: 'photo', src: 'photos/14.jpg', date: 'August 2026', title: 'Shades On, Under the Heineken Sign' },
    { kind: 'photo', src: 'photos/15.jpg', date: 'September 2026', title: 'We Spent So Much Time Eating Food, lol' },
    { kind: 'masterpiece', style: 'renaissance', src: 'photos/16.jpg', date: 'c. 2026', title: 'My Favorite Picture of You. I Don’t Know Why, It Just Is, lol' },
    { kind: 'masterpiece', style: 'gilded', src: 'photos/17.jpg', date: '2026', title: 'Graduation Day, Prada U' },
    { kind: 'masterpiece', style: 'surreal', src: 'photos/18.jpg', date: '2026', title: 'Pure Suscumry' },
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
