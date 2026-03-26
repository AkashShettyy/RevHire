import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    jobSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Primary Resume",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    objective: { type: String, default: "" },
    education: [
      {
        institution: String,
        degree: String,
        year: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    skills: [{ type: String }],
    projects: [
      {
        name: String,
        description: String,
        link: String,
      },
    ],
    certifications: [{ type: String }],
    uploadedFile: {
      fileName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      size: { type: Number, default: 0 },
      dataUrl: { type: String, default: "" },
      uploadedAt: { type: Date },
    },
  },
  { timestamps: true },
);

resumeSchema.index({ jobSeeker: 1, isDefault: 1 });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
