export function calculateCurrentWeek(
  planCreatedAtIso: string,
  weekDuration: number,
  now: Date = new Date(),
): number {
  const start = new Date(planCreatedAtIso);
  const startDateOnly = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const nowDateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysDiff = Math.floor(
    (nowDateOnly.getTime() - startDateOnly.getTime()) / msPerDay,
  );

  const rawWeek = daysDiff <= 0 ? 1 : Math.floor(daysDiff / 7) + 1;
  if (weekDuration > 0) return Math.min(rawWeek, weekDuration);
  return rawWeek;
}
