const { body } = require("express-validator");

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email est obligatoire")
    .isEmail()
    .withMessage("email invalide")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("password est obligatoire")
];

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name est obligatoire")
    .isLength({ min: 2, max: 100 })
    .withMessage("name doit contenir entre 2 et 100 caractères"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email est obligatoire")
    .isEmail()
    .withMessage("email invalide")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("password est obligatoire")
    .isLength({ min: 6 })
    .withMessage("password doit contenir au moins 6 caractères"),
  body("role_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("role_id doit être un entier positif")
];

module.exports = { loginValidation, registerValidation };

