type TimeState = "15" | "30" | "60" | "120";
type WordState = "10" | "25" | "50" | "100";
type QuoteState = "short" | "medium" | "long";

interface TestConfig {
  testType: string;
  timerDuration: number;
  wordCount: number;
  quoteLength: string;
  testOngoing: boolean;
  includeCharacters: "none" | "numbers" | "punctuation" | "both";
}

interface TestResult {
  wpm: number;
  rawWPM: number;
  acc: number;
}
