import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    jobSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    resumeVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interviewing", "offered", "hired", "rejected", "withdrawn"],
      default: "applied",
    },
    answers: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    notes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
