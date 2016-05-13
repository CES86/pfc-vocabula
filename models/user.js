// Definicion del modelo de User con validación y encriptación de passwords
var crypto = require('crypto');
var key = process.env.PASSWORD_ENCRYPTION_KEY;

module.exports = function (sequelize, DataTypes) {
	var User = sequelize.define(
		'User',
		{
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				//unique: true,//{args: true, msg: "-> E-mail ya utilizado"}, //no haria falta?
				validate: {
					notEmpty: {msg: "-> Falta e-mail"},
					isEmail: {msg: '-> Escriba un e-mail válido'},
					//hay que devolver un mensaje de error si el e-mail ya existe
					isUnique: function (value, next) {
						var self = this;
						User.find({where: {email: value}})
							.then(function (user) {
								if (user && self.id !== user.id) {
									return next('E-mail ya utilizado');
								}
								return next();
							})
							.catch(function (err) {
								return next(err);
							});
					}
				}
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				// primaryKey: true,
				isAlpha: true,
				//unique: true, // no poner si pones modo paranoico! mejor con funcion validate!
				validate: {
					notEmpty: {msg: "-> Falta username"},
					// hay que devolver un mensaje de error si el username ya existe
					isUnique: function (value, next) {
						var self = this;
						User.find({where: {username: value}})
							.then(function (user) {
								if (user && self.id !== user.id) {
									return next('Username ya utilizado');
								}
								return next();
							})
							.catch(function (err) {
								return next(err);
							});
					},
					isAlpha: function (value, next) {
						if (value.match(/^[A-Za-z]+$/)) {
							return next();
						}
						return next('Username solo permite letras');
					}
				}
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {msg: "-> Falta password"}
				},
				set: function (password) {
					var encripted = password;//crypto.createHmac('sha1', key).update(password).digest('hex');
					// Evita passwords vacíos
					// if (password === '') {
					// 	encripted = '';
					// }
					this.setDataValue('password', encripted);
				}
			},
			isAdmin: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			isTeacher: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			authorized: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			},
			phoneNumber: {
				type: DataTypes.INTEGER(9),
				allowNull: true
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: true
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: true
			},
			motherLang: {
				type: DataTypes.STRING(2),
				allowNull: true
			},
			foreignLang: {
				type: DataTypes.STRING(2),
				allowNull: true
			},
			classGroup: {
				type: DataTypes.STRING, //FK!!!
				allowNull: true
				//FK de la clase
			}
		},
		{
			paranoid: true,
			instanceMethods: {
				verifyPassword: function (password) {
					var encripted = password;//crypto.createHmac('sha1', key).update(password).digest('hex');
					return encripted === this.password;
				}
			}
		}
		)
		;
	return User;
}