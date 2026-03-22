import { Schema, model, Document } from "mongoose";

export interface IUserProfile {
  name?: string;
  bio?: string;
  timezone?: string;
  location?: string;
  preferredRoles?: string[];
  skills?: string[];
  techStack?: string[];
  expertiseSkills?: string[];
  links?: { github?: string; linkedin?: string; portfolio?: string };
  availabilityHoursPerWeek?: number;
  domainInterests?: string[];
  avatar?: string;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  userType: "member" | "mentor";
  isEmailVerified: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: string;
  profile?: IUserProfile;
}

const profileSchema = new Schema<IUserProfile>(
  {
    name: { type: String, trim: true },
    bio: { type: String, trim: true },
    timezone: { type: String, trim: true },
    location: { type: String, trim: true },
    preferredRoles: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    techStack: [{ type: String, trim: true }],
    expertiseSkills: [{ type: String, trim: true }],
    links: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },
    availabilityHoursPerWeek: { type: Number, min: 1, max: 80 },
    domainInterests: [{ type: String, trim: true }],
    avatar: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, enum: ["member", "mentor"] },
    isEmailVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: String, default: "/onboarding/role" },
    profile: { type: profileSchema, default: {} },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
