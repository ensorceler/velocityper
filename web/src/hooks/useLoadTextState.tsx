import { prepareQuoteState, prepareWordState } from "@/utils/typingTestUtil";
//import { words } from "../components/modules/type-test/TypeTestWords";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchQuotes, fetchWords } from "@/services/wordService";
import { toast } from "sonner";

// this manages the textstate solely when configuration or other stuff changes
export default function useLoadTextState(testConfig: TestConfig) {
  const [textState, setTextState] = useState<TextState[]>([]);
  //const [quoteType, setQuoteType] = useState<string>("");

  const {
    data: wordsData,
    isLoading: isWordsLoading,
    isError: isWordsError,
    isSuccess: isWordsSuccess,
    error: wordsError,
  } = useQuery({
    queryKey: ["words"],
    queryFn: fetchWords,
  });

  const {
    data: quoteData,
    isSuccess: isQuoteSuccess,
    isLoading: isQuoteLoading,
    isError: isQuoteError,
    error: qoutesError,
  } = useQuery({
    queryKey: ["quotes"],
    queryFn: fetchQuotes,
  });

  useEffect(() => {
    if (isQuoteSuccess && testConfig.testType === "quotes") {
      setTextState(prepareQuoteState(quoteData?.data, testConfig.quoteLength,testConfig?.quoteID));
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

  useEffect(() => {
    if (isQuoteError) {
      toast.error("Error Occurred when fetching Quotes,Please try again", {
        duration: 100000,
      });
    }
    if (wordsError) {
      toast.error(
        "Error Occurred when fetching words data, Please try again!!!",
        {
          duration: 100000,
        }
      );
    }
  }, [qoutesError, wordsError]);

  return {
    textState,
    setTextState,
    isTextStateLoading: isQuoteLoading || isWordsLoading,
  };
}
