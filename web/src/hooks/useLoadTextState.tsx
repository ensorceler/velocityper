import { prepareQuoteState, prepareWordState } from "@/utils/typingTestUtil";
//import { words } from "../components/modules/type-test/TypeTestWords";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchQuotes, fetchWords } from "@/services/wordService";

// this manages the textstate solely when configuration or other stuff changes
export default function useLoadTextState(testConfig: TestConfig) {
  const [textState, setTextState] = useState<TextState[]>([]);
  const [quoteType, setQuoteType] = useState<string>("");

  const {
    data: wordsData,
    isLoading: isWordsLoading,
    isError: isWordsError,
    isSuccess: isWordsSuccess,
  } = useQuery({
    queryKey: ["words"],
    queryFn: fetchWords,
  });

  const {
    data: quoteData,
    isSuccess: isQuoteSuccess,
    isLoading: isQuoteLoading,
    isError: isQuoteError,
  } = useQuery({
    queryKey: ["quotes", quoteType],
    queryFn: fetchQuotes,
  });

  useEffect(() => {
    console.log("testConfig, qoute ", testConfig, quoteData);
    if (isQuoteSuccess && testConfig.testType === "quotes") {
      setTextState(prepareQuoteState(quoteData?.data, testConfig.quoteLength));
    }
    if (
      isWordsSuccess &&
      (testConfig.testType === "words" || testConfig.testType === "timer")
    ) {
      setTextState(
        prepareWordState(wordsData?.data?.words, testConfig.includeCharacters)
      );
    }
  }, [
    testConfig.testType,
    testConfig.quoteLength,
    testConfig.includeCharacters,
    wordsData,
    quoteData,
  ]);

  useEffect(() => {}, [testConfig.includeCharacters]);

  return {
    textState,
    setTextState,
    isTextStateLoading: isQuoteLoading || isWordsLoading,
  };
}
