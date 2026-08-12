export const DUTY_DAYS = [2, 3, 4]; // Tue, Wed, Thu

export const DUTY_SLOTS = Array.from({ length: 7 }, (_, i) => ({
  start: `${String(10 + i).padStart(2, "0")}:00:00`,
  end: `${String(11 + i).padStart(2, "0")}:00:00`,
})); // hourly 10:00-17:00
