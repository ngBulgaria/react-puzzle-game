import React, { useState, useEffect, useCallback } from "react";
import PuzzlePiece from "./PuzzlePiece";
import { shuffleArray, isAdjacent } from "../utils/puzzleUtils";
import "./Puzzle.css";

function Puzzle() {
  const [imageSrc, setImageSrc] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [emptyIndex, setEmptyIndex] = useState(null);
  const [removedPiece, setRemovedPiece] = useState(null);
  const [puzzleWidth, setPuzzleWidth] = useState(0);
  const [puzzleHeight, setPuzzleHeight] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setImageSrc(e.target.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const createPuzzlePieces = useCallback(() => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const screenMaxWidth = window.innerWidth * 0.95;
      const screenMaxHeight = window.innerHeight * 0.8;

      let puzzleWidth, puzzleHeight;

      if (window.innerWidth > window.innerHeight) {
        // Landscape mode: fit within 80% of screen height
        puzzleHeight = screenMaxHeight;
        puzzleWidth = (image.width * puzzleHeight) / image.height;
        if (puzzleWidth > window.innerWidth * 0.95) {
          puzzleWidth = window.innerWidth * 0.95;
          puzzleHeight = (image.height * puzzleWidth) / image.width;
        }
      } else {
        // Portrait mode: fit within 95% of screen width
        puzzleWidth = screenMaxWidth;
        puzzleHeight = (image.height * puzzleWidth) / image.width;
        if (puzzleHeight > window.innerHeight * 0.95) {
          puzzleHeight = window.innerHeight * 0.95;
          puzzleWidth = (image.width * puzzleHeight) / image.height;
        }
      }

      setPuzzleWidth(puzzleWidth);
      setPuzzleHeight(puzzleHeight);

      const pieceWidth = puzzleWidth / cols;
      const pieceHeight = puzzleHeight / rows;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const newPieces = [];

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          canvas.width = pieceWidth;
          canvas.height = pieceHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            image,
            j * (image.width / cols),
            i * (image.height / rows),
            image.width / cols,
            image.height / rows,
            0,
            0,
            canvas.width,
            canvas.height
          );
          newPieces.push({
            src: canvas.toDataURL(),
            index: i * cols + j,
            position: i * cols + j,
          });
        }
      }

      setPieces(newPieces);
      setEmptyIndex(null); // Reset empty index
      setRemovedPiece(null); // Reset the removed piece when reinitializing
    };
  }, [imageSrc, rows, cols]);

  const randomizePuzzle = () => {
    let newPieces = [...pieces];
    const bottomRightIndex = rows * cols - 1;

    // Remove the bottom-right piece before shuffling and store it
    const removed = newPieces.find((piece) => piece.index === bottomRightIndex);
    setRemovedPiece(removed);
    newPieces = newPieces.filter((piece) => piece.index !== bottomRightIndex);

    // Shuffle the remaining pieces
    newPieces = shuffleArray(newPieces);

    // Reassign positions based on the shuffled order
    newPieces = newPieces.map((piece, index) => ({
      ...piece,
      position: index,
    }));

    // Set the empty index to the bottom-right position
    setEmptyIndex(bottomRightIndex);

    // Update the pieces state with the shuffled pieces
    setPieces(newPieces);
  };

  const checkAndHandleSolvedState = () => {
    if (
      pieces.length === rows * cols - 1 &&
      pieces.every((piece) => piece.position === piece.index)
    ) {
      // Puzzle is solved, add the missing bottom-right piece back
      if (removedPiece) {
        const updatedPieces = [
          ...pieces,
          { ...removedPiece, position: rows * cols - 1 },
        ];
        setPieces(updatedPieces);
        setEmptyIndex(null); // No empty index after the piece is added
      }
    }
  };

  const handlePieceClick = (index) => {
    if (isAdjacent(index, emptyIndex, cols)) {
      const newPieces = [...pieces];
      const pieceIndex = newPieces.findIndex(
        (piece) => piece.position === index
      );

      newPieces[pieceIndex].position = emptyIndex;
      setEmptyIndex(index);
      setPieces(newPieces);

      // Check if the puzzle is solved after moving the piece
      checkAndHandleSolvedState();
    }
  };

  useEffect(() => {
    if (imageSrc) {
      createPuzzlePieces();
    }
  }, [imageSrc, rows, cols, createPuzzlePieces]);

  return (
    <div>
      <div className="puzzle-controls">
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        <label>
          Rows:
          <input
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </label>
        <label>
          Columns:
          <input
            type="number"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
          />
        </label>
        <button onClick={randomizePuzzle}>Randomize</button>
      </div>
      {pieces.length > 0 && (
        <div
          className="puzzle-container"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            width: `${puzzleWidth}px`,
            height: `${puzzleHeight}px`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const piece = pieces.find((piece) => piece.position === index);
            return (
              <PuzzlePiece
                key={index}
                piece={piece}
                handlePieceClick={handlePieceClick}
                isMovable={piece && isAdjacent(index, emptyIndex, cols)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Puzzle;
