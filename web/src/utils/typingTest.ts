export const calculateGrossWPM = (
  typedEntries: number,
  timeInSeconds: number
) => {
  if (timeInSeconds <= 0) {
    throw new Error("Time must be greater than zero.");
  }

  // Calculate WPM
  const timeInMinutes = timeInSeconds / 60;
  const wpm = typedEntries / 5 / timeInMinutes;

  return wpm;
};

const shuffleWords = (array: string[]) => {
  const seed = 12345; // Fixed seed value for reproducibility
  let shuffledArray = array.slice(); // Create a copy of the original array

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate a pseudo-random index based on the current index and seed
    const randomIndex = Math.floor((Math.sin(seed + i) * 10000) % (i + 1));
    // Swap the current element with the element at the random index
    [shuffledArray[i], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[i],
    ];
  }
  return shuffledArray; // Return the shuffled array
};

export const prepareWords = (array: string[]) => {
  return shuffleWords(array).slice(0, 50);
};
