import { calculateTestResultFinalData } from "@/utils/testResultUtil";
import { calculateAccuracy, calculateWPM } from "@/utils/typingTestUtil";
import { useState, useRef, useEffect } from "react";

interface TimerTestStats {
  numOfCharsTyped: number;
  numOfCharsCorrectlyTyped: number;
  totalCharTraversed: number;
  second?: number;
}

interface TimerTestResult {
  graphData: any[];
}

const useTypeTestTimer = (testConfig: TestConfig) => {
  // countdownRef: null, true, false
  const countDownRef = useRef<boolean | null>(null);
  const [countdownTime, setCountdownTime] = useState(testConfig.timerDuration);

  const [startCountDown, setStartCountDown] = useState(false);
  const [isTimerTestCompleted, setIsTimerTestCompleted] = useState(false);

  const [totalTime, setTotalTime] = useState(testConfig.timerDuration);

  const timerTestStatsRef = useRef({
    numOfCharsTyped: 0,
    numOfCharsCorrectlyTyped: 0,
    totalCharTraversed: 0,
  });

  const [statsGraphData, setStatsGraphData] = useState<TimerTestResult>({
    graphData: [],
  });

  const [timerTestResult, setTimerTestResult] = useState<TestResult>({
    accuracy: 0,
    chartResult: [],
    correctChars: 0,
    incorrectChars: 0,
    rawWPM: 0,
    wpm: 0,
  });

  // ref for storing the test-stats every time

  const startTimerTest = () => {
    if (countDownRef.current === null) {
      //console.log()
      countDownRef.current = true;
      setStartCountDown(true);
    } else {
      //console.error("TIMER TEST CANNOT BE STARTED!!!");
    }
  };

  const calculateTimerTestStats = (
    numberOfCharsTyped: number,
    numberOfCharsCorrectlyTyped: number,
    totalCharsTraversed: number
  ) => {
    // update the timerTestRef for current result
    timerTestStatsRef.current = {
      numOfCharsTyped:
        timerTestStatsRef.current.numOfCharsTyped + numberOfCharsTyped,
      numOfCharsCorrectlyTyped:
        timerTestStatsRef.current.numOfCharsCorrectlyTyped +
        numberOfCharsCorrectlyTyped,
      totalCharTraversed:
        timerTestStatsRef.current.totalCharTraversed + totalCharsTraversed,
    };
  };

  const finalCalculation = () => {
    //console.log("timer test result=>", statsGraphData);
    const finalResult = calculateTestResultFinalData(
      timerTestStatsRef.current.numOfCharsCorrectlyTyped,
      timerTestStatsRef.current.numOfCharsTyped,
      timerTestStatsRef.current.totalCharTraversed,
      totalTime,
      statsGraphData.graphData
    );
    console.log("final result =>", finalResult);
    setTimerTestResult(finalResult);
  };

  const accumulateTimerTestStatsEachSecond = (time: number) => {
    setStatsGraphData((p) => ({
      graphData: [
        ...p.graphData,
        {
          ...timerTestStatsRef.current,
          second: totalTime - time,
        },
      ],
    }));
  };

  // timer handler
  useEffect(() => {
    //setTimeout(() => {}, 1000);
    let interval;
    let time = countdownTime;

    // create interval only if startCountDown is true
    if (startCountDown) {
      interval = setInterval(() => {
        // when time reaches 0
        if (time === 0) {
          countDownRef.current = false;
          //accumulateTimerTestStatsEachSecond(time);
          setStartCountDown(false);
          setIsTimerTestCompleted(true);
          //finalCalculation();
        } else {
          setCountdownTime((countdownTime) => countdownTime - 1);
          time = time - 1;
          accumulateTimerTestStatsEachSecond(time);
        }
      }, 1000);
    }

    //clear interval if it exists
    return () => {
      clearInterval(interval!);
    };
  }, [startCountDown]);

  useEffect(() => {
    if (testConfig.testType === "timer") {
      setTotalTime(testConfig.timerDuration);
      setCountdownTime(testConfig.timerDuration);
    }
  }, [testConfig]);

  useEffect(() => {
    if (isTimerTestCompleted) {
      finalCalculation();
      //console.log("test result =>", statsGraphData);
    }
  }, [isTimerTestCompleted]);

  return {
    isTimerTestCompleted,
    countdownTime,
    startTimerTest,
    calculateTimerTestStats,
    timerTestResult,
  };
};
export default useTypeTestTimer;
