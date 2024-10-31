"use client";

import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";

export const description = "A line chart with dots";

const chartData = [
  { seconds: 0, wpm: 86, error: 80 },
  { seconds: 1, wpm: 90, error: 200 },
  { seconds: 2, wpm: 80, error: 120 },
  { seconds: 3, wpm: 73, error: 190 },
  { seconds: 4, wpm: 75, error: 130 },
  { seconds: 5, wpm: 88, error: 140 },
  { seconds: 6, wpm: 88, error: 140 },
  { seconds: 7, wpm: 89, error: 140 },
  { seconds: 8, wpm: 84, error: 140 },
  { seconds: 9, wpm: 90, error: 140 },
  { seconds: 10, wpm: 88, error: 140 },
  { seconds: 11, wpm: 88, error: 140 },
  { seconds: 12, wpm: 89, error: 140 },
  { seconds: 13, wpm: 84, error: 140 },
  { seconds: 14, wpm: 90, error: 140 },
  { seconds: 15, wpm: 88, error: 140 },
];

const chartConfig = {
  //height: "500px",
  desktop: {
    label: "Desktop",
    color: "#10b981",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function TestResultChart() {
  return (
    <div className="w-full h-80">
      <ChartContainer
        className="h-80 w-full aspect-square"
        config={chartConfig}
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
            top: 0,
            bottom: 15,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="seconds"
            tickLine={true}
            axisLine={false}
            tickMargin={10}
            //tickFormatter={(value) => value.slice(0, 3)}
          >
            <Label value={"Time"} position={"bottom"} offset={0} />
          </XAxis>
          <YAxis
            tickLine={false}
            axisLine={false}
            //tickMargin={8}
            label={{
              value: "WPM (Words Per Minute)",
              angle: -90,
              position: "left",
            }}
            domain={["dataMin - 10", "dataMax + 10"]}
            //domain={["dataMin", "dataMax"]}
          />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="wpm"
            type="natural"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-desktop)",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}