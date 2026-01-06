const { body, validationResult } = require("express-validator");

const signUpValidator = [
  body("name").trim().notEmpty().withMessage("Your name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email"),
  body("username").trim().notEmpty().withMessage("username is required"),
  body("password").notEmpty().isLength({ min: 8 })("Minimum 8 characters"),
  body("confirmPass").notEmpty().withMessage("Confirm password"),
];
