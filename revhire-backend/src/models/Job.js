import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceRequired: {
      type: String,
      required: true,
    },
    educationRequired: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
    },
    jobType: {
      type: String,
      enum: ["fulltime", "parttime", "internship", "remote"],
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    screeningQuestions: [
      {
        question: { type: String, required: true },
        requiredAnswer: { type: String, default: "" }, // Expected exact string match for pass/fail. Empty if no strict filter.
      },
    ],
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
