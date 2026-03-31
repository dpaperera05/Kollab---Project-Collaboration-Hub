import { Request, Response } from "express";
import { Booking } from "../models/booking.model";
import { User } from "../models/user.model";

export const listMemberBookings = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const bookings = await Booking.find({ memberId: userId }).sort({ createdAt: -1 }).lean();

  const mentorIds = bookings.map((b) => b.mentorId);
  const uniqueIds = Array.from(new Set([...mentorIds, userId]));
  const users = await User.find({ _id: { $in: uniqueIds } }, "name").lean();
  const nameMap = new Map<string, string>(users.map((u) => [u._id.toString(), u.name || ""]));

  const enriched = bookings.map((b) => ({
    ...b,
    mentorName: nameMap.get(b.mentorId) || "Mentor",
    memberName: nameMap.get(userId) || "You",
  }));

  return res.json({ success: true, data: { bookings: enriched } });
};

export const listMentorBookings = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const bookings = await Booking.find({ mentorId: userId }).sort({ createdAt: -1 }).lean();

  const memberIds = bookings.map((b) => b.memberId);
  const uniqueUserIds = Array.from(new Set([...memberIds, userId]));
  const users = await User.find({ _id: { $in: uniqueUserIds } }, "name").lean();
  const nameMap = new Map<string, string>(users.map((u) => [u._id.toString(), u.name || ""]));

  const enriched = bookings.map((b) => ({
    ...b,
    memberName: nameMap.get(b.memberId) || "Member",
    mentorName: nameMap.get(b.mentorId) || "You",
  }));

  return res.json({ success: true, data: { bookings: enriched } });
};

export const createBooking = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const { mentorId, date, time, agenda, summary, notes } = req.body || {};
  if (!mentorId || !date || !time) {
    return res.status(400).json({ success: false, message: "mentorId, date, and time are required" });
  }
  const booking = await Booking.create({ memberId: userId, mentorId, date, time, agenda, summary, notes, status: "Pending" });
  return res.status(201).json({ success: true, data: { booking } });
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { status, rejectionReason } = req.body || {};
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  const isMentor = booking.mentorId === userId;
  const isMember = booking.memberId === userId;
  if (!isMentor && !isMember) return res.status(403).json({ success: false, message: "Not allowed" });

  if (status === "Accepted" || status === "Rejected") {
    if (!isMentor) return res.status(403).json({ success: false, message: "Only mentor can accept or reject" });
    booking.status = status;
    booking.rejectionReason = status === "Rejected" ? (typeof rejectionReason === "string" ? rejectionReason.trim() : undefined) : undefined;
  } else if (status === "Completed" || status === "NotCompleted") {
    if (!isMentor) return res.status(403).json({ success: false, message: "Only mentor can complete or mark not completed" });
    booking.status = status;
    booking.rejectionReason = undefined;
  } else if (status === "Canceled") {
    booking.status = "Canceled";
  } else {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  await booking.save();
  return res.json({ success: true, data: { booking } });
};
