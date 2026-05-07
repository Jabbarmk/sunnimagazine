export type Article = {
  id: string;
  magazineId: string;
  title: string;
  caption: string;
  category: string;
  author: string;
  avatar: string;
  date: string;
  readTime: string;
  hero: string;
  paragraphs: string[];
  inlineImage?: string;
  inlineImage2?: string;
  bottomImage?: string;
  pullQuote?: string;
};

export type Magazine = {
  id: string;
  title: string;
  month: string;
  year: string;
  cover: string;
  description: string;
  articleIds: string[];
};

export type Video = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: "Interviews" | "Behind the Scenes" | "Shorts";
  featured?: boolean;
};

const img = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const magazines: Magazine[] = [
  {
    id: "jun-2025",
    title: "ഗൾഫ് സത്യധാര",
    month: "June",
    year: "2025",
    cover: "/one.jpeg",
    description: "On slowness, craft, and the return of the handmade.",
    articleIds: ["a1", "a2", "a3", "a4", "a5"],
  },
  {
    id: "may-2025",
    title: "Open Sky",
    month: "May",
    year: "2025",
    cover: "/two.jpeg",
    description: "A travel issue on distance and the long road.",
    articleIds: ["a6", "a7", "a8"],
  },
  {
    id: "apr-2025",
    title: "Material Instincts",
    month: "April",
    year: "2025",
    cover: "/one.jpeg",
    description: "Fabric, stone, and the things we keep.",
    articleIds: ["a9", "a10"],
  },
  {
    id: "mar-2025",
    title: "Wired & Soft",
    month: "March",
    year: "2025",
    cover: img("folio-mar25", 800, 1000),
    description: "Technology with a gentler edge.",
    articleIds: [],
  },
  {
    id: "feb-2025",
    title: "Inheritance",
    month: "February",
    year: "2025",
    cover: img("folio-feb25", 800, 1000),
    description: "Family archives, heirlooms, and forgotten letters.",
    articleIds: [],
  },
  {
    id: "jan-2025",
    title: "The New Quiet",
    month: "January",
    year: "2025",
    cover: img("folio-jan25", 800, 1000),
    description: "A start-of-year meditation on silence.",
    articleIds: [],
  },
  {
    id: "dec-2024",
    title: "Long Winter",
    month: "December",
    year: "2024",
    cover: img("folio-dec24", 800, 1000),
    description: "An end-of-year essay collection.",
    articleIds: [],
  },
  {
    id: "nov-2024",
    title: "Table for Two",
    month: "November",
    year: "2024",
    cover: img("folio-nov24", 800, 1000),
    description: "A food issue on the small rituals.",
    articleIds: [],
  },
];

const lorem = [
  "Morning arrives slowly in the workshop. The light moves across the long wooden bench like water finding its level, picking out the dust, the tools laid in a row, the unfinished work waiting where it was left the evening before. There is no hurry here. The first gesture of the day is always the same: a hand on the wood, a breath, a small decision to begin.",
  "Craft, in the end, is not a matter of talent or ambition but of attention. You learn it by repetition, by failure, by sitting with a piece of material long enough that it begins to speak back. The things you make are not separate from you. They carry the shape of your hours, your moods, the weather of your particular week. A chair made in a good month feels different from one made in a bad one.",
  "What we are recovering, in the slow return of the handmade, is not an aesthetic but a relationship. We wanted our objects to mean something again. We wanted to know the hands. We wanted the small flaws that prove a human was there. We are, as a culture, beginning to remember that the price of a thing is not only its price.",
  "There is a quiet radicalism in making what you could buy. It resists the easy economy of the catalogue, the frictionless click, the endless refill. It says: I have time for this. I will spend some of my one life on this small, useful thing. The reward is not the object, though the object is good. The reward is the hour.",
  "By late afternoon the shop is warm and full of a low, particular smell — shavings, oil, the faint iron of sharpening stones. Someone in the next room is listening to the radio. The work continues because it is always continuing. Tomorrow there will be another bench, another hour, another chance to make something true.",
];

const malayalamStory = [
  "തത്വചിന്തകനും വിദ്യാഭ്യാസ വിചക്ഷണനും എഴുത്തുകാരനും പതിനാറാം നൂറ്റാണ്ടിന്റെ വിസ്മയവുമായിരുന്നു, തോമസ് മൂർ. ഇംഗ്ലണ്ടിലെ ലോർഡ് എന്ന ദേശത്തെ ചാൻസലർ കൂടിയായിരുന്ന മൂർ, ഹെൻറി എട്ടാമനുമായുള്ള ഒരു തർക്കത്തിന്റെ പേരിൽ മരണശിക്ഷക്കു വിധിക്കപ്പെട്ടു. രാജ്യദ്രോഹക്കുറ്റം ചുമത്തിയായിരുന്നു അദ്ദേഹത്തെ വധശിക്ഷക്കു കൽതുറങ്കിൽ അടച്ചത്.",
  "ശാന്തനായി ജയിൽവാസമനുഭവിച്ച് മരണം വരിക്കാൻ ഒരുങ്ങി നിൽക്കുന്ന മൂറിനെ കാണാൻ ഒരിക്കൽ അദ്ദേഹത്തിന്റെ ഭാര്യ വന്നു. കരഞ്ഞു കലങ്ങിയ കണ്ണുകൾ. നിസ്സംഗഭാവം ധരിച്ച് ശൂന്യതയെ ഉറ്റുനോക്കും പോലെ ജയിലറയിലെ ഇരുളിലേക്ക് അവർ തന്റെ കണ്ണുകൾ പായിച്ചുകൊണ്ട് സ്വരം താഴ്ത്തി ശാന്തമായി പറഞ്ഞു. \u201Cഅങ്ങ് \u2018അതെ\u2019 എന്ന ഒരു വാക്ക് രാജാവിനോടു പറഞ്ഞാൽ അദ്ദേഹം അങ്ങയെ വെറുതെ വിടും…\u201D",
  "\u201Cഎനിക്കെത്ര വയസ്സായി?\u201D ശിപാർശയുമായി വന്ന ഭാര്യയോട് അദ്ദേഹം ശാന്തമായിത്തന്നെ ചോദിച്ചു. \u201Cഅൻപത്തിയഞ്ച്.\u201D \u201Cഇനി ഞാൻ എത്ര വർഷം കൂടി ജീവിക്കും?\u201D \u201Cദൈവം കനിഞ്ഞാൽ ഒരു ഇരുപതു വർഷം കൂടിയെങ്കിലും…\u201D \u201Cഎനിക്ക് ഇരുപതു വർഷം പോരാ! ഇരുപതിനായിരം കോടി വർഷം വേണം. അത് എനിക്ക് ആര് തരും?\u201D",
];

export const articles: Article[] = [
  {
    id: "a1",
    magazineId: "jun-2025",
    title: "ഇല കൊഴിയും പോലെ ഒരു മരണം",
    caption: "Why a new generation is trading scale for the workshop.",
    category: "ജാലകം",
    author: "Amelia Hart",
    avatar: img("author-amelia", 200, 200),
    date: "Jun 12, 2025",
    readTime: "7 min read",
    hero: img("art-handmade", 1200, 900),
    paragraphs: [...malayalamStory, ...lorem.slice(0, 2)],
    inlineImage: img("art-handmade-2", 1200, 800),
    pullQuote: "The reward is not the object, though the object is good. The reward is the hour.",
  },
  {
    id: "a2",
    magazineId: "jun-2025",
    title: "A Room of Long Mornings",
    caption: "On the architecture of slow light.",
    category: "DESIGN",
    author: "Idris Okafor",
    avatar: img("author-idris", 200, 200),
    date: "Jun 10, 2025",
    readTime: "5 min read",
    hero: img("art-room", 1200, 900),
    paragraphs: lorem.slice(0, 4),
    inlineImage: img("art-room-2", 1200, 800),
  },
  {
    id: "a3",
    magazineId: "jun-2025",
    title: "The Software of Patience",
    caption: "Tools built for attention, not distraction.",
    category: "TECH",
    author: "Naomi Vance",
    avatar: img("author-naomi", 200, 200),
    date: "Jun 8, 2025",
    readTime: "6 min read",
    hero: img("art-tech", 1200, 900),
    paragraphs: lorem.slice(0, 4),
  },
  {
    id: "a4",
    magazineId: "jun-2025",
    title: "Small Dinners, Long Talks",
    caption: "The return of the seven-guest table.",
    category: "FOOD",
    author: "Hana Lindqvist",
    avatar: img("author-hana", 200, 200),
    date: "Jun 6, 2025",
    readTime: "4 min read",
    hero: img("art-dinner", 1200, 900),
    paragraphs: lorem.slice(0, 3),
    pullQuote: "A table is a room inside a room.",
  },
  {
    id: "a5",
    magazineId: "jun-2025",
    title: "Letters I Kept",
    caption: "Notes on the physical archive.",
    category: "ESSAY",
    author: "Jun Takahashi",
    avatar: img("author-jun", 200, 200),
    date: "Jun 3, 2025",
    readTime: "8 min read",
    hero: img("art-letters", 1200, 900),
    paragraphs: lorem,
  },
  {
    id: "a6",
    magazineId: "may-2025",
    title: "The Long Road North",
    caption: "A thousand miles, alone, in no hurry.",
    category: "TRAVEL",
    author: "Ellis Moreau",
    avatar: img("author-ellis", 200, 200),
    date: "May 22, 2025",
    readTime: "9 min read",
    hero: img("art-road", 1200, 900),
    paragraphs: lorem,
    inlineImage: img("art-road-2", 1200, 800),
    pullQuote: "Distance is a kind of attention.",
  },
  {
    id: "a7",
    magazineId: "may-2025",
    title: "Islands Off Season",
    caption: "When the tourists leave, the place returns.",
    category: "TRAVEL",
    author: "Sara Benites",
    avatar: img("author-sara", 200, 200),
    date: "May 18, 2025",
    readTime: "6 min read",
    hero: img("art-island", 1200, 900),
    paragraphs: lorem.slice(0, 4),
  },
  {
    id: "a8",
    magazineId: "may-2025",
    title: "Train Windows",
    caption: "Six days across a continent.",
    category: "TRAVEL",
    author: "Marcus Vale",
    avatar: img("author-marcus", 200, 200),
    date: "May 12, 2025",
    readTime: "5 min read",
    hero: img("art-train", 1200, 900),
    paragraphs: lorem.slice(0, 3),
  },
  {
    id: "a9",
    magazineId: "apr-2025",
    title: "Stone, Kept",
    caption: "A stonemason on the objects that outlive us.",
    category: "CRAFT",
    author: "Petra Linn",
    avatar: img("author-petra", 200, 200),
    date: "Apr 20, 2025",
    readTime: "7 min read",
    hero: img("art-stone", 1200, 900),
    paragraphs: lorem,
  },
  {
    id: "a10",
    magazineId: "apr-2025",
    title: "The Wool House",
    caption: "Inside a family mill in the Scottish Borders.",
    category: "STYLE",
    author: "Oren Halliday",
    avatar: img("author-oren", 200, 200),
    date: "Apr 14, 2025",
    readTime: "6 min read",
    hero: img("art-wool", 1200, 900),
    paragraphs: lorem.slice(0, 4),
    inlineImage: img("art-wool-2", 1200, 800),
  },
];

export const videos: Video[] = [
  {
    id: "v1",
    title: "Inside the Workshop — A Year with the Makers",
    duration: "12:44",
    thumbnail: img("vid-workshop", 1200, 700),
    category: "Behind the Scenes",
    featured: true,
  },
  { id: "v2", title: "Amelia Hart in Conversation", duration: "8:12", thumbnail: img("vid-amelia", 800, 600), category: "Interviews" },
  { id: "v3", title: "One Minute with a Stonemason", duration: "1:02", thumbnail: img("vid-stone", 800, 600), category: "Shorts" },
  { id: "v4", title: "The Long Road — Travel Diary", duration: "14:03", thumbnail: img("vid-road", 800, 600), category: "Behind the Scenes" },
  { id: "v5", title: "A Room of Long Mornings — Film", duration: "4:31", thumbnail: img("vid-room", 800, 600), category: "Shorts" },
  { id: "v6", title: "Idris Okafor on Light", duration: "9:58", thumbnail: img("vid-idris", 800, 600), category: "Interviews" },
  { id: "v7", title: "The Wool House, in Motion", duration: "6:17", thumbnail: img("vid-wool", 800, 600), category: "Behind the Scenes" },
];

export const findMagazine = (id: string) => magazines.find((m) => m.id === id);
export const findArticle = (id: string) => articles.find((a) => a.id === id);
export const articlesFor = (magazineId: string) =>
  articles.filter((a) => a.magazineId === magazineId);
