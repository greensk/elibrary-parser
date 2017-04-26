var elibraryParser = require('./elibrary-parser');

var args = process.argv.slice(2);

if (args.length === 0) {
	console.log('USAGE node fetch_author.js <author_id>');
	process.exit()
} else {
	elibraryParser()
		.getAuthor(args[0])
		.then(function (result) {
			console.log(result);
		}).catch(function (err) {
			console.log(err);
		});
}
