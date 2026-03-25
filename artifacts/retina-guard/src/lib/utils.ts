import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMedicalDate(dateStr: string | Date) {
  if (!dateStr) return "-";
  try {
    const d = typeof dateStr === "string" 
      ? new Date(dateStr.includes("T") || dateStr.includes("Z") ? dateStr : dateStr.replace(" ", "T") + "Z") 
      : dateStr;
    
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return typeof dateStr === "string" ? dateStr : "-";
  }
}
