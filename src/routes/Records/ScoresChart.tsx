import Chart from "chart.js/auto";
import { useEffect } from "react";

export default function ScoresChart({ data }: { data: any[] }) {
  useEffect(() => {
    const cartElement = document.getElementById("line-chart");
    if (!cartElement) {
      console.error("no cart element");
      return;
    }
    const chart = new Chart(cartElement as HTMLCanvasElement, {
      type: "line",
      data: {
        labels: Array.from({ length: 165 }, (_, i) => i * 10),
        datasets: [
          {
            data: data,
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
  }, []);

  return <canvas id="line-chart"></canvas>;
}
