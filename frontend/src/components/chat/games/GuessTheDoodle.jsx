import { useEffect, useRef, useState } from "react";
import DrawingCanvas from "../../draw/DrawingCanvas";
import { DOODLE_WORDS } from "../../../constants";

export default function GuessTheDoodle({ role, incoming, sendMove, endGame }) {
  const isDrawer = role === "host";
  const canvasRef = useRef(null);
  const [word] = useState(() => DOODLE_WORDS[Math.floor(Math.random() * DOODLE_WORDS.length)]);
  const [guesses, setGuesses] = useState([]);
  const [entry, setEntry] = useState("");
  const [secsLeft, setSecsLeft] = useState(60);
  const [over, setOver] = useState(null); // "correct" | "timeup"

  useEffect(() => {
    if (over) return undefined;
    const iv = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(iv);
          setOver("timeup");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [over]);

  useEffect(() => {
    const m = incoming?.move;
    if (!m) return;
    if (m.t === "stroke" && !isDrawer) canvasRef.current?.addRemoteStroke(m.stroke);
    if (m.t === "clear" && !isDrawer) canvasRef.current?.applyClear();
    if (m.t === "guess") setGuesses((g) => [...g, m.text]);
    if (m.t === "reveal") setOver("correct");
  }, [incoming, isDrawer]);

  const submitGuess = (e) => {
    e.preventDefault();
    if (!entry.trim()) return;
    setGuesses((g) => [...g, `you: ${entry}`]);
    sendMove({ t: "guess", text: entry.trim() });
    setEntry("");
  };

  const markCorrect = () => {
    setOver("correct");
    sendMove({ t: "reveal", word });
  };

  return (
    <div>
      {isDrawer ? (
        <p className="mb-2 text-center font-hand text-lg">
          Draw: <b className="text-primary">{word}</b> · {secsLeft}s
        </p>
      ) : (
        <p className="mb-2 text-center font-hand text-lg">Guess what they&apos;re drawing · {secsLeft}s</p>
      )}

      <DrawingCanvas
        ref={canvasRef}
        asp={1.4}
        minHeight={220}
        readOnly={!isDrawer || !!over}
        showToolbar={isDrawer && !over}
        onStrokeCommit={(stroke) => isDrawer && sendMove({ t: "stroke", stroke })}
      />

      {isDrawer && !over && (
        <>
          <div className="mt-2 max-h-24 overflow-y-auto rounded bg-base-200 p-2 text-sm">
            {guesses.length ? guesses.map((g, i) => <div key={i}>{g}</div>) : "no guesses yet"}
          </div>
          <button className="btn btn-success btn-sm mt-2 w-full" onClick={markCorrect}>
            Someone got it!
          </button>
        </>
      )}

      {!isDrawer && !over && (
        <form onSubmit={submitGuess} className="mt-2 flex gap-2">
          <input
            className="input input-bordered input-sm flex-1"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="your guess"
          />
          <button className="btn btn-primary btn-sm">Guess</button>
        </form>
      )}

      {!isDrawer && !over && guesses.length > 0 && (
        <div className="mt-2 max-h-20 overflow-y-auto text-sm text-base-content/70">
          {guesses.map((g, i) => (
            <div key={i}>{g}</div>
          ))}
        </div>
      )}

      {over && (
        <div className="mt-3 text-center">
          <p className="font-script text-2xl">
            {over === "correct" ? `It was "${word}"! 🎉` : `Time! It was "${word}".`}
          </p>
          <button
            className="btn btn-primary btn-sm mt-2"
            onClick={() =>
              endGame(`Guess the Doodle: ${over === "correct" ? "guessed" : "not guessed"} (${word})`)
            }
          >
            Post result
          </button>
        </div>
      )}
    </div>
  );
}
