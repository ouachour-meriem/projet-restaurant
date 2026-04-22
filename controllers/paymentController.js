const { body, validationResult } = require("express-validator");
const Order = require("../models/order");
const Payment = require("../models/payment");

const validateCreatePayment = [
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

  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("amount est obligatoire")
    .bail()
    .isNumeric()
    .withMessage("amount doit etre numerique")
    .bail()
    .toFloat(),

  body("payment_method")
    .exists({ checkFalsy: true })
    .withMessage("payment_method est obligatoire")
    .bail()
    .isString()
    .withMessage("payment_method doit etre une chaine"),

  body("payment_date")
    .exists({ checkFalsy: true })
    .withMessage("payment_date est obligatoire")
    .bail()
    .isISO8601()
    .withMessage("payment_date doit etre une date valide (ISO8601)"),

  body("status")
    .exists({ checkFalsy: true })
    .withMessage("status est obligatoire")
    .bail()
    .isString()
    .withMessage("status doit etre une chaine")
];

const validateUpdatePayment = [
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
  body("amount")
    .exists({ checkFalsy: true })
    .withMessage("amount est obligatoire")
    .bail()
    .isNumeric()
    .withMessage("amount doit etre numerique")
    .bail()
    .toFloat(),
  body("payment_method")
    .exists({ checkFalsy: true })
    .withMessage("payment_method est obligatoire")
    .bail()
    .isString(),
  body("payment_date")
    .exists({ checkFalsy: true })
    .withMessage("payment_date est obligatoire")
    .bail()
    .isISO8601()
    .withMessage("payment_date doit etre une date valide (ISO8601)"),
  body("status")
    .exists({ checkFalsy: true })
    .withMessage("status est obligatoire")
    .bail()
    .isString()
];

const listPayments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let limit = parseInt(req.query.limit, 10) || 10;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;

    const { count, rows } = await Payment.findAndCountAll({
      order: [["payment_date", "DESC"]],
      limit,
      offset
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return res.status(200).json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la recuperation des paiements",
      error: error.message
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }
    return res.status(200).json({ data: payment });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la recuperation du paiement",
      error: error.message
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: errors.array()
      });
    }

    const { order_id, amount, payment_method, payment_date, status } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const payment = await Payment.create({
      order_id,
      amount,
      payment_method,
      payment_date: new Date(payment_date),
      status
    });

    return res.status(201).json({
      message: "Paiement cree avec succes",
      data: payment
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la creation du paiement",
      error: error.message
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: errors.array()
      });
    }

    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const { order_id, amount, payment_method, payment_date, status } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    await payment.update({
      order_id,
      amount,
      payment_method,
      payment_date: new Date(payment_date),
      status
    });

    const updated = await Payment.findByPk(id);
    return res.status(200).json({
      message: "Paiement mis a jour",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la mise a jour du paiement",
      error: error.message
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: "Paiement introuvable" });
    }
    await payment.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la suppression du paiement",
      error: error.message
    });
  }
};

module.exports = {
  listPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  validateCreatePayment,
  validateUpdatePayment
};