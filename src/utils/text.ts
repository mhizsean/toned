export function pluralize(count: number, word: string): string {
  return `${count} ${word}${count !== 1 ? "s" : ""}`;
}

export function stripEmoji(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
}
