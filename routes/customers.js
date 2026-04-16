const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCustomer,
  validateCreateCustomer,
  getCustomers,
  validateListCustomers,
  getCustomerById,
  validateCustomerId,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customerController");

const router = express.Router();

router.get("/", authMiddleware, validateListCustomers, getCustomers);
router.get("/:id", authMiddleware, validateCustomerId, getCustomerById);
router.post("/", authMiddleware, validateCreateCustomer, createCustomer);
router.put("/:id", authMiddleware, validateCustomerId, validateCreateCustomer, updateCustomer);
router.delete("/:id", authMiddleware, validateCustomerId, deleteCustomer);

module.exports = router;
