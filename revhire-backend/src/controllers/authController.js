import User from "../models/User.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, joinCode } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    let organizationId = null;
    let orgRole = null;

    if (role === "employer") {
      if (companyName) {
        // Create new organization
        const org = await Organization.create({
          name: companyName,
          joinCode: generateJoinCode(),
          members: []
        });
        organizationId = org._id;
        orgRole = "owner";
      } else if (joinCode) {
        // Join existing
        const org = await Organization.findOne({ joinCode: joinCode.toUpperCase() });
        if (!org) return res.status(400).json({ message: "Invalid join code" });
        organizationId = org._id;
        orgRole = "recruiter";
      } else {
        return res.status(400).json({ message: "Employers must provide a Company Name or an Invite Join Code." });
      }
    }

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      organization: organizationId,
      orgRole
    });

    if (organizationId) {
      await Organization.findByIdAndUpdate(organizationId, { $push: { members: user._id } });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role, organizationId: user.organization },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    await user.populate("organization", "name joinCode");

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        orgRole: user.orgRole
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//LOGIN

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email }).populate("organization", "name joinCode");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role, organizationId: user.organization },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        orgRole: user.orgRole
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
