import mongoose from "mongoose";
import { ROLES } from "../../lib/constants"

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.MEMBER,
  },

  // Add these new fields for password reset functionality
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
