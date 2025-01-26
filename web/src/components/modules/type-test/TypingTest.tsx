"use client";

import TypingTestResult from "./TypingTestResult";
import TypingTestConfiguration from "./TypingTestConfiguration";
import TypingTestBox from "./TypingTestBox";
import {useEffect, useState} from "react";
import QueryProvider from "@/components/query-provider";
import useTestConfiguration from "@/hooks/useTestConfiguration";

export default function TypingTest() {
    const [config, setConfig] = useTestConfiguration();

    const [result, setResult] = useState<TestResult>({
        chartResult: [],
        wpm: 0,
        rawWPM: 0,
        correctChars: 0,
        incorrectChars: 0,
        accuracy: 0,
    });

    const [testStatus, setTestStatus] = useState<TestStatus>("upcoming");


    useEffect(() => {
        // temporarilty set the config to strictTyping
        setConfig(c => ({...c, strictTyping: false}))
    }, []);


    return (
        <QueryProvider>
            <div className="flex flex-col gap-6 mt-10">
                <TypingTestConfiguration config={config} setConfig={setConfig}/>
                <TypingTestBox
                    config={config}
                    testStatus={testStatus}
                    setTestStatus={setTestStatus}
                    setConfig={setConfig}
                    setResult={setResult}
                />
                <TypingTestResult result={result} testStatus={testStatus}/>
            </div>
        </QueryProvider>
    );
}
