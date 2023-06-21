import Chart from "chart.js/auto";
import { useEffect, useMemo } from "react";

export default function ScoresChart({ data }: { data: Record<number | string, number> }) {
  // make all keys * 10
  const ScoreData = useMemo(
    () =>
      Object.entries(data).reduce((acc, [key, value]) => {
        acc[Number(key) * 10] = value;
        return acc;
      }, {} as Record<number, number>),
    [data]
  );

  useEffect(() => {
    const cartElement = document.getElementById("line-chart");
    if (!cartElement) {
      console.error("no cart element");
      return;
    }
    const chart = new Chart(cartElement as HTMLCanvasElement, {
      type: "line",
      data: {
        labels: Object.keys(ScoreData),
        datasets: [
          {
            data: ScoreData,
            label: "כמה קיבלו ככה",
            borderColor: "#759daa",
            fill: false,
          },
        ],
      },
    });
    return () => {
      chart.destroy();
    };
  }, [ScoreData]);

  return <canvas id="line-chart"></canvas>;
}
