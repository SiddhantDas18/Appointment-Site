// lib/time-utils.ts
// Helper to generate time slots between start and end (24h format, e.g. "08:00")
export function generateTimeSlots(start: string, end: string, interval: number): string[] {
  const slots: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m <= endM)) {
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    m += interval;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}
