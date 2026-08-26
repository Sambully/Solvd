"use client";

export const STUDENT_COLOR_PALETTE = [
  { stroke: "#6366f1", bg: "#6366f1", label: "Indigo" },
  { stroke: "#10b981", bg: "#10b981", label: "Emerald" },
  { stroke: "#f43f5e", bg: "#f43f5e", label: "Rose" },
  { stroke: "#f59e0b", bg: "#f59e0b", label: "Amber" },
  { stroke: "#06b6d4", bg: "#06b6d4", label: "Cyan" },
  { stroke: "#8b5cf6", bg: "#8b5cf6", label: "Violet" },
  { stroke: "#f97316", bg: "#f97316", label: "Orange" },
  { stroke: "#14b8a6", bg: "#14b8a6", label: "Teal" },
];

export function getStudentColor(index: number) {
  return STUDENT_COLOR_PALETTE[index % STUDENT_COLOR_PALETTE.length];
}
