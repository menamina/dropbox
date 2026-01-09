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
  body("password")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isLength({ min: 8 })
    .withMessage("Minimum 8 characters"),
  body("confirmPass").notEmpty().withMessage("Confirm password"),

  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", {
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  signUpValidator,
};
