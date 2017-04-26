var elibraryParser = require('./elibrary-parser');

var args = process.argv.slice(2);

if (args.length === 0) {
	console.log('USAGE node fetch_articles.js <author_id>');
	process.exit()
} else {
	elibraryParser()
		.getArticles(args[0])
		.then(function (result) {
			console.log(result);
			console.log('Итого публикаций: ' + result.length);
		}).catch(function (err) {
			console.log(err);
		});
}
