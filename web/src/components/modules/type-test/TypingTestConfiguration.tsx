"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LapTimerIcon } from "@radix-ui/react-icons";
import {
  Hash as HashIcon,
  AtSignIcon,
  Timer,
  BookA,
  Quote,
} from "lucide-react";
import { Separator } from "../../ui/separator";
import "../../../app/styles/typetest.css";
import { TestConfigTestType } from "@/@types/common";

interface TypingTestConfigurationProps {
  config: TestConfig;
  setConfig: Dispatch<SetStateAction<TestConfig>>;
}

export default function TypingTestConfiguration({
  config,
  setConfig,
}: TypingTestConfigurationProps) {
  const [testType, setTestType] = useState<TestConfigTestType>(
    TestConfigTestType.timer
  );

  // 0: default, 1: numbers, 2: punctuation, 3: both
  const [includeCharacters, setIncludeCharacters] = useState<number>(0);

  const [timerState, setTimerState] = useState<string>(
    config.timerDuration.toString()
  );
  const [wordsState, setWordsState] = useState<string>(
    config.wordCount.toString()
  );
  const [quotesState, setQuotesState] = useState<string>(config.quoteLength);

  const onChangeTestType = (value: string) => {
    if (value !== "") setTestType(value as TestConfigTestType);
  };

  const onChangeTimerState = (val: string) => {
    if (val !== "") setTimerState((timerState) => val as TimeState);
  };

  const onChangeWordsState = (val: string) => {
    if (val !== "") setWordsState(val as WordState);
  };

  const onChangeQuotesState = (val: string) => {
    if (val !== "") setQuotesState(val as QuoteState);
  };

  const onChangeIncludeCharacters = (value: string[]) => {
    //console.log("value =>", value);
    if (value.length === 2) {
      setConfig((p) => ({ ...p, includeCharacters: "both" }));
    } else if (value.length === 1) {
      setConfig((p) => ({
        ...p,
        includeCharacters: value.includes("numbers")
          ? "numbers"
          : "punctuation",
      }));
    } else if (!value.length) {
      setConfig((p) => ({ ...p, includeCharacters: "none" }));
    }
  };

  useEffect(() => {
    setConfig((p) => ({
      ...p,
      testType: testType,
      timerDuration: parseInt(timerState),
      wordCount: parseInt(wordsState),
      quoteLength: quotesState,
    }));
  }, [testType, timerState, wordsState, quotesState]);

  return (
    <div className="bg-neutral-900 px-4 py-2 w-max rounded-md flex flex-row gap-3">
      <ToggleGroup
        className="flex justify-start items-center"
        type="single"
        variant="outline"
        defaultValue="timer"
        value={testType}
        onValueChange={onChangeTestType}
        disabled={config.testOngoing}
      >
        <ToggleGroupItem
          value={TestConfigTestType.timer}
          aria-label="Toggle timer"
          className="toggle-group-item"
        >
          <Timer className="w-4 h-4" />
        </ToggleGroupItem>

        <ToggleGroupItem
          value={TestConfigTestType.words}
          aria-label="Toggle words"
          className="toggle-group-item"
        >
          <BookA className="h-4 w-4" />
        </ToggleGroupItem>

        <ToggleGroupItem
          value={TestConfigTestType.quotes}
          aria-label="Toggle quotes"
          className="toggle-group-item"
        >
          <Quote className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator
        orientation="vertical"
        className="bg-neutral-100 dark:bg-neutral-100 w-[2px]"
      />

      <ToggleGroup
        className="flex justify-start items-center"
        type="multiple"
        variant="outline"
        disabled={config.testOngoing}
        onValueChange={onChangeIncludeCharacters}
      >
        <ToggleGroupItem
          value="numbers"
          aria-label="Toggle numbers"
          className="toggle-group-item"
        >
          <HashIcon className="h-4 w-4" /> numbers
        </ToggleGroupItem>

        <ToggleGroupItem
          value="punctuation"
          aria-label="Toggle punctuation"
          className="toggle-group-item"
        >
          <AtSignIcon className="h-4 w-4" /> punctuation
        </ToggleGroupItem>
      </ToggleGroup>

      {testType === "timer" && (
        <div className="flex gap-3 items-center">
          <LapTimerIcon className="h-5 w-5" />
          <ToggleGroup
            className="flex justify-start items-center"
            type="single"
            variant="outline"
            value={timerState}
            onValueChange={onChangeTimerState}
            disabled={config.testOngoing}
          >
            <ToggleGroupItem
              value="15"
              aria-label="Toggle 15"
              className="toggle-group-item"
            >
              <p>15</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30"
              aria-label="Toggle 30"
              className="toggle-group-item"
            >
              <p>30</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="60"
              aria-label="Toggle 60"
              className="toggle-group-item"
            >
              <p>60</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="120"
              aria-label="Toggle 120"
              className="toggle-group-item"
            >
              <p>120</p>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      {testType === "words" && (
        <ToggleGroup
          className="flex justify-start items-center"
          type="single"
          variant="outline"
          value={wordsState}
          onValueChange={onChangeWordsState}
          disabled={config.testOngoing}
        >
          <ToggleGroupItem
            value="10"
            aria-label="Toggle 10"
            className="toggle-group-item"
          >
            <p>10</p>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="25"
            aria-label="Toggle 25"
            className="toggle-group-item"
          >
            <p>25</p>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="50"
            aria-label="Toggle 50"
            className="toggle-group-item"
          >
            <p>50</p>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="100"
            aria-label="Toggle 100"
            className="toggle-group-item"
          >
            <p>100</p>
          </ToggleGroupItem>
        </ToggleGroup>
      )}
      {testType === "quotes" && (
        <ToggleGroup
          className="flex justify-start items-center"
          type="single"
          variant="outline"
          value={quotesState}
          onValueChange={onChangeQuotesState}
          disabled={config.testOngoing}
        >
          <ToggleGroupItem
            value="short"
            aria-label="Toggle short"
            className="toggle-group-item"
          >
            <p>short</p>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="medium"
            aria-label="Toggle medium"
            className="toggle-group-item"
          >
            <p>medium</p>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="long"
            aria-label="Toggle long"
            className="toggle-group-item"
          >
            <p>long</p>
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
}
