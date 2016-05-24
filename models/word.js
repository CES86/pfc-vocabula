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
			}//,
			// authorized: {
			// 	type: DataTypes.BOOLEAN,
			// 	allowNull: false,
			// 	defaultValue: false
			// }
		},
		{
			// paranoid: true,
			instanceMethods: {
				isUnique: function (callback) {
					Word.find({where: {langue: this.langue, word: this.word, aception: this.aception}})
						.then(function (word) {
							if (word != null) {
								callback(new Error('Palabra ya utilizada.'));
							}
							callback(null);
						})
						.catch(function (error) {
							callback(error);
						});
				}
			}
		}
	);
	return Word;
}