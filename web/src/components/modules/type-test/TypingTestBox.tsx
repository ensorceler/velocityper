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
import { RotateCcw } from "lucide-react";
import formatSeconds from "@/utils/formatSeconds";
import { calculateGrossWPM, prepareWords } from "@/utils/typingTest";
import { words } from "./TypeTestWords";

interface TypingTestBoxProps {
  config: TestConfig;
  setConfig: Dispatch<SetStateAction<TestConfig>>;
  result: TestResult;
  setResult: Dispatch<SetStateAction<TestResult>>;
}

export default function TypingTestBox({ config }: TypingTestBoxProps) {
  const [inputShadowState, setInputShadowState] = useState("");
  const [inputStateCounter, setInputStateCounter] = useState(0);

  // null,true, false -> null: countdown never started, false: countdown stopped, true:countdown running
  const countDownRef = useRef<boolean | null>(null);
  const [countdownTime, setCountdownTime] = useState(config.timerDuration);
  const [startCountDown, setStartCountDown] = useState(false);

  const [disableInput, setDisableInput] = useState(false);

  const [testCompleted, setTestCompleted] = useState(false);

  // textstate -> all the texts that you type[]
  const [textState, setTextState] = useState(
    prepareWords(words).map((word, index) => ({
      i: index,
      highlighted: false,
      word: word,
      right: false,
      wrong: false,
    }))
  );

  const [testStats, setTestStats] = useState({
    numOfCharsTyped: 0,
    totalCharTraversed: 0,
  });

  // compare the textstate and typed input
  const compareTextToInput = () => {
    const tempTextState = textState.map((x) => {
      if (x.i == inputStateCounter) {
        calculateTestStat(x.word, inputShadowState);
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
    // gross typed characters
    setTestStats((p) => ({
      ...p,
      numOfCharsTyped: p.numOfCharsTyped + typedWord.length,
      totalCharTraversed: p.totalCharTraversed + textWord.length,
    }));

    let matchCount = 0;
    const minLength = Math.min(textWord.length, typedWord.length);

    // Compare characters at the same positions
    for (let i = 0; i < minLength; i++) {
      if (textWord[i] === typedWord[i]) {
        matchCount++;
      }
    }
  };

  const onCaptureInputState = (e: KeyboardEvent | any) => {
    const avoidableKeys = ["Control", "Shift", "Backspace", "Alt", "Space"];

    if (countDownRef?.current === null) {
      countDownRef.current = true;
      setStartCountDown(true);
    }

    if (e.code === "Space") {
      if (inputShadowState.length) {
        compareTextToInput();
        setInputShadowState("");
        setInputStateCounter((inputStateCounter) => inputStateCounter + 1);
      }
    }
  };

  const reset = () => {
    //setInputState("");
    setTextState(
      prepareWords(words).map((word, index) => ({
        i: index,
        highlighted: index === 0 ? true : false,
        word: word,
        right: false,
        wrong: false,
      }))
    );
    setInputShadowState("");
    setInputStateCounter(0);
    setDisableInput(false);
  };

  const moveHighlightMarker = () => {
    // moving the highlight pointer
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
    //setTextState(tempTextState);
  };

  // handles the highlight of the textstate
  useEffect(() => {
    moveHighlightMarker();
  }, [inputStateCounter]);

  // timer handler
  useEffect(() => {
    //setTimeout(() => {}, 1000);
    let interval;
    let time = countdownTime;

    // create interval only if startCountDown is true
    if (startCountDown) {
      interval = setInterval(() => {
        if (countDownRef?.current === true) {
          if (time === 0) {
            countDownRef.current = false;
            setStartCountDown(false);
            //setDisableInput((disableInput) => true);
            setTestCompleted((p) => true);
          } else {
            setCountdownTime((countdownTime) => countdownTime - 1);
            time = time - 1;
          }
        }
      }, 1000);
    }

    //clear interval if it exists
    return () => {
      clearInterval(interval!);
    };
  }, [startCountDown]);

  // handles change when config change
  useEffect(() => {
    //console.log("config=>", config);
    setCountdownTime(config.timerDuration);
    // disable typing for non-timer tests for now
    if (config.testType !== "timer") {
      setDisableInput(true);
    } else if (config.testType === "timer") {
      setDisableInput(false);
    }
  }, [config]);

  // test completed handler
  useEffect(() => {
    if (testCompleted) {
      setDisableInput(true);
      console.log("all typed entries =>", testStats);
      const grossWPM = calculateGrossWPM(
        testStats.numOfCharsTyped,
        config.timerDuration
      );

      console.log("gross wpm =>", grossWPM);

      //console.log()
    }
  }, [testCompleted]);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-6 py-4 bg-neutral-800/50 rounded-md">
        <p className="font-geistMono leading-relaxed text-lg">
          {textState.map((item, index) => (
            <React.Fragment key={index}>
              <span
                className={cn(
                  item.highlighted && "bg-neutral-700 p-1 px-2 rounded-sm",
                  item.right && "text-green-500",
                  item.wrong && "text-red-500"
                )}
              >
                {item.word}
              </span>{" "}
            </React.Fragment>
          ))}
        </p>
      </div>

      <div className="flex gap-3 items-center">
        <Input
          className="p-6 text-base bg-neutral-800/20 border border-neutral-400 dark:focus:border-emerald-400 dark:focus-visible:ring-emerald-400"
          value={inputShadowState}
          disabled={disableInput}
          onChange={(e) => {
            if (e.target.value.slice(-1) != " ") {
              setInputShadowState(e.target.value);
            }
          }}
          onKeyDownCapture={onCaptureInputState}
        />

        <Button className=" bg-neutral-800/50 dark:bg-neutral-800 py-6 dark:hover:bg-neutral-800/50">
          <p className="dark:text-neutral-100 text-lg">
            {formatSeconds(countdownTime)}
          </p>
        </Button>

        <Button className="py-6 active:scale-95 group/button" onClick={reset}>
          <RotateCcw className="h-6 w-6 group-active/button:rotate-180 group-active/button:ease-in-out group-active/button:duration-100" />
        </Button>
      </div>
    </div>
  );
}
