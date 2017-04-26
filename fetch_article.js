var elibraryParser = require('./elibrary-parser');

var args = process.argv.slice(2);

if (args.length === 0) {
	console.log('USAGE node fetch_article.js <article_id>');
	process.exit()
} else {
	elibraryParser()
		.getArticle(args[0])
		.then(function (result) {
			console.log(result);
		}).catch(function (err) {
			console.log(err);
		});
}
