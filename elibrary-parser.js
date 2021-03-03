var superagent = require('superagent');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports = function (options) {
	if (!options) {
		options = {};
	}
	var getAgent = function () {
		return superagent.agent ? superagent.agent() : superagent;
	};
	var parser = {};
	var baseUrl = options.url ? options.url : 'https://www.elibrary.ru';
	parser.url = baseUrl;
	parser.getAuthor = function (id) {
		var authorUrl = baseUrl + '/author_profile.asp?id=' + id;
		return new Promise(function (resolve, reject) {
			getAgent()
				.get(authorUrl)
				.redirects(2)
				.send()
				.end(function (err, result) {
					if (err) {
						reject(err);
					} else {
						var author = {};
						var $ = cheerio.load(result.text);
						
						var fullName = $('form[name="results"] table td[align="left"] *[color="#F26C4F"] > b').text();
						var fragments = fullName.split(/\s+/);
						if (fragments[0]) {
							author.lastName = _.capitalize(fragments[0].trim());
						}
						if (fragments[1]) {
							author.firstName = _.capitalize(fragments[1].trim());
						}
						if (fragments[2]) {
							author.extraName = _.capitalize(fragments[2].trim());
						}
						
						var organozationEl = $('form[name="results"] table td[width="100%"] a');
						if (organozationEl.length) {
							author.organization = organozationEl.text();
						}
						
						var resume = [];
						$('.form-panel tr:not(:first-child)').each(function (index, element) {
							var itemOrgEl = $('td:nth-child(2)', element);
							if (!itemOrgEl.length) {
								return;
							}
							var item = {organization: itemOrgEl.text()}
							var itemYearsEl = $('td:nth-child(3)', element);
							if (itemYearsEl.length) {
								item.years = itemYearsEl.text();
							}
							resume.push(item);
						});
						if (resume.length) {
							author.resume = resume;
						}
						
						resolve(author);
					}
				});
		});
	};
	parser.getArticles = function (authorId) {
		var articlesUrl = baseUrl + '/author_items.asp?pubrole=100&show_refs=1&authorid=' + authorId;
		var agent = getAgent()
		return new Promise(function (resolve, reject) {
				agent
				.get(articlesUrl)
				.send()
				.end(function (err, result) {
					if (err) {
						reject(err);
					} else {
						var parseArticles = function ($) {
							$('tr[id^="arw"],tr[id^="brw"]').each(function (index, element) {
								var article = {};
								var idAttr = $(element).attr('id');
								article.id = parseInt(idAttr.replace('brw', '').replace('arw', ''), 10);
								var $title = $('td:nth-child(2) b', element);
								if ($title.length) {
									article.title = $title.text().trim();
								}
								var $source = $('font[color="#00008f"]:last-child', element);
								if ($source.length) {
									article.source = $source.text().trim().replace(/\r?\n/g, '');
								}
								var $authors = $('font[color="#00008f"]:nth-child(3)', element);
								if ($authors.length) {
									article.authors = $authors.text().split(', ').map(function (str) {
										return str.trim();
									});
								}
								if (article.id || article.title) {
									articles.push(article);
								}
							});
						};
						var $ = cheerio.load(result.text);
						
						var articles = [];
						
						parseArticles($);
						
						// fetch link to the next pages
						var pages = [];
						$('.mouse-hovergr[bgcolor="#f5f5f5"] a').each(function (index, element) {
							pages.push($(element).text())
						});
						if (pages.length) {
							var queries = [];
							var getPostQuery = function (pageNum) {
								return new Promise(function (resolve, reject) {
									agent
										.get(articlesUrl + '&pagenum=' + pageNum.toString())
										.send()
										.end(function (err, result) {
											if (err) {
												reject(err);
											} else {
												resolve(result);
											}
										});
								});
							};
							pages.forEach(function (pageNum) {
								queries.push(getPostQuery(pageNum));
							});
							Promise.all(queries).then(function (results) {
								results.forEach(function (result) {
									parseArticles(cheerio.load(result.text));
								});
								resolve(articles);
							}).catch(function (err) {
								reject(err);
							});
						} else {
							resolve(articles);
						}
					}
				});
		});
	};
	parser.getArticle = function (id) {
		var articleUrl = baseUrl + '/item.asp?id=' + id;
		return new Promise(function (resolve, reject) {
			getAgent()
				.get(articleUrl)
				.redirects(2)
				.send()
				.end(function (err, result) {
					if (err) {
						reject(err);
					} else {
						var $ = cheerio.load(result.text);
						
						// parse article title
						var content = {authors: [], title: $('title').text()};
						
						// parse authors list
						$("div[style='display: inline-block; white-space: nowrap'] b").each(function (index, element) {
							var title = $(element).text();
							var author = {title: title};
							var authorElements = title.split(/\s+|\./);
							author.lastName = authorElements[0].split('-').map(_.capitalize).join('-');
							if (authorElements.length > 1) {
								author.firstName = _.capitalize(authorElements[1]);
								author.firstNameInitial = authorElements[1][0];
								if (authorElements.length > 2) {
									author.extraName = _.capitalize(authorElements[2]);
									author.extraNameInitial = authorElements[2][0];
								}
							}
							content.authors.push(author);
						});
						
						// parse source description
						$('table[width="550"] td[valign="middle"] a').each(function (index, element) {
							if (index === 1) {
								content.source = $(element).contents().map(function (index, element) {
									return $(element).text()
								}).toArray().filter(function (e) {
									return !!e
								}).map(function (e) {
									return e.trim()
								}).join(' ').trim();
							}
						});
						
						// parse source params
						var sourceParamsContent = '';
						$('td[width="574"]').each(function (index, element) {
							sourceParamsContent += $(element).text();
						});
						
						var pagesRe = /Страницы\:\s*(\d+(\-\d+)?)/m;
						var pagesResult = pagesRe.exec(sourceParamsContent);
						if (pagesResult && pagesResult.length > 1) {
							content.pages = pagesResult[1];
						}
						
						var issueRe = /Номер:\s*(.*)\r\n/m;
						var issueResult = issueRe.exec(sourceParamsContent);
						if (issueResult && issueResult.length > 1) {
							content.issue = issueResult[1];
						}
						
						var yearRe = /(Годы|Год издания|Год):\s*(.*)\r\n/m;
						var yearResult = yearRe.exec(sourceParamsContent);
						if (yearResult && yearResult.length > 1) {
							content.year = yearResult[2];
						}
						
						resolve(content);
					}
				});
		});
	};
	return parser;
};
