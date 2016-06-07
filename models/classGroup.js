var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var ClassGroup = sequelize.define('ClassGroup', {
			langTranslation: {
				type: DataTypes.STRING(4),
				allowNull: false,
				isAlpha: true,
				validate: {
					notEmpty: {msg: "-> Falta idioma para el grupo"}
				}
			}
		}
	);
	return ClassGroup;
}