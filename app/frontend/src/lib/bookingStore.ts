import { apiPost } from "./api";
import { getSession } from "./authStore";

export interface BookingRequest {
  mentorId: string;
  date: string;
  time: string;
  agenda: string;
  summary?: string;
  notes?: string;
}

export async function requestBooking(payload: BookingRequest): Promise<{ success: boolean; error?: string }> {
  const session = getSession();
  if (!session?.token) {
    return { success: false, error: "Login required" };
  }

  try {
    await apiPost<{ success: boolean; data: { booking: unknown } }>("/bookings", payload);
    return { success: true };
  } catch (err: any) {
    const message = err?.message || "Failed to create booking";
    return { success: false, error: message };
  }
}
