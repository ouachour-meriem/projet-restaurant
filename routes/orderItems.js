const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addItemToOrder,
  getOrderItems,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
  validateAddItemToOrder,
  validateOrderItemId,
  validateListOrderItems
} = require("../controllers/orderItemController");

const router = express.Router();

router.get("/", authMiddleware, validateListOrderItems, getOrderItems);
router.get("/:id", authMiddleware, validateOrderItemId, getOrderItemById);
router.post("/", authMiddleware, validateAddItemToOrder, addItemToOrder);
router.put("/:id", authMiddleware, validateOrderItemId, validateAddItemToOrder, updateOrderItem);
router.delete("/:id", authMiddleware, validateOrderItemId, deleteOrderItem);

module.exports = router;