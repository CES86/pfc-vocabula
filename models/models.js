var path = require('path');

var env = require('node-env-file');
// Load any undefined ENV variables from a specified file, but don't crash if the file doesn't exist
// Usefull for testing env vars in development, but using "real" env vars in production
env(__dirname + '/.env', {raise: false});

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// // Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// // SQLite   DATABASE_URL = sqlite://:@:/
// var url = process.env.DATABASE_URL_SQLITE.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
// var DB_name = (url[6] || null);
// var user = (url[2] || null);
// var pwd = (url[3] || null);
// var protocol = (url[1] || null);
// var port = (url[5] || null);
// var host = (url[4] || null);
// var storage = process.env.DATABASE_STORAGE;
//
// // Usar BBDD SQLite o Postgres
// var sequelize = new Sequelize(DB_name, user, pwd,
// 	{
// 		dialect: protocol,
// 		protocol: protocol,
// 		port: port,
// 		host: host,
// 		storage: storage,			// solo SQLite (.env)
// 		omitNull: true				// solo Postgres
// 	}
// );

var sequelize = new Sequelize(process.env.DATABASE_URL);

//IMPORTACIÓN DE TABLAS
//=====================

// Importar definicion de la tabla User
var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);
// Importar definicion de la tabla Word
var word_path = path.join(__dirname, 'word');
var Word = sequelize.import(word_path);
// Importar definicion de la tabla Translation
var translation_path = path.join(__dirname, 'translation');
var Translation = sequelize.import(translation_path);
// Importar definicion de la tabla ClassGroup
var classgroup_path = path.join(__dirname, 'classGroup');
var ClassGroup = sequelize.import(classgroup_path);
// Importar definicion de la tabla Exercise
var exercise_path = path.join(__dirname, 'exercise');
var Exercise = sequelize.import(exercise_path);
// Importar definicion de la tabla Pack
var pack_path = path.join(__dirname, 'pack');
var Pack = sequelize.import(pack_path);
// Importar definicion de la tabla ExtraEx
var extraex_path = path.join(__dirname, 'extraEx');
var ExtraEx = sequelize.import(extraex_path);
// Importar definicion de la tabla PackEx
var packex_path = path.join(__dirname, 'packEx');
var PackEx = sequelize.import(packex_path);
// Importar definicion de la tabla PackStudent
var packstudent_path = path.join(__dirname, 'packStudent');
var PackStudent = sequelize.import(packstudent_path);
// Importar definicion de la tabla Statistics
var statistics_path = path.join(__dirname, 'statistics');
var Statistics = sequelize.import(statistics_path);
// Importar definicion de la tabla LOG
var log_path = path.join(__dirname, 'log');
var LOG = sequelize.import(log_path);


//ASOCIACIÓN DE TABLAS
//====================

ClassGroup.belongsTo(User);//mete UserId como FK en ClassGroup
// User.hasMany(ClassGroup);

ClassGroup.hasMany(User, {constraints: false});//mete ClassGroupId como FK en User pero no referenciado

Statistics.hasOne(User);

Word.belongsTo(User);	//esto permite, dada una Word averiguar EL USER que está asociado a esa Word
User.hasMany(Word);		//esto permitiria, dado un User averiguar que Word/s esta/n asociada/s a él


Pack.belongsTo(User);
User.hasMany(Pack);

//Word.belongsToMany(Word, {as: 'Translated', through: Translation});
//no nos interesa que las FK sean PK, dan problemas al ser referenciadas como FK de otras tablas
Translation.belongsTo(Word, {as: 'Word1', onDelete: 'CASCADE'});
Translation.belongsTo(Word, {as: 'Word2', onDelete: 'CASCADE'});
Translation.belongsTo(User);

Exercise.belongsTo(Translation, {as: 'Translation', onDelete: 'CASCADE'});
Exercise.belongsTo(User);	//esto permite, dada un Exercise averiguar EL USER que está asociado a ese Exercise
User.hasMany(Exercise);		//esto permitiria, dado un User averiguar que Exercise/s esta/n asociado/s a él

// Exercise.belongsToMany(Translation, {through: ExtraEx});
// Sequelize da problemas al referenciar con belongsToMany.
ExtraEx.belongsTo(Exercise, {as: 'Exercise', onDelete: 'CASCADE'});
ExtraEx.belongsTo(Translation, {as: 'Translation', onDelete: 'CASCADE'});

// Exercise.belongsToMany(Pack, {through: PackEx});
PackEx.belongsTo(Exercise, {as: 'Exercise', onDelete: 'CASCADE'});
PackEx.belongsTo(Pack, {as: 'Pack', onDelete: 'CASCADE'});

// Pack.belongsToMany(User, {through: PackStudent});
PackStudent.belongsTo(Pack, {as: 'Pack', onDelete: 'CASCADE'});
PackStudent.belongsTo(User, {as: 'User', onDelete: 'CASCADE'});

User.hasMany(LOG);
LOG.belongsTo(Pack);
LOG.belongsTo(Exercise);
LOG.belongsTo(Translation);

//EXPORTACIÓN DE TABLAS
//=====================

exports.Sequelize = Sequelize;
exports.User = User;
exports.Word = Word;
exports.Translation = Translation;
exports.ClassGroup = ClassGroup;
exports.Exercise = Exercise;
exports.Pack = Pack;
exports.ExtraEx = ExtraEx;
exports.PackEx = PackEx;
exports.PackStudent = PackStudent;
exports.Statistics = Statistics;
exports.LOG = LOG;


// sequelize.sync() inicializa las tablas en DB
sequelize.sync().then(function () {
	// then(..) ejecuta el manejador una vez creada la tabla
	User.count().then(function (count) {
		if (count === 0) //{   // la tabla se inicializa solo si está vacía
			User.bulkCreate([
				{
					email: 'system@pfc.es',
					username: 'system',
					password: '0000',
					isAdmin: true,
					isTeacher: true
				},
				{
					email: 'admin@pfc.es',
					username: 'admin',
					password: '1234',
					isAdmin: true
				}
			]).then(function (bulk) {
				if (bulk) {
					console.log('BBDD (User) inicializada (' + bulk.length + ')');
				}
			});
		else
			console.log('BBDD (User) Contiene ' + count + ' usuarios registrados!');
	});
});

var separatorCSV = ";";

var parserCSV = function (path, type, structure, userId) {
	return new Promise(function (fullfill, reject) {
		var lengthStructure = structure.split(separatorCSV).length;
		console.log('ESTRUCUTRA REQUERIDA (' + lengthStructure + ' campos): ');
		console.log(structure);

		var fs = require('fs');
		var byline = require('byline');

		var stream = fs.createReadStream(path);
		stream = byline.createStream(stream);

		var numLine = 0;
		console.log('CONTENIDO DEL ARCHIVO: ');
		stream.on('data', function (line) {
			numLine++;
			if (numLine != 1) {
				var values = line.split(separatorCSV);
				if (values.length < lengthStructure)
					console.log('ERROR línea #' + numLine + ': ' + line);
				else {
					console.log(line);
					switch (type) {
						case 'USER':
							var user = User.build({
								email: values[0].toLowerCase(),
								username: values[1].toLowerCase(),
								password: values[2],
								isAdmin: values[3],
								isTeacher: values[4],
								firstName: values[5],
								lastName: values[6],
								motherLang: values[7].toUpperCase(),
								foreignLang: values[8].toUpperCase()
							});
							user.save({//TODO revisar captura de errores
								fields: ["email",
									"username",
									"password",
									"isAdmin",
									"isTeacher",
									"firstName",
									"lastName",
									"motherLang",
									"foreignLang",
								]
							}).then(function () {
								fullfill(true);
							});
							break;
						case 'WORD':
							var word = Word.build({
								langue: values[0].toUpperCase(),
								word: values[1].toLowerCase(),
								aception: values[2].toLowerCase(),
								UserId: userId
							});
							word.save({//TODO revisar captura de errores
								fields: ["langue", "word", "aception", "UserId"]
							}).then(function () {
								fullfill(true);
							});
							break;
						case 'TRANSLATION':
							Word.findOrCreate({
								where: {
									langue: values[0].toUpperCase(),
									word: values[1].toLowerCase(),
									aception: values[2].toLowerCase()
								},
								defaults: {UserId: userId},
								attributes: ['id']
							}).spread(function (word1, created1) {
								Word.findOrCreate({
									where: {
										langue: values[3].toUpperCase(),
										word: values[4].toLowerCase(),
										aception: values[5].toLowerCase()
									},
									defaults: {UserId: userId},
									attributes: ['id']
								}).spread(function (word2, created2) {
									Translation.find({
										where: {
											$or: [
												{
													Word1Id: word1.id,
													Word2Id: word2.id
												},
												{
													Word1Id: word2.id,
													Word2Id: word1.id
												},
											]
										},
										attributes: []
									}).then(function (busqueda) {
										if (!busqueda) {
											var translation = Translation.build({
												Word1Id: word1.id,
												Word2Id: word2.id,
												UserId: userId
											});
											translation.save({//TODO revisar captura de errores
												fields: ["Word1Id", "Word2Id", "UserId"]
											}).then(function () {
												fullfill(true);
											});
										}
									});
								});
							});
							break;
						default:
							console.log('El tipo de archivo a parsear no se reconoce: ' + type);
					}
				}
			}
		});
	});
};

var structureUSERs = 'email;username;password;isAdmin;isTeacher;firstName;lastName;motherLang;foreignLang';
var structureWORDs = 'langue;word;aception';
var structureTRANSLATIONs = 'langue1;word1;aception1;langue2;word2;aception2';

exports.parseUserLot = function (pathFile) {
	console.log('Parsing and inserting the USERs file... ' + pathFile);
	parserCSV(pathFile, 'USER', structureUSERs, null);
};

exports.parseWordLot = function (pathFile, UserId) {
	User.find({
		where: {
			id: UserId
		},
		attributes: ['username']
	}).then(function (user) {
		console.log('Parsing and inserting the file of Words by ' + user.username + '... ' + pathFile);
		parserCSV(pathFile, 'WORD', structureWORDs, UserId);
	});
};

exports.parseTranslationLot = function (pathFile, UserId) {
	User.find({
		where: {
			id: UserId
		},
		attributes: ['username']
	}).then(function (user) {
		console.log('Parsing and inserting the file of Translations by ' + user.username + ' ... ' + pathFile);
		parserCSV(pathFile, 'TRANSLATION', structureTRANSLATIONs, UserId);
	});
};