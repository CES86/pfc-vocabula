var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var Pack = sequelize.define('Pack', {
		langTranslation: {
			type: DataTypes.STRING(4),
			allowNull: false,
			isAlpha: true,
			get: function () {
				var str = this.getDataValue('langTranslation');
				var l1 = str.substring(0, 2);
				var l2 = str.substring(2, 4);
				return l1 + "⇆" + l2;
			},
			validate: {
				notEmpty: {msg: "-> Falta idioma para el PACK"}
			}
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		timestamps: true,
		updatedAt: false
	});
	return Pack;
}
