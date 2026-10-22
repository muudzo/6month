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
 *
 * Each exhibit's optional `artist` is the credit under its title. Without one,
 * the label credits the two of you.
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
      'Good evening, {her}, and welcome to the Museum of Us. I’m {me}: founder, chief curator, head of security and, tonight, your personal guide.',
      'A few house rules before we begin. No flash photography. No touching the art. Holding hands with the guide is not only allowed, it is strongly encouraged.',
      'This exhibition took six months to collect. Every piece was gathered by hand: in restaurants, in cars, in more mirrors than the museum would like to admit, and once in a very loud club.',
      'Gallery I holds fifteen photographs, hung in the order they happened. Through the door at the far end, in the red salon, three of them were so important they were promoted to masterpieces.',
      'Six hearts are hidden around the building, one for every month. Find them all and there is a reward. I am not allowed to tell you what it is.',
      'And at the very end, in the Future Wing, there is a letter waiting for you. I wrote it myself, so please be gentle with the curator.',
      'Happy six months, {her}. Shall we begin?',
    ],
  },

  exhibits: [
    {
      kind: 'photo',
      src: 'photos/01.jpg',
      title: 'Exhibit A: The Pizza Inn Mirror',
      artist: 'The Pizza Inn bathroom mirror',
      date: 'April 2026',
      medium: 'Mirror selfie, double peace sign, hand-washing poster for scale',
      note:
        'The oldest piece in the collection, and the museum is proud to say it was made in a restaurant bathroom. ' +
        'Experts point to her double peace sign, the very serious hand-washing instructions, and two people who already ' +
        'looked like a team. Everything else in this building started here.',
    },
    {
      kind: 'photo',
      src: 'photos/02.jpg',
      title: 'Study in Pink, Behind a Phone',
      artist: 'The bedroom mirror',
      date: 'Early days',
      medium: 'Wooden mirror, one phone strategically placed',
      note:
        'The phone covers the most important part of this picture, and the museum has decided that is the point. ' +
        'Some things are just for the two people in the frame. Note the pink headband, which the curator considers ' +
        'a major work in its own right.',
    },
    {
      kind: 'photo',
      src: 'photos/03.jpg',
      title: 'Self-Portrait of the Curator',
      artist: '{me}, self-portrait',
      date: 'June 2026',
      medium: 'Front camera, flattering angle, unearned confidence',
      note:
        'The only solo portrait of the curator in the collection, included over the objections of the board. ' +
        'It was taken for an audience of one, with the clear intention of being thought handsome. ' +
        'The curator is still waiting for the review.',
    },
    {
      kind: 'photo',
      src: 'photos/04.jpg',
      title: 'The Bedroom Mirror, Second Commission',
      artist: 'The bedroom mirror (its second appearance)',
      date: 'June 2026',
      medium: 'White corset, sunglasses indoors, one peace sign',
      note:
        'The bedroom mirror returns, now with a clear idea of who its best subjects are. She brought the sunglasses, ' +
        'the corset and the attitude; the curator brought the phone and tried to keep up. Scholars agree she won this one.',
    },
    {
      kind: 'photo',
      src: 'photos/05.jpg',
      title: 'Woman Reading a Menu (after Vermeer)',
      artist: '{me}, from across the table',
      date: 'July 2026',
      medium: 'Candlelit restaurant, one rosé, one white, a very long menu',
      note:
        'In the tradition of the Dutch masters: a woman absorbed in an important document. The document is the ' +
        'cocktail menu. One glass each already poured, and she is still reading, just in case. The curator respects the commitment.',
    },
    {
      kind: 'photo',
      src: 'photos/06.jpg',
      title: 'Still Life with Roses (and Her)',
      artist: '{me}, who also supplied the flowers',
      date: 'July 2026',
      medium: 'Pink roses, dusk, one very happy face',
      note:
        'Painters spent centuries on still lifes of flowers. The museum believes they were missing the most important ' +
        'part: the face of the person receiving them. Look at the smile, not the roses. The roses know they came second.',
    },
    {
      kind: 'photo',
      src: 'photos/07.jpg',
      title: 'Head on Shoulder, Nocturne',
      artist: '{me}, at arm’s length',
      date: 'July 2026',
      medium: 'Front camera, blue restaurant lights, zero personal space',
      note:
        'Nobody in this photograph is smiling, and nobody needs to. Her head on his shoulder says everything the faces ' +
        'refuse to. Critics describe the mood as “content”. The curator describes it as “please never move”.',
    },
    {
      kind: 'photo',
      src: 'photos/08.jpg',
      title: 'The Pout, a Study in Two Parts',
      artist: '{me}, and one very large finger',
      date: 'July 2026',
      medium: 'Synchronised pouting, foreground finger',
      note:
        'A rare work in which both subjects agreed on a facial expression. The finger in the foreground points straight ' +
        'at you, the viewer, and means: yes, you. You are the reason we are making these faces.',
    },
    {
      kind: 'photo',
      src: 'photos/09.jpg',
      title: 'Blue Period',
      artist: '{her} & {me}, with apologies to Picasso',
      date: 'July 2026',
      medium: 'Blue light, two hoodies, one peace sign over one eye',
      note:
        'Picasso had his Blue Period because he was sad. Ours happened because of the lighting. The museum classifies ' +
        'this as a happy Blue Period, which art historians say is extremely rare and should be protected.',
    },
    {
      kind: 'photo',
      src: 'photos/10.jpg',
      title: 'Shades and Shoulder',
      artist: '{me}, sunglasses on',
      date: 'July 2026',
      medium: 'Dark glasses, brick wall, her chin on his shoulder',
      note:
        'He brought the sunglasses and the peace sign. She brought the only eyes in the photo you can actually see, ' +
        'which the museum considers the more generous contribution. A portrait of what it looks like when someone leans into you.',
    },
    {
      kind: 'photo',
      src: 'photos/11.jpg',
      title: 'Tongue Out, Seatbelt On',
      artist: '{me}, with a cameo by {her}’s peace sign',
      date: 'July 2026',
      medium: 'Night drive, seatbelt, one tongue, no dignity',
      note:
        'Every great collection needs one piece the artist would prefer you did not study too closely. This is it. ' +
        'Note the responsible use of a seatbelt, and the hand in the corner proving she was there, encouraging all of it.',
    },
    {
      kind: 'photo',
      src: 'photos/12.jpg',
      title: 'The Artists at Work',
      artist: '{her} & {me}, painting side by side',
      date: 'August 2026',
      medium: 'Canvas, markers, golden hour, very bare trees',
      note:
        'The only exhibit where the subjects are also the painters. Two canvases, a pile of markers, a picnic table, ' +
        'and an afternoon that went soft and golden. The museum has asked for both paintings for its permanent collection. ' +
        'Negotiations are ongoing.',
    },
    {
      kind: 'photo',
      src: 'photos/13.jpg',
      title: 'Reflection, Late August',
      artist: 'A window, with help from the sun',
      date: 'August 2026',
      medium: 'Window glass, two pairs of sunglasses, a shelf of bottles for atmosphere',
      note:
        'A double portrait by way of the nearest reflective surface. Museum policy: any mirror or window within ten metres ' +
        'of the two of you is automatically part of the collection. As you may have noticed, there have been many.',
    },
    {
      kind: 'photo',
      src: 'photos/14.jpg',
      title: 'Shades On, Under the Heineken Sign',
      artist: 'A kind stranger, uncredited',
      date: 'August 2026',
      medium: 'Two pairs of sunglasses, one green bottle, a wave',
      note:
        'One of the few works in the collection by an outside artist, who has never been identified and never been paid. ' +
        'Note that both subjects chose sunglasses. Note that she chose to wave. The curator chose to stand very, very close.',
    },
    {
      kind: 'photo',
      src: 'photos/15.jpg',
      title: 'Month Six, Drive-Through Queue',
      artist: '{her}, front camera',
      date: 'September 2026',
      medium: 'Passenger seat, fast-food menu boards, one magnificent pout',
      note:
        'The newest piece in the collection, made in the most ordinary place imaginable: a queue for food. That is exactly ' +
        'why it is here. Six months in, the ordinary moments are the good ones. The curator has a feeling the best pictures ' +
        'haven’t been taken yet.',
    },
    {
      kind: 'masterpiece',
      style: 'renaissance',
      src: 'photos/16.jpg',
      title: 'La Gioconda di {her}',
      artist: '{me}, from across the table',
      date: 'c. 2026',
      medium: 'Oil on canvas (allegedly). Phone camera (actually).',
      note:
        'The museum’s most celebrated work, kept behind glass because it is irreplaceable. For centuries (well, months) ' +
        'scholars have argued about that smile. Mischief? Pride? Is she pointing at herself to announce that the main ' +
        'character has arrived? The curator was there and can confirm: yes. Staring at it for a very long time is permitted, and encouraged.',
    },
    {
      kind: 'masterpiece',
      style: 'gilded',
      src: 'photos/17.jpg',
      title: 'The Embrace, Graduation Night (after Klimt)',
      artist: 'A friend at the ceremony',
      date: '2026',
      medium: 'Gold leaf, a graduation gown, the proudest hug of the year',
      note:
        'Klimt covered his lovers in gold. The museum did not need to: she was already wearing it, on the hood of her ' +
        'graduation gown. This is the night all her hard work became official, and the curator got to hold the graduate. ' +
        'Notice how everything else dissolves into gold. That is exactly what it felt like.',
    },
    {
      kind: 'masterpiece',
      style: 'surreal',
      src: 'photos/18.jpg',
      title: 'The Persistence of Memory (Six Months)',
      artist: 'A round mirror in a very loud club',
      date: '2026',
      medium: 'Purple light, a porthole mirror, a dance floor behind',
      note:
        'Dalí painted time melting. Look closely: in this round mirror, the two of you are the only still thing in a room ' +
        'that is spinning. Six months with you has felt like a single weekend and a whole lifetime at the same time. ' +
        'Experts cannot explain this. The curator is not asking them to.',
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
