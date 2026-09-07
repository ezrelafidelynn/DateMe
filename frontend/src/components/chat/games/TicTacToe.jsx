import { useEffect, useState } from "react";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b) {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? "draw" : null;
}

export default function TicTacToe({ role, incoming, sendMove, endGame }) {
  const myMark = role === "host" ? "X" : "O";
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");

  useEffect(() => {
    if (!incoming?.move || incoming.move.i == null) return;
    setBoard((prev) => {
      if (prev[incoming.move.i]) return prev;
      const next = [...prev];
      next[incoming.move.i] = incoming.move.mark;
      return next;
    });
    setTurn(incoming.move.mark === "X" ? "O" : "X");
  }, [incoming]);

  const win = winner(board);

  const play = (i) => {
    if (board[i] || win || turn !== myMark) return;
    const next = [...board];
    next[i] = myMark;
    setBoard(next);
    setTurn(myMark === "X" ? "O" : "X");
    sendMove({ i, mark: myMark });
  };

  const result =
    win === "draw" ? "it was a draw" : win ? `${win} won` : null;

  return (
    <div className="text-center">
      <p className="font-hand text-lg">
        You are <b>{myMark}</b>
        {!win && ` · ${turn === myMark ? "your turn" : "their turn"}`}
      </p>
      <div className="mx-auto mt-3 grid w-52 grid-cols-3 gap-1">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className="grid aspect-square place-items-center rounded-lg border-2 border-base-content/20 font-script text-4xl"
          >
            {cell}
          </button>
        ))}
      </div>
      {win && (
        <div className="mt-4">
          <p className="font-script text-2xl">{result}</p>
          <button className="btn btn-primary btn-sm mt-2" onClick={() => endGame(`Tic-Tac-Toe: ${result}`)}>
            Post result
          </button>
        </div>
      )}
    </div>
  );
}
