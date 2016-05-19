var path = require('path');

var env = require('node-env-file');
// Load any undefined ENV variables from a specified file, but don't crash if the file doesn't exist
// Usefull for testing env vars in development, but using "real" env vars in production
env(__dirname + '/.env', {raise: false});

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user = (url[2] || null);
var pwd = (url[3] || null);
var protocol = (url[1] || null);
var port = (url[5] || null);
var host = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
	{
		dialect: protocol,
		protocol: protocol,
		port: port,
		host: host,
		storage: storage,			// solo SQLite (.env)
		omitNull: true				// solo Postgres
	}
);

// Importar definicion de la tabla User
var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);

// exportar tablas
exports.User = User;

// sequelize.sync() inicializa las tablas en DB
sequelize.sync().then(function () {
	// then(..) ejecuta el manejador una vez creada la tabla
	User.count().then(function (count) {
		if (count === 0) {   // la tabla se inicializa solo si está vacía
			User.bulkCreate(
				[
					{
						email: 'system@bbc.com',
						username: 'system',
						password: '0000',
						isAdmin: true,
						isTeacher: true
					},
					{
						email: 'admin@bbc.com',
						username: 'admin',
						password: '1234',
						isAdmin: true
					},
					{
						email: 'alex@bbc.com',
						username: 'alex',
						password: '0000',
						isTeacher: true
					},
					{
						email: 'luisito@bbc.com',
						username: 'luisito',
						password: 'x'
					},
					{
						email: 'victor@bbc.com',
						username: 'victor',
						password: 'y'
					},
					{
						email: 'clara@bbc.com',
						username: 'clara',
						password: 'z'
					}
				],
				{
					validate: true,
					benchmark: true
				}
			).then(function (bulk) {
				if (bulk)
					console.log('BBDD (User) inicializada (' + bulk.length + ')');
				//console.log(JSON.stringify(bulk[0]));
			});
		}
		else
			console.log('BBDD (User) Contiene ' + count + ' registros!');
	});
});

var parserCSV = function (path) {
	var fs = require('fs');
	var byline = require('byline');

	var stream = fs.createReadStream(path);
	stream = byline.createStream(stream);

	var numLine = 0;

	stream.on('data', function (line) {
			numLine++;
			console.log(line);
			var values = line.split(",");
			if (values.length < 13)
				console.log('ERROR: en la línea #' + numLine);
			else {
				var user = User.build({
					email: values[1].toLowerCase(),
					username: values[2].toLowerCase(),
					password: values[3],
					isAdmin: values[4],
					isTeacher: values[5],
					authorized: values[6],
					phoneNumber: values[7],
					firstName: values[8],
					lastName: values[9],
					motherLang: values[10].toUpperCase(),
					foreignLang: values[11].toUpperCase(),
					classGroup: values[12]
				});
				user.save({//TODO revisar captura de errores
					fields: ["email",
						"username",
						"password",
						// "isAdmin",
						"isTeacher",
						// "authorized",
						"firstName",
						"lastName",
						"motherLang",
						"foreignLang",
						// "classGroup"
					]
				});
			}
		}
	);
};

exports.parseUserLot = function (pathFile) {
	console.log('Parsing and inserting the filev (TODO)... ' + pathFile);
	parserCSV(pathFile);
};