"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TestResultChart from "./TestResultChart";
import { useEffect, useState } from "react";
import { calculateAccuracy, calculateWPM } from "@/utils/typingTestUtil";

interface TypingTestResultProps {
  result: TestResult;
}

export default function TypingTestResult({ result }: TypingTestResultProps) {
  useEffect(() => {
    console.log("reuslt changed =>", result);
  }, [result]);

  return (
    <div className="flex flex-col gap-10 my-20 w-full">
      <div className="flex flex-row gap-4">
        <Card className="dark:bg-transparent  w-full">
          <CardHeader>
            <CardTitle className="text-xl">Typing Result</CardTitle>
            <CardDescription className="inline-block max-w-2xl">
              WPM, or Words Per Minute, is a metric that measures typing speed.
              It is calculated by dividing the total number of words typed by
              the time taken in minutes. This measurement reflects a typist's
              efficiency and proficiency, providing insight into their ability
              to produce text quickly and accurately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p className="">
                <span className="text-3xl font-medium">
                  {result?.wpm ?? "0"}
                </span>{" "}
                <span className="">WPM</span>
              </p>
              <Separator />
              <div className="flex gap-3 items-center">
                <p>
                  <span className="font-medium text-neutral-300">Raw WPM</span>
                  {" - "}
                  <span className="">{result?.rawWPM ?? "-"}</span>
                </p>
                <Separator orientation="vertical" className="h-10" />
                <p>
                  <span className="font-medium">Correct Characters</span>
                  {" - "}
                  <span className=""></span>
                </p>
              </div>
              <Separator />
              <div className="flex gap-3 items-center">
                <p>
                  <span className="font-medium">Accuracy</span>
                  {" - "}
                  <span className="">{result?.accuracy ?? "0"}%</span>
                </p>
                <Separator orientation="vertical" className="h-10" />
                <p>
                  <span className="font-medium">
                    Incorrect Characters(Error)
                  </span>
                  {" -"}
                  <span className="">-</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-transparent  w-full">
          <CardHeader>
            <CardTitle className="text-xl">How is it calculated</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col ">
              <h4 className="font-semibold ">WPM</h4>
              <p className="text-sm  dark:text-neutral-400">
                WPM, or Words Per Minute, is a metric that measures typing
                speed. It is calculated by dividing the total number of words
                typed by the time taken in minutes.{" "}
              </p>
            </div>
            <div className="flex flex-col ">
              <h4 className="font-semibold ">Raw WPM (Raw Words per Minute)</h4>
              <p className="text-sm dark:text-neutral-400">
                Total words typed without subtracting errors, calculated by
                total keystrokes divided by five.
              </p>
            </div>
            <div className="flex flex-col ">
              <h4 className="font-semibold ">Correct Characters</h4>
              <p className="text-sm dark:text-neutral-400">
                Accurately typed characters during typing test or exercise.
              </p>
            </div>
            <div className="flex flex-col ">
              <h4 className="font-semibold ">Accuracy</h4>
              <p className="text-sm dark:text-neutral-400">
                Percentage of correct characters divided by total characters
                typed, multiplied by 100.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {result?.chartResult?.length >= 1 && (
        <div className="flex flex-row gap-4 justify-between">
          <TestResultChart chartData={result.chartResult} />
        </div>
      )}
    </div>
  );
}
