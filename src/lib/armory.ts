export type AssetLink = { name: string; url: string; note: string; license: string };
export type AssetSection = { slug: string; title: string; blurb: string; links: AssetLink[] };

/** The Armory is a link hub, not an editor. Check each source's license before use. */
export const ARMORY: AssetSection[] = [
  {
    slug: "music",
    title: "Music",
    blurb: "Beds and scores you can actually use.",
    links: [
      { name: "YouTube Audio Library", url: "https://www.youtube.com/audiolibrary", note: "Free tracks for creators, many need no attribution.", license: "Varies per track" },
      { name: "Free Music Archive", url: "https://freemusicarchive.org/", note: "Curated CC-licensed catalog.", license: "CC (check each)" },
      { name: "Incompetech", url: "https://incompetech.com/music/royalty-free/music.html", note: "Kevin MacLeod's cinematic library.", license: "CC-BY" },
      { name: "Pixabay Music", url: "https://pixabay.com/music/", note: "Epic, orchestral, phonk, ambient.", license: "Pixabay License" },
      { name: "Musopen", url: "https://musopen.org/music/", note: "Public-domain classical recordings.", license: "PD / CC" },
    ],
  },
  {
    slug: "sfx",
    title: "Sound Effects",
    blurb: "Hits, risers, whooshes, swords, crowds.",
    links: [
      { name: "Freesound", url: "https://freesound.org/", note: "Huge community SFX library.", license: "CC0 / CC-BY" },
      { name: "Pixabay Sound Effects", url: "https://pixabay.com/sound-effects/", note: "Fast search, no account needed.", license: "Pixabay License" },
      { name: "Sonniss GDC Bundles", url: "https://sonniss.com/gameaudiogdc", note: "Pro game-audio packs, royalty free.", license: "Royalty free" },
      { name: "Mixkit SFX", url: "https://mixkit.co/free-sound-effects/", note: "Clean transitions and impacts.", license: "Mixkit License" },
    ],
  },
  {
    slug: "footage",
    title: "Footage & Archives",
    blurb: "Public-domain and free stock to cut with.",
    links: [
      { name: "NASA Image & Video Library", url: "https://images.nasa.gov/", note: "Launches, Earth, deep space.", license: "Generally PD" },
      { name: "Internet Archive: Prelinger", url: "https://archive.org/details/prelinger", note: "Mid-century American archival film.", license: "PD / CC" },
      { name: "Wikimedia Commons", url: "https://commons.wikimedia.org/", note: "Paintings, maps, historical photos.", license: "PD / CC (check each)" },
      { name: "Pexels Videos", url: "https://www.pexels.com/videos/", note: "Cinematic free stock.", license: "Pexels License" },
    ],
  },
  {
    slug: "overlays",
    title: "Overlays & Effects",
    blurb: "Grain, flashes, light leaks, dust.",
    links: [
      { name: "Mixkit Video Overlays", url: "https://mixkit.co/free-stock-video/overlay/", note: "Light leaks, particles, film burns.", license: "Mixkit License" },
      { name: "Videezy", url: "https://www.videezy.com/free-video/overlay", note: "Overlay and transition clips.", license: "Free / attribution varies" },
      { name: "Pixabay Videos", url: "https://pixabay.com/videos/search/overlay/", note: "Smoke, fire, dust, grain.", license: "Pixabay License" },
    ],
  },
  {
    slug: "type",
    title: "Type & Titles",
    blurb: "Fonts for title cards and captions.",
    links: [
      { name: "Google Fonts", url: "https://fonts.google.com/", note: "Cinzel, Cormorant, Inter and more.", license: "OFL" },
      { name: "Font Squirrel", url: "https://www.fontsquirrel.com/", note: "Commercial-use free fonts.", license: "Varies" },
    ],
  },
];
