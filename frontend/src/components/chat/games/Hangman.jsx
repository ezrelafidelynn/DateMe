import { useEffect, useState } from "react";

const ALPHA = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX_MISS = 6;

export default function Hangman({ role, incoming, sendMove, endGame }) {
  const [word, setWord] = useState("");
  const [draft, setDraft] = useState("");
  const [guessed, setGuessed] = useState([]);
  const [misses, setMisses] = useState([]);
  const [remoteState, setRemoteState] = useState(null);

  const isHost = role === "host";

  useEffect(() => {
    const m = incoming?.move;
    if (!m) return;
    if (m.t === "word") setWord(m.word.toLowerCase());
    if (m.t === "state") setRemoteState(m);
  }, [incoming]);

  const setSecret = () => {
    if (draft.trim().length < 3) return;
    const w = draft.trim().toLowerCase();
    setWord(w);
    sendMove({ t: "word", word: w });
  };

  const guess = (letter) => {
    if (guessed.includes(letter) || misses.includes(letter)) return;
    const hit = word.includes(letter);
    const nextGuessed = hit ? [...guessed, letter] : guessed;
    const nextMisses = hit ? misses : [...misses, letter];
    setGuessed(nextGuessed);
    setMisses(nextMisses);

    const won = word.split("").every((c) => nextGuessed.includes(c));
    const lost = nextMisses.length >= MAX_MISS;
    sendMove({
      t: "state",
      guessed: nextGuessed,
      misses: nextMisses,
      done: won || lost,
      win: won,
      word: won || lost ? word : null,
    });
  };

  const view = isHost ? remoteState : { guessed, misses, done: null };
  const known = view?.guessed || [];
  const finished = Boolean(view?.done && view?.word);
  const shownWord = word
    .split("")
    .map((c) => (known.includes(c) || finished ? c : "_"))
    .join(" ");

  /* ---- host: still choosing the word ---- */
  if (isHost && !word) {
    return (
      <div className="text-center space-y-2">
        <p className="font-hand text-lg">Pick a secret word (3+ letters)</p>
        <input
          className="input input-bordered w-full"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^a-zA-Z ]/g, ""))}
          placeholder="e.g. lighthouse"
        />
        <button className="btn btn-primary btn-sm" onClick={setSecret}>
          Set word
        </button>
      </div>
    );
  }

  if (!word) {
    return <p className="py-6 text-center font-hand text-lg">Waiting for a secret word…</p>;
  }

  const missCount = (view?.misses || []).length;
  const done = isHost ? view?.done : view?.done ?? null;
  const won = isHost ? view?.win : word.split("").every((c) => guessed.includes(c));
  const resultText = won ? "guessed it!" : done ? `stumped — it was "${word}"` : null;

  return (
    <div className="text-center">
      <p className="font-script text-3xl tracking-widest">{shownWord}</p>
      <p className="mt-1 font-hand text-sm text-error">
        misses: {(view?.misses || []).join(" ") || "none"} ({missCount}/{MAX_MISS})
      </p>

      {!isHost && !done && (
        <div className="mx-auto mt-3 grid max-w-sm grid-cols-9 gap-1">
          {ALPHA.map((l) => (
            <button
              key={l}
              onClick={() => guess(l)}
              disabled={guessed.includes(l) || misses.includes(l)}
              className="rounded border border-base-content/20 py-1 text-sm disabled:opacity-30"
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {isHost && !done && <p className="mt-3 font-hand">Watching them guess…</p>}

      {done && (
        <div className="mt-4">
          <p className="font-script text-2xl">{resultText}</p>
          <button
            className="btn btn-primary btn-sm mt-2"
            onClick={() => endGame(`Hangman: ${resultText}`)}
          >
            Post result
          </button>
        </div>
      )}
    </div>
  );
}
