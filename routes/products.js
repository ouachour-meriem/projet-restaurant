const express = require("express");
const {
  createProduct,
  validateCreateProduct,
  getProducts,
  validateListProducts,
  getProductById,
  validateProductId,
  validateUpdateProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

router.get("/", validateListProducts, getProducts);
router.post("/", validateCreateProduct, createProduct);
router.get("/:id", validateProductId, getProductById);
router.put("/:id", validateProductId, validateUpdateProduct, updateProduct);
router.delete("/:id", validateProductId, deleteProduct);

module.exports = router;
