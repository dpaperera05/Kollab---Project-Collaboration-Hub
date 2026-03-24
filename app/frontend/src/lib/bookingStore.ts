import { apiPost } from "./api";

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

export interface BookingRequest {
  mentorId: string;
  date: string;
  time: string;
  agenda: string;
  summary?: string;
  notes?: string;
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

export async function requestBooking(payload: BookingRequest): Promise<{ success: boolean; error?: string }> {
  try {
    await apiPost<{ success: boolean; data: { booking: unknown } }>("/bookings", payload);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create booking" };
  }
}
