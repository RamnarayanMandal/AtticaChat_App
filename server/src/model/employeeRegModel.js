const mongoose = require("mongoose");

const employeeRegSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the user name"],
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
    confirmPassword: {
      type: String,
      required: [true, "Please add the user confirm password"],
    },
    employeeId: {
      type: String,
      required: [true, "Please add the user employee code"],
      unique: true,
    },
    state: {
      type: String,
    },
    language: {
      type: String,
      default: "",
    },
    group: [
      {
        name: {
          type: String,
        },
        grade: {
          type: String,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    access: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("EmployeeRegistration", employeeRegSchema);
