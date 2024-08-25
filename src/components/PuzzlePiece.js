import React from "react";
import "./PuzzlePiece.css";

function PuzzlePiece({ piece, handlePieceClick, isMovable }) {
  const className = `puzzle-piece ${isMovable ? "" : "inactive"}`;

  return (
    <div
      className={className}
      onClick={() => piece && handlePieceClick(piece.position)}
    >
      {piece && (
        <img
          src={piece.src}
          alt={`puzzle-piece-${piece.position}`}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

export default PuzzlePiece;
