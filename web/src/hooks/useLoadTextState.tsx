import { prepareQuoteState, prepareWordState } from "@/utils/typingTestUtil";
import { useEffect, useState } from "react";
import {toast} from "sonner";


export default function useLoadTextState(testConfig: TestConfig) {
    const [textState, setTextState] = useState<TextState[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [wordsData, setWordsData] = useState<any>(null);
    const [quotesData, setQuotesData] = useState<any>(null);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [quotesRes, wordsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/words`)
            ]);
            const [quotes, words] = await Promise.all([
                quotesRes.json(),
                wordsRes.json()
            ]);
            setQuotesData(quotes);
            setWordsData(words);
        } catch (err) {
            toast.error("Error fetching data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!wordsData || !quotesData) return;

        if (testConfig.testType === "quotes" && quotesData?.status === 200) {
            setTextState(prepareQuoteState(quotesData?.data, testConfig.quoteLength, testConfig?.quoteID));
        } else if (testConfig.testType === "words" || testConfig.testType === "timer") {
            setTextState(prepareWordState(wordsData?.data?.words, testConfig.includeCharacters));
        }
    }, [testConfig.testType, testConfig.quoteLength, testConfig.includeCharacters, wordsData, quotesData]);

    return { textState, setTextState, isTextStateLoading: isLoading };
}


// old code
/*
import {prepareQuoteState, prepareWordState} from "@/utils/typingTestUtil";
import {useEffect, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchQuotes, fetchWords} from "@/services/wordService";
import {toast} from "sonner";

// this manages the textstate solely when configuration or other stuff changes
export default function useLoadTextState(testConfig: TestConfig) {
    const [textState, setTextState] = useState<TextState[]>([]);

    const {
        //isFetching,
        data: wordsData,
        isLoading: isWordsLoading,
        isError: isWordsError,
        isSuccess: isWordsSuccess,
        error: wordsError,
    } = useQuery({
        queryKey: ["words"],
        queryFn: fetchWords,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
    });

    const {
        data: quoteData,
        isSuccess: isQuoteSuccess,
        isLoading: isQuoteLoading,
        isError: isQuoteError,
        error: quotesError,
    } = useQuery({
        queryKey: ["quotes"],
        queryFn: fetchQuotes,
    });


    useEffect(() => {
        console.log("useLoadTextState: useEffect Inside useLoadTextState???",)
        console.log("useLoadTextState: isQuoteloading", isQuoteLoading)
        console.log("useLoadTextState: isWordLoading", isWordsLoading);
        //isQuoteSuccess,isWordsSuccess
        //
        if (isQuoteSuccess && testConfig.testType === "quotes" && quoteData?.status == 200) {
            const preparedQuote = prepareQuoteState(quoteData?.data, testConfig.quoteLength, testConfig?.quoteID);
            console.log('useLoadTextState: preparedQuote', preparedQuote)
            setTextState(x => preparedQuote);
        }
        if (
            isWordsSuccess &&
            (testConfig.testType === "words" || testConfig.testType === "timer")
        ) {

            setTextState(
                x =>
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
                duration: 10000,
            });
        }
        if (wordsError) {
            toast.error(
                "Error Occurred when fetching words data, Please try again!!!",
                {
                    duration: 10000,
                }
            );
        }
    }, [quotesError, wordsError]);

    return {
        textState,
        setTextState,
        isTextStateLoading: isQuoteLoading || isWordsLoading,
    };
}
 */