const BillingTeamUser = require("../model/BillingTeamUser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const billingTeamRegistration = async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    branch_name,
    branch_state,
    branch_city,
    branch_pincode,
    group,
  } = req.body;

  // Check for missing fields
  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !branch_name ||
    !branch_state ||
    !branch_city ||
    !branch_pincode
  ) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  try {
    // Check if the user already exists
    const isUserAvailable = await BillingTeamUser.findOne({ email });
    if (isUserAvailable) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user instance
    const newUser = new BillingTeamUser({
      name,
      email,
      password,
      phone,
      address,
      branch_name,
      branch_state,
      branch_city,
      branch_pincode,
      group,
    });

    // Save the new user to the database
    const result = await newUser.save();
    const { password: userPassword, ...userWithoutPassword } = result._doc;

    // Respond with success message
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    // Log the error for debugging
    console.error(error);
    // Respond with an error message
    res.status(500).json({ message: "An error occurred during registration" });
  }
};

const deleteAllBillingTeam = async (req, res) => {
  try {
    console.log("Deleting all users...");
    // Delete all users
    const result = await BillingTeamUser.deleteMany();
    console.log(result);

    if (result.deletedCount > 0) {
      return res.status(200).json({
        message: `${result.deletedCount} user(s) deleted successfully`,
      });
    } else {
      return res.status(404).json({ message: "No users found to delete" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const billingTeamLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for missing fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // Find the user by email
    const user = await BillingTeamUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (!user.access) {
      return res.status(401).json({ error: "Admin not authorized" });
    }
    // Check if the password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a token
    const token = generateToken(user._id);
    const { password: userPassword, ...userWithoutPassword } = user._doc;

    // Respond with token and user details
    res.status(200).json({
      message: "Admin logged in successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await BillingTeamUser.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching users",
      error: error.message,
    });
  }
};

const delUserbyId = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await BillingTeamUser.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    await BillingTeamUser.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting user",
      error: error.message,
    });
  }
};

const updateUserById = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    password,
    phone,
    address,
    branch_name,
    branch_state,
    branch_city,
    branch_pincode,
    group,
  } = req.body;

  try {
    const updatedUser = await BillingTeamUser.findByIdAndUpdate(
      id,
      {
        name,
        email,
        password,
        phone,
        address,
        branch_name,
        branch_state,
        branch_city,
        branch_pincode,
        group,
      },
      { new: true }
    );
    const { password: userPassword, ...userWithoutPassword } = updatedUser._doc;
    res.status(200).json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating user",
      error: error.message,
    });
  }
};

const logoutBillingTeam = async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Billing team logged out successfully" });
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await BillingTeamUser.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user._doc;
    res.status(200).json({
      message: "User fetched successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching user",
      error: error.message,
    });
  }
};
const accessBlock = async (req, res) => {
  try {
    const users = await BillingTeamUser.find();

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Update the access field for each user
    for (let user of users) {
      user.access = false;
      await user.save();
    }

    res.status(200).json({ message: "Access Blocked Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const accessUnblock = async (req, res) => {
  try {
    const users = await BillingTeamUser.find();

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Update the access field for each user
    for (let user of users) {
      user.access = true;
      await user.save();
    }

    res.status(200).json({ message: "Access Unblocked Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockAllUser = async (req, res) => {
  const manager = await BillingTeamUser.find();
  manager.forEach(async (m) => {
    m.access = false;
    await m.save();
  });
  res.status(200).json({ message: "All Managers Access Blocked Successfully" });
};

const getUserGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await BillingTeamUser.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json(user.group);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching user group",
      error: error.message,
    });
  }
};

module.exports = {
  billingTeamRegistration,
  billingTeamLogin,
  logoutBillingTeam,
  getUserById,
  updateUserById,
  delUserbyId,
  getAllUsers,
  accessUnblock,
  accessBlock,
  blockAllUser,
  deleteAllBillingTeam,
  getUserGroup,
};
