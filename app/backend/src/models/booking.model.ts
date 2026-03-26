import { Schema, model, Document } from "mongoose";

export type BookingStatus = "Pending" | "Accepted" | "Rejected" | "Canceled" | "Completed" | "NotCompleted";

export interface IBooking extends Document {
  memberId: string;
  mentorId: string;
  date: string;
  time: string;
  agenda?: string;
  summary?: string;
  notes?: string;
  status: BookingStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    memberId: { type: String, ref: "User", required: true, index: true },
    mentorId: { type: String, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    agenda: { type: String, trim: true },
    summary: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Canceled", "Completed", "NotCompleted"], default: "Pending" },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
