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
						email: 'admin@bbc.com',
						username: 'admin',
						password: '1234',
						isAdmin: true
					},
					{
						email: 'pepe@bbc.com',
						username: 'pepe',
						password: '5678'
					}
				]
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