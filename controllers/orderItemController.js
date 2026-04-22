const { body, param, query, validationResult } = require("express-validator");
const Order = require("../models/order");
const Product = require("../models/product");
const OrderItem = require("../models/orderItem");

const validateAddItemToOrder = [
  body("quantity")
    .exists({ checkFalsy: true })
    .withMessage("quantity est obligatoire")
    .bail()
    .isInt({ allow_leading_zeroes: false })
    .withMessage("quantity doit etre un entier")
    .bail()
    .custom((value) => Number(value) > 0)
    .withMessage("quantity doit etre > 0")
    .toInt(),

  body("price")
    .exists({ checkFalsy: true })
    .withMessage("price est obligatoire")
    .bail()
    .isNumeric()
    .withMessage("price doit etre numerique")
    .bail()
    .custom((value) => Number(value) > 0)
    .withMessage("price doit etre > 0")
    .toFloat(),

  body("order_id")
    .exists({ checkFalsy: true })
    .withMessage("order_id est obligatoire")
    .bail()
    .isInt()
    .withMessage("order_id doit etre un entier")
    .bail()
    .custom((value) => Number(value) > 0)
    .withMessage("order_id doit etre > 0")
    .toInt(),

  body("product_id")
    .exists({ checkFalsy: true })
    .withMessage("product_id est obligatoire")
    .bail()
    .isInt()
    .withMessage("product_id doit etre un entier")
    .bail()
    .custom((value) => Number(value) > 0)
    .withMessage("product_id doit etre > 0")
    .toInt()
];

const validateOrderItemId = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("id est obligatoire")
    .bail()
    .isInt()
    .withMessage("id doit etre un entier")
    .bail()
    .custom((value) => Number(value) > 0)
    .withMessage("id doit etre > 0")
    .toInt()
];

const validateListOrderItems = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page doit etre un entier >= 1")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit doit etre entre 1 et 100")
    .toInt()
];

const addItemToOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: errors.array()
      });
    }

    const { quantity, price, order_id, product_id } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    const item = await OrderItem.create({ quantity, price, order_id, product_id });
    return res.status(201).json({ message: "Article ajoute a la commande", data: item });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'ajout de l'article",
      error: error.message
    });
  }
};

const getOrderItems = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: errors.array()
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await OrderItem.findAndCountAll({
      limit,
      offset,
      order: [["id", "DESC"]],
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["id", "order_date", "status", "total_amount", "customer_id"],
          required: false
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price"],
          required: false
        }
      ]
    });

    return res.status(200).json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la recuperation des order items",
      error: error.message
    });
  }
};

const getOrderItemById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: errors.array()
      });
    }

    const id = req.params.id;
    const item = await OrderItem.findByPk(id, {
      include: [
        { model: Order, as: "order", required: false },
        { model: Product, as: "product", required: false }
      ]
    });

    if (!item) {
      return res.status(404).json({ message: "Order item introuvable" });
    }

    return res.status(200).json({ data: item });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la recuperation de l'order item",
      error: error.message
    });
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const allErrors = validationResult(req);
    if (!allErrors.isEmpty()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: allErrors.array()
      });
    }

    const id = req.params.id;
    const { quantity, price, order_id, product_id } = req.body;

    const item = await OrderItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Order item introuvable" });
    }

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: "Produit introuvable" });

    await item.update({ quantity, price, order_id, product_id });

    const updated = await OrderItem.findByPk(id, {
      include: [
        { model: Order, as: "order", required: false },
        { model: Product, as: "product", required: false }
      ]
    });

    return res.status(200).json({
      message: "Order item mis a jour",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la mise a jour de l'order item",
      error: error.message
    });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: errors.array()
      });
    }

    const id = req.params.id;
    const item = await OrderItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ message: "Order item introuvable" });
    }

    await item.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la suppression de l'order item",
      error: error.message
    });
  }
};

module.exports = {
  addItemToOrder,
  getOrderItems,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
  validateAddItemToOrder,
  validateOrderItemId,
  validateListOrderItems
};