"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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
  // track mounted status
  const mountRef = useRef<null | boolean>(null);

  const [loading, setLoading] = useState(true);
  // 0: default, 1: numbers, 2: punctuation, 3: both
  const [includeCharacters, setIncludeCharacters] =
    useState<TestConfig["includeCharacters"]>("none");

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
    if (val !== "") setTimerState(val as TimeState);
  };

  const onChangeWordsState = (val: string) => {
    if (val !== "") setWordsState(val as WordState);
  };

  const onChangeQuotesState = (val: string) => {
    if (val !== "") setQuotesState(val as QuoteState);
  };

  const onChangeIncludeCharacters = (value: string[]) => {
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

  const updateConfigParamsAtMount = () => {
    if (mountRef.current === null) {
      mountRef.current = true;
      const configFromStorage = localStorage.getItem("test-config");
      if (configFromStorage !== null) {
        try {
          const parsedConfig = JSON.parse(configFromStorage);
          setTestType(parsedConfig?.testType);
          setTimerState(parsedConfig?.timerDuration?.toString());
          setWordsState(parsedConfig?.wordCount?.toString());
          setQuotesState(parsedConfig?.quoteLength?.toString());
          setIncludeCharacters(parsedConfig?.includeCharacters);
        } catch {
          console.error("ERROR at updateConfigParamsAtMount");
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    const prevConfig = config;
    // Only update if the new values are different from previous config
    if (
      testType !== prevConfig.testType ||
      parseInt(timerState) !== prevConfig.timerDuration ||
      parseInt(wordsState) !== prevConfig.wordCount ||
      quotesState !== prevConfig.quoteLength
    ) {
      console.log("update at config not needed");
      setConfig((p) => ({
        ...p,
        testType: testType,
        timerDuration: parseInt(timerState),
        wordCount: parseInt(wordsState),
        quoteLength: quotesState as TestConfig["quoteLength"],
        includeCharacters: includeCharacters,
      }));
    }
    // Return previous config if no changes
  }, [testType, timerState, wordsState, quotesState]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
    updateConfigParamsAtMount();
  }, []);

  return loading ? (
    <div className="bg-neutral-900 w-96 px-4 h-7 rounded-md flex flex-row gap-3 animate-pulse"></div>
  ) : (
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

      {(testType === "timer" || testType === "words") && (
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
      )}

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
