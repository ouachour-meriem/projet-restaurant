const express = require("express");
const {
  createCategory,
  validateCreateCategory,
  getCategories,
  validateListCategories,
  getCategoryById,
  validateCategoryId,
  validateUpdateCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", validateListCategories, getCategories);
router.post("/", validateCreateCategory, createCategory);
router.get("/:id", validateCategoryId, getCategoryById);
router.put("/:id", validateCategoryId, validateUpdateCategory, updateCategory);
router.delete("/:id", validateCategoryId, deleteCategory);

module.exports = router;
