import { calculateAccuracy, calculateWPM } from "./typingTestUtil";

export const calculateTestResultFinalData = (
  numOfCharsCorrectlyTyped: number,
  numOfCharsTyped: number,
  totalCharsTraversed: number,
  timePassed: number,
  graphData: any[]
): TestResult => {
  const grossWPM = calculateWPM(numOfCharsTyped, timePassed);
  const netWPM = calculateWPM(numOfCharsCorrectlyTyped, timePassed);
  const accuracy = calculateAccuracy(numOfCharsTyped, numOfCharsCorrectlyTyped);

  let arr: any[] = [];

  let cummulativeCharTyped = 0;
  let cummulativeCorrectCharTyped = 0;
  let totalSeconds = 0;

  console.log("GRAPH before ", graphData);

  graphData.forEach((item) => {
    if (item.second > 0) {
      cummulativeCharTyped = item.numOfCharsTyped;
      cummulativeCorrectCharTyped = item.numOfCharsCorrectlyTyped;
      totalSeconds = item.second;

      const wpm = calculateWPM(cummulativeCorrectCharTyped, totalSeconds);
      const grossWPM = calculateWPM(cummulativeCharTyped, totalSeconds);
      const acc = calculateAccuracy(
        cummulativeCharTyped,
        cummulativeCorrectCharTyped
      );

      arr.push({
        wpm: Math.round(wpm),
        rawWPM: Math.round(grossWPM),
        seconds: totalSeconds,
        accuracy: acc,
      });
    }
  });

  return {
    chartResult: arr,
    wpm: netWPM,
    rawWPM: grossWPM,
    accuracy: accuracy,
    correctChars: numOfCharsCorrectlyTyped,
    incorrectChars: numOfCharsTyped - numOfCharsCorrectlyTyped,
  };
};
