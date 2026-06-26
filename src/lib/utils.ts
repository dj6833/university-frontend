import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? "";
  }
  const firstInitial = parts[0][0] ?? "";
  const lastInitial = parts[parts.length - 1][0] ?? "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}
