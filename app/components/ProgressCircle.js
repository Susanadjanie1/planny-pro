"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function ProgressCircle({ percentage }) {
  return (
    <div className="w-24 h-24">
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          textColor: "#4B0082",
          pathColor: "#FFD700",
          trailColor: "#eee",
        })}
      />
    </div>
  );
}
