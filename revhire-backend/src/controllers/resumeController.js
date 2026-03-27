import Resume from "../models/Resume.js";

export const getResume = async (req, res) => {
  try {
    const resumes = await Resume.find({ jobSeeker: req.user.id }).sort({
      isDefault: -1,
      updatedAt: -1,
    });

    res.status(200).json({
      resumes,
      resume: resumes[0] || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateResume = async (req, res) => {
  try {
    const { resumeId, setAsDefault = false, uploadedFile, ...resumePayload } = req.body;

    if (uploadedFile?.dataUrl && uploadedFile.dataUrl.length > 3_000_000) {
      return res.status(400).json({ message: "Uploaded file is too large" });
    }

    if (setAsDefault) {
      await Resume.updateMany({ jobSeeker: req.user.id }, { isDefault: false });
    }

    let resume;

    if (resumeId) {
      const normalizedTitle = resumePayload.title?.trim();
      resume = await Resume.findOneAndUpdate(
        { _id: resumeId, jobSeeker: req.user.id },
        {
          ...resumePayload,
          title: normalizedTitle || "Resume Version 1",
          jobSeeker: req.user.id,
          ...(setAsDefault ? { isDefault: true } : {}),
          ...(uploadedFile
            ? {
                uploadedFile: {
                  ...uploadedFile,
                  uploadedAt: uploadedFile.dataUrl ? new Date() : undefined,
                },
              }
            : {}),
        },
        { returnDocument: "after" },
      );
    } else {
      const existingCount = await Resume.countDocuments({ jobSeeker: req.user.id });
      const normalizedTitle = resumePayload.title?.trim();
      resume = await Resume.create({
        ...resumePayload,
        title: normalizedTitle || `Resume Version ${existingCount + 1}`,
        jobSeeker: req.user.id,
        isDefault: setAsDefault || existingCount === 0,
        uploadedFile: uploadedFile?.dataUrl
          ? {
              ...uploadedFile,
              uploadedAt: new Date(),
            }
          : undefined,
      });
    }

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumes = await Resume.find({ jobSeeker: req.user.id }).sort({
      isDefault: -1,
      updatedAt: -1,
    });

    res.status(200).json({ message: "Resume saved", resume, resumes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      jobSeeker: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const fallbackResume = await Resume.findOne({ jobSeeker: req.user.id }).sort({
      updatedAt: -1,
    });

    if (resume.isDefault && fallbackResume) {
      fallbackResume.isDefault = true;
      await fallbackResume.save();
    }

    const resumes = await Resume.find({ jobSeeker: req.user.id }).sort({
      isDefault: -1,
      updatedAt: -1,
    });

    res.status(200).json({ message: "Resume deleted", resumes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
