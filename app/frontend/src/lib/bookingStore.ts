const STORAGE_KEY = "kollab_bookings";

export interface Booking {
  mentorId: string;
  mentorName: string;
  slot: string;
  agenda: string;
  summary: string;
  notes: string;
  createdAt: string;
}

export function getBookings(): Booking[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

export function getBookingsForMentor(mentorId: string): Booking[] {
  return getBookings().filter((b) => b.mentorId === mentorId);
}

export function addBooking(booking: Booking): void {
  const all = getBookings();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...all]));
}
