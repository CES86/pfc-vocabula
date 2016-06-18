var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var Pack = sequelize.define('Pack', {
		langTranslation: {
			type: DataTypes.STRING(4),
			allowNull: false,
			isAlpha: true,
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
		getterMethods: {
			langue1: function () {
				return this.getDataValue('langTranslation').substring(0, 2);
			},
			langue2: function () {
				return this.getDataValue('langTranslation').substring(2, 4);
			},
			getArrowed: function () {
				return this.langue1 + " ⇆ " + this.langue2;
			}
		},
		timestamps: true,
		updatedAt: false
	});
	return Pack;
}
