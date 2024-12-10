"use client";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { LoaderCircleIcon, RotateCcw, TimerReset } from "lucide-react";
import formatSeconds from "@/utils/formatSeconds";
import useTypeTestTimer from "@/hooks/useTypeTestTimer";
import { useTypeTestWords } from "@/hooks/useTypeTestWords";
import useTypeTestQuotes from "@/hooks/useTypeTestQuotes";
import useLoadTextState from "@/hooks/useLoadTextState";
import _ from "lodash";

interface TypingTestBoxProps {
  config: TestConfig;
  setConfig: Dispatch<SetStateAction<TestConfig>>;
  setResult: Dispatch<SetStateAction<TestResult>>;
  testStatus: TestStatus;
  setTestStatus: Dispatch<SetStateAction<TestStatus>>;
}

export default function TypingTestBox({
  config,
  testStatus,
  setTestStatus,
  setResult,
}: TypingTestBoxProps) {
  const testConfigRef = useRef(config);

  const [inputShadowState, setInputShadowState] = useState("");
  const [inputStateCounter, setInputStateCounter] = useState(0);

  const [disableInput, setDisableInput] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  const { textState, setTextState, isTextStateLoading } =
    useLoadTextState(config);

  const {
    isTimerTestCompleted,
    countdownTime,
    startTimerTest,
    calculateTimerTestStats,
    timerTestResult,
  } = useTypeTestTimer(config);

  const {
    isWordTestCompleted,
    currWordCount,
    setCurrWordCount,
    startWordTest,
    calculateWordTestStats,
    wordTestResult,
  } = useTypeTestWords(config);

  const {
    isQuoteTestCompleted,
    currQuoteWordCount,
    setCurrQuoteWordCount,
    totalQuoteWordCount,
    startQuoteTest,
    calculateQuoteTestStats,
    quoteTestResult,
  } = useTypeTestQuotes(config, textState);

  // moving the highlight pointer
  const moveHighlightMarker = () => {
    setTextState(
      textState.map((x) => {
        if (x.i == inputStateCounter)
          return {
            ...x,
            highlighted: true,
          };
        else return { ...x, highlighted: false };
      })
    );
  };

  // handles the highlight of the textstate
  useEffect(() => {
    moveHighlightMarker();
  }, [inputStateCounter]);

  const compareTextToInput = () => {
    const tempTextState = textState.map((x) => {
      if (x.i == inputStateCounter) {
        // calculate test stats
        calculateTestStat(x.word, inputShadowState);

        // increment the word count: for word and quote test respectively
        switch (config.testType) {
          case "words":
            setCurrWordCount((w) => w + 1);
            break;
          case "quotes":
            setCurrQuoteWordCount((w) => w + 1);
            break;
        }
        return {
          ...x,
          right: x.word === inputShadowState,
          wrong: x.word !== inputShadowState,
        };
      } else return { ...x };
    });
    setTextState(tempTextState);
  };

  const calculateTestStat = (textWord: string, typedWord: string) => {
    let matchCount = 0;
    /*
      abcdef 
      abc 
      abc
    */
    const minLength = Math.min(textWord?.length, typedWord?.length);

    // Compare characters at the same positions
    for (let i = 0; i < minLength; i++) {
      if (textWord[i] === typedWord[i]) {
        matchCount++;
      }
    }

    switch (config.testType) {
      // case timer
      case "timer":
        //calculateAccuracy
        calculateTimerTestStats(typedWord.length, matchCount, textWord.length);
        break;

      // case words
      case "words":
        // calcualate words
        calculateWordTestStats(typedWord.length, matchCount, textWord.length);
        break;

      case "quotes":
        // calculate quotes
        calculateQuoteTestStats(typedWord.length, matchCount, textWord.length);
        break;
    }
  };

  const onCaptureInputState = (e: KeyboardEvent | any) => {
    //    const avoidableKeys = ["Control", "Shift", "Backspace", "Alt", "Space"];
    // based on test-type

    if (e.code === "Space" && inputShadowState.length) {
      switch (config.testType) {
        case "timer":
          startTimerTest();
          setTestStatus("ongoing");
          break;
        case "words":
          startWordTest();
          setTestStatus("ongoing");
          break;
        case "quotes":
          startQuoteTest();
          setTestStatus("ongoing");
          break;
        default:
      }
      compareTextToInput();
      setInputShadowState("");
      setInputStateCounter((inputStateCounter) => inputStateCounter + 1);
    }
  };

  const reset = () => {
    //setInputState("");
    window.location.reload();
  };

  // test completed handler
  useEffect(() => {
    if (testCompleted) {
      console.log("test completed=>", testCompleted);
      setDisableInput(true);
    }
  }, [testCompleted]);

  useEffect(() => {
    //console.log("isTimer|isWord: ", isTimerCompleted, isWordTestCompleted);
    //if (isTimerCompleted || isWordTestCompleted) {
    switch (config.testType) {
      case "timer":
        if (isTimerTestCompleted && timerTestResult) {
          setResult(timerTestResult);
          setTestCompleted(true);
          setTestStatus("finished");
        }
        break;
      case "words":
        if (isWordTestCompleted && wordTestResult) {
          setResult(wordTestResult);
          setTestCompleted(true);
          setTestStatus("finished");
        }
        break;
      case "quotes":
        if (isQuoteTestCompleted) {
          setResult(quoteTestResult);
          setTestCompleted(true);
          setTestStatus("finished");
        }
        break;
    }
  }, [
    isTimerTestCompleted,
    timerTestResult,
    isWordTestCompleted,
    wordTestResult,
    isQuoteTestCompleted,
    quoteTestResult,
  ]);

  useEffect(() => {
    if (
      (testStatus === "ongoing" || testStatus == "finished") &&
      !_.isEqual(config, testConfigRef.current)
    ) {
      console.log("config changed while typing, must reset everything");
      // has to reset first, separate logic needs to be put here
      window.location.reload();
    } else {
      testConfigRef.current = config;
    }
  }, [testStatus, config]);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-6 py-4 bg-neutral-800/50 rounded-md">
        {textState.length === 0 || isTextStateLoading ? (
          <div className="w-full min-h-16 flex items-center justify-center">
            <LoaderCircleIcon className="h-7 w-7 animate-spin" />
          </div>
        ) : (
          <p className="font-geistMono leading-relaxed text-lg">
            {textState.length >= 1 &&
              textState.map((item, index) => (
                <span key={index}>
                  <span
                    className={cn(
                      item.highlighted && "bg-neutral-700 p-1 px-2 rounded-sm",
                      item.right && "text-green-500",
                      item.wrong && "text-red-500"
                    )}
                  >
                    {item.word}
                  </span>{" "}
                </span>
              ))}
          </p>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <Input
          className="p-6 text-base bg-neutral-800/20 border border-neutral-400 dark:focus:border-emerald-400 dark:focus-visible:ring-emerald-400"
          value={inputShadowState}
          disabled={disableInput}
          onChange={(e) => {
            // don't add space to state
            if (e.target.value.slice(-1) != " ") {
              setInputShadowState(e.target.value);
            }
          }}
          onKeyDownCapture={onCaptureInputState}
        />

        {config.testType === "timer" && (
          <Button className=" bg-neutral-800/50 dark:bg-neutral-800 py-6 dark:hover:bg-neutral-800/50">
            <p className="dark:text-neutral-100 text-lg">
              {formatSeconds(countdownTime)}
            </p>
          </Button>
        )}

        {config.testType === "words" && (
          <Button className=" bg-neutral-800/50 dark:bg-neutral-800 py-6 dark:hover:bg-neutral-800/50">
            <p className="dark:text-neutral-100 text-lg">
              {currWordCount} / {config.wordCount}
            </p>
          </Button>
        )}

        {config.testType === "quotes" && (
          <Button className=" bg-neutral-800/50 dark:bg-neutral-800 py-6 dark:hover:bg-neutral-800/50">
            <p className="dark:text-neutral-100 text-lg">
              {currQuoteWordCount} / {totalQuoteWordCount}
            </p>
          </Button>
        )}

        <Button className="py-6 active:scale-95 group/button" onClick={reset}>
          <RotateCcw className="h-6 w-6 group-active/button:rotate-180 group-active/button:ease-in-out group-active/button:duration-100" />
        </Button>
      </div>
    </div>
  );
}
