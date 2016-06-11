var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var Word = sequelize.define(
		'Word',
		{
			langue: {
				type: DataTypes.STRING(2),
				allowNull: false,
				isAlpha: true,
				unique: 'wordUnique',
				// get: function () {
				// 	switch (this.getDataValue('langue')) {
				// 		case 'EN':
				// 			return 'ENglish';
				// 		case 'FR':
				// 			return 'FRançais';
				// 		case 'ES':
				// 			return 'ESpañol';
				// 		default:
				// 			return this.getDataValue('langue');
				// 	}
				// },
				validate: {
					notEmpty: {msg: "-> Falta idioma"}
				}
			},
			word: {
				type: DataTypes.STRING,
				allowNull: false,
				isAlpha: true,
				unique: 'wordUnique',
				validate: {
					notEmpty: {msg: "-> Falta palabra"}
				}
			},
			aception: {
				type: DataTypes.STRING,
				allowNull: true, //si no hay acepción
				isAlpha: true,
				unique: 'wordUnique',
				validate: {
					notEmpty: {msg: "-> Falta acepción"}
				}
			}
		}, {timestamps: false, createdAt: true}
	);
	return Word;
}