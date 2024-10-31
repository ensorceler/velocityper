"use client";
import TypingTestResult from "./TypingTestResult";
import TypingTestConfiguration from "./TypingTestConfiguration";
import TypingTestBox from "./TypingTestBox";
import { useState } from "react";

export default function TypingTest() {
  const [config, setConfig] = useState<TestConfig>({
    testType: "timer",
    timerDuration: 15,
    wordCount: 50,
    quoteLength: "medium",
    testOngoing: false,
    includeCharacters: "none",
  });

  const [result, setResult] = useState({
    wpm: 0,
    rawWPM: 0,
    acc: 0,
  });

  return (
    <div className="flex flex-col gap-6 mt-10">
      <TypingTestConfiguration config={config} setConfig={setConfig} />
      <TypingTestBox
        config={config}
        setConfig={setConfig}
        result={result}
        setResult={setResult}
      />
      <TypingTestResult result={result} />
    </div>
  );
}
