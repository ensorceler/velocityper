type TimeState = "15" | "30" | "60" | "120";
type WordState = "10" | "25" | "50" | "100";
type QuoteState = "short" | "medium" | "long";

interface TextState {
  i: number;
  highlighted: boolean;
  word: string;
  right: boolean;
  wrong: boolean;
}

interface TestConfig {
  testType: "timer" | "words" | "quotes";
  timerDuration: number;
  wordCount: number;
  quoteLength: "short" | "medium" | "long";
  testOngoing: boolean;
  includeCharacters: "none" | "numbers" | "punctuation" | "both";
}

interface TestResult {
  chartResult: any[];
  wpm: number;
  rawWPM: number;
  correctChars: number;
  incorrectChars: number;
  accuracy: number;
}

interface ChartGraphData {
  seconds: number;
  wpm: number;
  error: number;
}
