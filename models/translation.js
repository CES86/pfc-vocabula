// Definicion del modelo de Translation

module.exports = function (sequelize, DataTypes) {
	var Translation = sequelize.define(
		'Translation',
		{
			langue1: {
				type: DataTypes.STRING(2),
				allowNull: false,
				validate: {
					notEmpty: {msg: "-> Falta idioma"}
				}
			},
			word1: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {msg: "-> Falta palabra"}
				}
			},
			aception1: {
				type: DataTypes.STRING,
				allowNull: true, //si no hay acepción
				validate: {
					notEmpty: {msg: "-> Falta acepción"}
				}
			},
			langue2: {
				type: DataTypes.STRING(2),
				allowNull: false,
				validate: {
					notEmpty: {msg: "-> Falta idioma"}
				}
			},
			word2: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {msg: "-> Falta palabra"}
				}
			},
			aception2: {
				type: DataTypes.STRING,
				allowNull: true, //si no hay acepción
				validate: {
					notEmpty: {msg: "-> Falta acepción"}
				}
			}
		},
		{
			paranoid: true,
			instanceMethods: {
				// isNotStupid: function () {
				// 	return !((this.langue1 === this.langue2) && (this.word1 === this.word2) && (this.aception1 === this.aception2));
				// },
				isUnique: function () {
					Translation.find({
						where: {
							langue1: this.langue1,
							word1: this.word1,
							aception1: this.aception1,
							langue2: this.langue2,
							word2: this.word2,
							aception2: this.aception2
						}
					}).then(function (translation) {
						return translation != null;
					}).catch(function (err) {
						return next(err);
					});
					// Translation.find({
					// 	where: {
					// 		langue1: this.langue2,
					// 		word1: this.word2,
					// 		aception1: this.aception2,
					// 		langue2: this.langue1,
					// 		word2: this.word1,
					// 		aception2: this.aception1
					// 	}
					// }).then(function (translation) {
					// 	return translation != null;
					// }).catch(function (err) {
					// 	return next(err);
					// });
				}
			}
		});
	return Translation;
}