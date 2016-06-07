var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var Exercise = sequelize.define('Exercise', {
			qstnLang: {
				type: DataTypes.STRING(2),
				allowNull: false,
				isAlpha: true,
				validate: {
					notEmpty: {msg: "-> Falta idioma para el ejercicio"}
				}
			},
			typeEx: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0
			}
		}
	);
	return Exercise;
}
