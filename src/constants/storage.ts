export const DATE_LOCALE = "en-GB";

export const DISPLAY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
};

export const SESSION_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

export function formatDate(
  date: Date | string | number = new Date(),
  options: Intl.DateTimeFormatOptions = DISPLAY_DATE_FORMAT,
): string {
  return new Date(date).toLocaleDateString(DATE_LOCALE, options).toUpperCase();
}
