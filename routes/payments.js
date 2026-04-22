const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  listPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  validateCreatePayment,
  validateUpdatePayment
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/", authMiddleware, listPayments);
router.post("/", authMiddleware, validateCreatePayment, createPayment);
router.get("/:id", authMiddleware, getPaymentById);
router.put("/:id", authMiddleware, validateUpdatePayment, updatePayment);
router.delete("/:id", authMiddleware, deletePayment);

module.exports = router;