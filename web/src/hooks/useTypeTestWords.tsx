import { calculateTestResultFinalData } from "@/utils/testResultUtil";
import { useEffect, useRef, useState } from "react";

interface WordTestResult {
  graphData: any[];
}

export const useTypeTestWords = (testConfig: TestConfig) => {
  const [currWordCount, setCurrWordCount] = useState(0);
  const [totalWordCount, setTotalWordCount] = useState(testConfig.wordCount);

  const [isWordTestCompleted, setIsWordTestCompleted] = useState(false);
  const timeStartedRef = useRef<boolean | null>(null);
  const [timePassed, setTimePassed] = useState(0);

  const [startCountingTime, setStartCountingTime] = useState(false);
  //const [startcoutin]

  const wordTestStatsRef = useRef({
    numOfCharsTyped: 0,
    numOfCharsCorrectlyTyped: 0,
    totalCharTraversed: 0,
  });

  const [statsGraphData, setStatsGraphData] = useState<WordTestResult>({
    graphData: [],
  });

  const [wordTestResult, setWordTestResult] = useState<TestResult>({
    chartResult: [],
    wpm: 0,
    rawWPM: 0,
    correctChars: 0,
    incorrectChars: 0,
    accuracy: 0,
  });

  const startWordTest = () => {
    if (timeStartedRef.current === null) {
      console.log("WORD TEST HAS STARTED!!!");
      timeStartedRef.current = true;
      setStartCountingTime(true);
    } else {
      //console.error("WORD TEST CANNOT BE STARTED!!!");
    }
  };

  const calculateWordTestStats = (
    numberOfCharsTyped: number,
    numberOfCharsCorrectlyTyped: number,
    totalCharsTraversed: number
  ) => {
    wordTestStatsRef.current = {
      numOfCharsTyped:
        wordTestStatsRef.current.numOfCharsTyped + numberOfCharsTyped,
      numOfCharsCorrectlyTyped:
        wordTestStatsRef.current.numOfCharsCorrectlyTyped +
        numberOfCharsCorrectlyTyped,
      totalCharTraversed:
        wordTestStatsRef.current.totalCharTraversed + totalCharsTraversed,
    };
  };

  const calculateFinalResult = () => {
    console.log("WORD TEST RESULT DATA calculated....");

    const finalResult = calculateTestResultFinalData(
      wordTestStatsRef.current.numOfCharsCorrectlyTyped,
      wordTestStatsRef.current.numOfCharsTyped,
      wordTestStatsRef.current.totalCharTraversed,
      timePassed,
      statsGraphData.graphData
    );

    setWordTestResult(finalResult);
  };

  const accumulateWordTestStatsEachSecond = (time: number) => {
    setStatsGraphData((p) => ({
      graphData: [
        ...p.graphData,
        {
          ...wordTestStatsRef.current,
          second: time,
        },
      ],
    }));
  };

  useEffect(() => {
    // time is 0
    let interval;
    let time = 0;

    // create interval only if startCountDown is true
    if (startCountingTime) {
      interval = setInterval(() => {
        if (timeStartedRef.current === true) {
          time = time + 1;
          setTimePassed((t) => t + 1);
          accumulateWordTestStatsEachSecond(time);
        }
      }, 1000);
    }

    //clear interval if it exists
    return () => {
      clearInterval(interval!);
    };
  }, [startCountingTime]);

  useEffect(() => {
    if (currWordCount === totalWordCount) {
      // timeStartedRef set to false
      timeStartedRef.current = false;
      // stop the time count
      setStartCountingTime(false);
      // end the word test
      setIsWordTestCompleted(true);

      calculateFinalResult();
    }
  }, [currWordCount]);

  useEffect(() => {
    if (testConfig.testType === "words") {
      setTotalWordCount(testConfig.wordCount);
    }
  }, [testConfig]);

  useEffect(() => {
    if (isWordTestCompleted) {
      console.log("word test completed =>");
      console.log("test graph", wordTestResult);
      //console.log('test graph',wordTestResult);
    }
  }, [isWordTestCompleted]);

  return {
    isWordTestCompleted,
    currWordCount,
    setCurrWordCount,
    startWordTest,
    calculateWordTestStats,
    wordTestResult,
  };
};
