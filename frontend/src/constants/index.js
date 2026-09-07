export const NOTEBOOK_THEMES = [
  { id: "grid-paper", label: "Grid Paper", blurb: "Crisp blue ruled squares", swatch: ["#3457d5", "#e0567a", "#e4572e", "#fdfdf9"] },
  { id: "blueprint", label: "Blueprint", blurb: "Cyan lines on deep navy", swatch: ["#7dd3fc", "#a5b4fc", "#fbbf24", "#0f3a63"] },
  { id: "parchment", label: "Vintage Parchment", blurb: "Aged cream & sepia ink", swatch: ["#8a5a2b", "#9c6b3f", "#a4262c", "#f5e9d2"] },
  { id: "chalkboard", label: "Chalkboard", blurb: "Chalk dust, dark mode", swatch: ["#f7f3e8", "#ffd9a0", "#a6e3a1", "#243430"] },
  { id: "watercolor", label: "Watercolour Wash", blurb: "Soft bleeding pastels", swatch: ["#9a86d4", "#6fc3c0", "#f0a390", "#fbfaf7"] },
  { id: "manga", label: "Pastel Manga", blurb: "Screentone sketchpad", swatch: ["#ff5d8f", "#4cc2ff", "#1c1c1e", "#ffffff"] },
];

export const DEFAULT_THEME = "grid-paper";

/** Visual icebreaker prompts — you answer by drawing, not typing. */
export const DRAW_PROMPTS = [
  { promptId: "comfort-food", prompt: "Doodle your favourite comfort food" },
  { promptId: "first-date", prompt: "Draw where we should go on our first date" },
  { promptId: "spirit-animal", prompt: "Sketch your spirit animal" },
  { promptId: "weekend-vibe", prompt: "Draw your ideal weekend in 3 scribbles" },
  { promptId: "coffee-order", prompt: "Sketch your coffee order" },
  { promptId: "green-flag", prompt: "Draw a green flag you look for" },
];

export const STAMP_STYLES = [
  { id: "heart", label: "Heart doodle", glyph: "♥" },
  { id: "smiley", label: "Smiley", glyph: "☺" },
  { id: "wax-seal", label: "Wax seal", glyph: "✷" },
  { id: "star", label: "Gold star", glyph: "★" },
];

export const INTEREST_SUGGESTIONS = [
  "sketching", "watercolour", "comics", "matcha", "vinyl", "climbing", "ramen",
  "thrifting", "film photography", "board games", "baking", "synths", "hiking",
  "cats", "dogs", "sci-fi", "gardening", "pottery", "skating", "karaoke",
];

export const GENDER_OPTIONS = [
  { id: "woman", label: "Woman" },
  { id: "man", label: "Man" },
  { id: "nonbinary", label: "Nonbinary" },
  { id: "other", label: "Other" },
];

export const SHOW_ME_OPTIONS = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "nonbinary", label: "Nonbinary folks" },
];

export const GAMES = [
  { id: "guess-the-doodle", label: "Guess the Doodle", blurb: "60-second Pictionary" },
  { id: "exquisite-corpse", label: "Exquisite Corpse", blurb: "Draw half each, folded" },
  { id: "tic-tac-toe", label: "Tic-Tac-Toe", blurb: "Classic paper grid" },
  { id: "hangman", label: "Hangman", blurb: "Guess the word" },
];

export const DOODLE_WORDS = [
  "cactus", "rocket", "octopus", "umbrella", "pancake", "robot", "lighthouse",
  "guitar", "dinosaur", "snowman", "mailbox", "jellyfish", "bicycle", "volcano",
  "mushroom", "hedgehog", "teapot", "ferris wheel", "sandcastle", "hot air balloon",
];
