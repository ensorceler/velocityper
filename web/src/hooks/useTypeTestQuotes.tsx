import { fetchQuotes } from "@/services/wordService";
import { calculateTestResultFinalData } from "@/utils/testResultUtil";
import { calculateWPM } from "@/utils/typingTestUtil";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface QouteTestGraphData {
  graphData: any[];
}

export default function useTypeTestQuotes(
  testConfig: TestConfig,
  textState: TextState[]
) {
  //const [quotes, setQuotes] = useState("");
  const [currQuoteWordCount, setCurrQuoteWordCount] = useState(0);
  const [totalQuoteWordCount, setTotalQuoteWordCount] = useState(
    testConfig.wordCount
  );

  const [isQuoteTestCompleted, setIsQuoteTestCompleted] = useState(false);

  const timeStartedRef = useRef<boolean | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [startCountingTime, setStartCountingTime] = useState(false);

  const quoteTestStatsRef = useRef({
    numOfCharsTyped: 0,
    numOfCharsCorrectlyTyped: 0,
    totalCharTraversed: 0,
  });

  const [statsGraphData, setStatsGraphData] = useState<QouteTestGraphData>({
    graphData: [],
  });

  const [quoteTestResult, setQuoteTestResult] = useState<TestResult>({
    chartResult: [],
    wpm: 0,
    rawWPM: 0,
    accuracy: 0,
    correctChars: 0,
    incorrectChars: 0,
  });

  const startQuoteTest = () => {
    if (timeStartedRef.current === null) {
      console.log("WORD TEST HAS STARTED!!!");
      timeStartedRef.current = true;
      setStartCountingTime(true);
    } else {
      //console.error("WORD TEST CANNOT BE STARTED!!!");
    }
  };

  const calculateQuoteTestStats = (
    numberOfCharsTyped: number,
    numberOfCharsCorrectlyTyped: number,
    totalCharsTraversed: number
  ) => {
    quoteTestStatsRef.current = {
      numOfCharsTyped:
        quoteTestStatsRef.current.numOfCharsTyped + numberOfCharsTyped,
      numOfCharsCorrectlyTyped:
        quoteTestStatsRef.current.numOfCharsCorrectlyTyped +
        numberOfCharsCorrectlyTyped,
      totalCharTraversed:
        quoteTestStatsRef.current.totalCharTraversed + totalCharsTraversed,
    };
  };

  const calculateFinalResult = () => {
    const finalResult = calculateTestResultFinalData(
      quoteTestStatsRef.current.numOfCharsCorrectlyTyped,
      quoteTestStatsRef.current.numOfCharsTyped,
      quoteTestStatsRef.current.totalCharTraversed,
      timeElapsed,
      statsGraphData.graphData
    );
    setQuoteTestResult(finalResult);
  };

  const accumulateWordTestStatsEachSecond = (time: number) => {
    setStatsGraphData((p) => ({
      graphData: [
        ...p.graphData,
        {
          ...quoteTestStatsRef.current,
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
          setTimeElapsed((t) => t + 1);
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
    if (currQuoteWordCount === totalQuoteWordCount) {
      // timeStartedRef set to false
      timeStartedRef.current = false;
      // stop the time count
      setStartCountingTime(false);
      // end the word test
      setIsQuoteTestCompleted(true);
      // calculate final result
      calculateFinalResult();
    }
  }, [currQuoteWordCount]);

  useEffect(() => {
    setTotalQuoteWordCount(textState.length);
  }, [textState]);

  useEffect(() => {
    if (isQuoteTestCompleted) {
      console.log("test graph =>", quoteTestResult);
    }
  }, [isQuoteTestCompleted]);

  return {
    isQuoteTestCompleted,
    currQuoteWordCount,
    setCurrQuoteWordCount,
    totalQuoteWordCount,
    startQuoteTest,
    calculateQuoteTestStats,
    quoteTestResult,
  };
}
