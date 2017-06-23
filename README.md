JS library for parsing Russian science citation index (elibrary.ru) website for Node or browser JS.

Dependencies: bluebird, cheerio, lodash, superagent.

# Examples

Get article:
```
var elibraryParser = require('elibrary-parser');
elibraryParser()
	.getArticle('28834698')
	.then(function (result) {
		console.log(result);
	}).catch(function (err) {
		console.log(err);
	});

```

Get author profile:
```
var elibraryParser = require('elibrary-parser');
elibraryParser()
	.getAuthor('70938')
	.then(function (result) {
		console.log(result);
	}).catch(function (err) {
		console.log(err);
	});

```

Get authors articles list:
```
var elibraryParser = require('elibrary-parser');
elibraryParser()
	.getArticles('70938')
	.then(function (result) {
		console.log(result);
	}).catch(function (err) {
		console.log(err);
	});
``` 

# Running in browser

Required a proxy endpoint to allow queries to elibrary.ru website.

Config example for ningx:

```
location /elibrary {
	proxy_pass       http://elibrary.ru;
	rewrite /elibrary(.*) /$1  break;
	proxy_redirect https://elibrary.ru http://$host/elibrary;
	proxy_cookie_domain .elibrary.ru $host;
}
```

Broswer code example:
```
var elibraryParser = require('elibrary-parser');
var proxyUrl = '/elibrary'; // proxy location
parser({'url': proxyUrl}).getArticle(this.id).then((result) => {
	console.log(result);
}).catch((err) => {
	console.log(err);
});

```

# Copyright warning
Please follow elibrary terms of use: http://elibrary.ru/access_terms.asp (rus).
