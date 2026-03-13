import Resume from "../models/Resume.js";

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ jobSeeker: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { jobSeeker: req.user.id },
      { ...req.body, jobSeeker: req.user.id },
      { new: true, upsert: true },
    );
    res.status(200).json({ message: "Resume saved", resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
