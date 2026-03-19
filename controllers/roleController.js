const Role = require("../models/role");

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "name", "description"],
      order: [["id", "ASC"]]
    });

    return res.json({ data: roles });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la récupération des rôles",
      error: error.message
    });
  }
};

module.exports = { getRoles };

