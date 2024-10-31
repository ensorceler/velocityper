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

interface TypingTestResultProps {
  result: TestResult;
}

export default function TypingTestResult({}: TypingTestResultProps) {
  return (
    <div className="flex flex-col gap-10 my-20">
      <div className="flex flex-col">
        <Card className="dark:bg-transparent w-max">
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
                <span className="text-3xl font-medium">0</span>{" "}
                <span className="">WPM</span>
              </p>
              <Separator />
              <div className="flex gap-3 items-center">
                <p>
                  <span className="font-medium">Raw WPM</span>{" "}
                  <span className="">-</span>
                </p>
                <Separator orientation="vertical" className="h-10" />
                <p>
                  <span className="font-medium">Correct Characters</span>{" "}
                  <span className="">-</span>
                </p>
              </div>
              <Separator />
              <p>
                <span className="font-medium">Incorrect Characters(Error)</span>{" "}
                <span className="">-</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-row gap-4 justify-between">
        <TestResultChart />
      </div>
    </div>
  );
}
