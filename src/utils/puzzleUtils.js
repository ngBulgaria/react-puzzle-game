export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const isAdjacent = (index1, index2, cols) => {
  const row1 = Math.floor(index1 / cols);
  const col1 = index1 % cols;
  const row2 = Math.floor(index2 / cols);
  const col2 = index2 % cols;

  return (
    (row1 === row2 && Math.abs(col1 - col2) === 1) || // Adjacent horizontally
    (col1 === col2 && Math.abs(row1 - row2) === 1) // Adjacent vertically
  );
};
