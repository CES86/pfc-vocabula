var models = require('../models/models.js');

// Definicion del modelo de Word
module.exports = function (sequelize, DataTypes) {
	var ClassGroup = sequelize.define('ClassGroup', {
			name: {
				type: DataTypes.STRING,
				allowNull: true,
				isAlpha: true,
				unique: true,
				validate: {
					notEmpty: {msg: "-> Falta nombre de la clase"},
					// hay que devolver un mensaje de error si la clase ya existe
					isUnique: function (value, next) {
						var self = this;
						ClassGroup.find({where: {name: value}})
							.then(function (classGroup) {
								if (classGroup && self.id !== classGroup.id) {
									return next('Nombre de Clase ya utilizado. Elija otro por favor.');
								}
								return next();
							})
							.catch(function (err) {
								return next(err);
							});
					}
				}
			},
			langTranslation: {
				type: DataTypes.STRING(4),
				allowNull: false,
				isAlpha: true,
				validate: {
					notEmpty: {msg: "-> Falta idioma para el grupo"}
				}
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
					return this.langue1 + " ⇉ " + this.langue2;
				}
			},
			timestamps: true,
			updatedAt: false
		}
	);
	return ClassGroup;
}