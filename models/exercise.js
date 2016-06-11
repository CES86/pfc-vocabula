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
				defaultValue: 0,
				get: function () {
					switch (this.getDataValue('typeEx')) {
						case 1:
							return 'Trust';
						case 2:
							return 'Write';
						case 3:
							return 'Select';
						case 4:
							return 'Relation';
						default:
							return this.getDataValue('typeEx');
					}
				}
			}
		},
		{
			timestamps: false, createdAt: true,
			instanceMethods: {
				haveDetail: function () {
					var a = this.typeEx;
					return (a == 'Select' || a == 'Relation');
				}
			}
		}
	);
	return Exercise;
}
