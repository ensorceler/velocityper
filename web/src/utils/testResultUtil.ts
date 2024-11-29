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

  graphData.forEach((item) => {
    if (item.second > 0) {
      cummulativeCharTyped = item.numOfCharsTyped;
      cummulativeCorrectCharTyped = item.numOfCharsCorrectlyTyped;
      totalSeconds = item.second;

      const wpm = calculateWPM(cummulativeCorrectCharTyped, totalSeconds);
      const acc = calculateAccuracy(
        cummulativeCharTyped,
        cummulativeCorrectCharTyped
      );

      arr.push({
        wpm: wpm,
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
    correctChars: 0,
    incorrectChars: 0,
  };
};
