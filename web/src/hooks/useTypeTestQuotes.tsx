import {calculateRaceUpdateResult, calculateTestResultFinalData} from "@/utils/testResultUtil";
import {useEffect, useRef, useState} from "react";
import {useSocketState} from "@/global-state/socketState";

interface QouteTestGraphData {
    graphData: any[];
}

export default function useTypeTestQuotes(
    testConfig: TestConfig,
    textState: TextState[]
) {
    //const [quotes, setQuotes] = useState("");
    const [currQuoteWordCount, setCurrQuoteWordCount] = useState(0);

    const [totalQuoteWordCount, setTotalQuoteWordCount] = useState(
        testConfig.wordCount
    );
    const [totalQuoteCharsCount, setTotalQuoteCharsCount] = useState(0);

    const [isQuoteTestCompleted, setIsQuoteTestCompleted] = useState(false);

    const timeStartedRef = useRef<boolean | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const [startCountingTime, setStartCountingTime] = useState(false);

    const quoteTestStatsRef = useRef({
        numOfCharsTyped: 0,
        numOfCharsCorrectlyTyped: 0,
        totalCharTraversed: 0,
    });

    const [statsGraphData, setStatsGraphData] = useState<QouteTestGraphData>({
        graphData: [],
    });

    const [quoteTestResult, setQuoteTestResult] = useState<TestResult>({
        chartResult: [],
        wpm: 0,
        rawWPM: 0,
        accuracy: 0,
        correctChars: 0,
        incorrectChars: 0,
    });
    const {sendSocketMessage, connectionStatus} = useSocketState()

    const startQuoteTest = () => {
        if (timeStartedRef.current === null) {
            console.log("Quote TEST HAS STARTED!!!");
            timeStartedRef.current = true;
            setStartCountingTime(true);
        } else {
            //console.error("WORD TEST CANNOT BE STARTED!!!");
        }
    };

    const calculateQuoteTestStats = (
        numberOfCharsTyped: number,
        numberOfCharsCorrectlyTyped: number,
        totalCharsTraversed: number
    ) => {
        quoteTestStatsRef.current = {
            numOfCharsTyped:
                quoteTestStatsRef.current.numOfCharsTyped + numberOfCharsTyped,
            numOfCharsCorrectlyTyped:
                quoteTestStatsRef.current.numOfCharsCorrectlyTyped +
                numberOfCharsCorrectlyTyped,
            totalCharTraversed:
                quoteTestStatsRef.current.totalCharTraversed + totalCharsTraversed,
        };
    };

    const calculateFinalResult = () => {
        //console.log("final quote result quoteTestStatsRef -->",quoteTestStatsRef.current);
        const finalResult = calculateTestResultFinalData(
            quoteTestStatsRef.current.numOfCharsCorrectlyTyped,
            quoteTestStatsRef.current.numOfCharsTyped,
            quoteTestStatsRef.current.totalCharTraversed,
            timeElapsed,
            statsGraphData.graphData
        );
        setQuoteTestResult(finalResult);
    };

    const accumulateWordTestStatsEachSecond = (time: number) => {
        //console.
        setStatsGraphData((p) => ({
            graphData: [
                ...p.graphData,
                {
                    ...quoteTestStatsRef.current,
                    second: time,
                },
            ],
        }));
    };
    //const accumulateWordTestStatsEachSecond=()
    const sendSocketUpdateToRoomServer = (time: number) => {
        //console.log('quote test data =>', quoteTestStatsRef.current);
        const updateResult = calculateRaceUpdateResult(quoteTestStatsRef.current.numOfCharsCorrectlyTyped,
            quoteTestStatsRef.current.numOfCharsTyped,
            quoteTestStatsRef.current.totalCharTraversed,
            totalQuoteCharsCount,
            time
        )

        if (connectionStatus === WebSocket.OPEN) {
            console.log('send socket data before =>',
                quoteTestStatsRef.current.numOfCharsTyped,
                quoteTestStatsRef.current.totalCharTraversed,
                totalQuoteCharsCount,
                time
            );

            console.log('send socket data =>', updateResult);
            //console.log(' ')
            sendSocketMessage(JSON.stringify({
                "event_type": "broadcast.racedata",
                "message": JSON.stringify(updateResult)
            }))
            if (updateResult.traversal_percentage === 100) {
                sendSocketMessage(JSON.stringify({
                    "event_type": "finished.race",
                }))
            }
        }
    }


    useEffect(() => {
        // time is 0
        let interval;
        let time = 0;

        // create interval only if startCountDown is true
        if (startCountingTime) {
            interval = setInterval(() => {
                if (timeStartedRef.current === true) {
                    time = time + 1;
                    setTimeElapsed((t) => t + 1);
                    accumulateWordTestStatsEachSecond(time);
                    if (testConfig?.isTypingRace) {
                        sendSocketUpdateToRoomServer(time);
                    }
                }
            }, 1000);
        }

        //clear interval if it exists
        return () => {
            clearInterval(interval!);
        };
    }, [startCountingTime]);

    useEffect(() => {
        if (currQuoteWordCount === totalQuoteWordCount) {
            // timeStartedRef set to false
            timeStartedRef.current = false;
            // stop the time count
            setStartCountingTime(false);
            // end the word test
            setIsQuoteTestCompleted(true);
            // calculate final result
            calculateFinalResult();
            if (testConfig?.isTypingRace) {
                sendSocketUpdateToRoomServer(timeElapsed);
            }
        }
    }, [currQuoteWordCount]);

    useEffect(() => {
        setTotalQuoteWordCount(textState.length);
        //console.log('textState watch=>',textState );
        //console.log('textState chars count',textState.reduce((acc, str) => acc + str.word.length, 0))
        setTotalQuoteCharsCount(textState.reduce((acc, str) => acc + str.word.length, 0));

    }, [textState]);

    useEffect(() => {
        if (isQuoteTestCompleted) {
            console.log("test graph =>", quoteTestResult);
        }
    }, [isQuoteTestCompleted]);

    return {
        isQuoteTestCompleted,
        currQuoteWordCount,
        setCurrQuoteWordCount,
        totalQuoteWordCount,
        startQuoteTest,
        calculateQuoteTestStats,
        quoteTestResult,
    };
}
