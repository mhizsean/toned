export function durationToParts(totalSeconds: number): {
  minutes: number;
  seconds: number;
} {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return { minutes, seconds };
}

export function durationToSeconds(minutes: number, seconds: number): number {
  return Math.max(0, minutes) * 60 + Math.max(0, seconds);
}

/** Duration label with explicit units, e.g. 45s, 1m, 1m 30s, 10m */
export function formatDuration(totalSeconds: number): string {
  const { minutes, seconds } = durationToParts(totalSeconds);

  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}
