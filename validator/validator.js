import { body, validationResult } from "express-validator";

export const feedsValidationRules = () => {
  return [
    body("name")
      .isLength({ min: 4 })
      .withMessage("feeds name must be at least 4 chars long")
      .exists()
      .withMessage("feeds name is required"),
    body("url")
      .exists()
      .notEmpty()
      .withMessage("URL is required"),
  ];
};

export const userValidationRules = () => {
  // console.log('hi.....', body('name'))
  return [
    body("name")
      .isLength({ min: 5 })
      .withMessage("User name should be at least 5 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("role").exists().withMessage("Role is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .exists()
      .withMessage("Password is required"),
  ];
};



export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return res.status(422).json({
    errors: extractedErrors,
  });
};



