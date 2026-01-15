var elibraryParser = require('../elibrary-parser');

test('article', function () {
  return elibraryParser()
		.getArticle(88752780)
		.then(function (result) {
      expect(result).toEqual({
        authors: [
          {
            extraName: 'Петровна',
            extraNameInitial: 'П',
            firstName: 'Ирина',
            firstNameInitial: 'И',
            lastName: 'Бурукина',
            title: 'БУРУКИНА ИРИНА ПЕТРОВНА'
          }
        ],
        issue: '4',
        pages: '142-157',
        source: 'ВЕСТНИК НГУЭУ',
        title: 'Модуль интеллектуального анализа сообщений учащихся для поддержки педагогической деятельности в условиях цифрового обучения',
        year: '2025'
      });
		});
});
