export default {
  translation: {
    validation: {
      incorrectUrl: 'Введен некорректный url, пожалуйста, обратите внимание на образец',
      duplicateUrl: 'Данный url уже находится в вашей rss ленте',
    },
    errors: {
      networkError: 'Произошла ошибка сети: {{error}}',
      parseError: 'Ресурс не содержит валидный RSS',
      badRequestErrors: 'Невозможно обновить ленту по адресу {{url}}. Ошибка сети: {{response}}',
    },
    successFeedback: 'RSS успешно загружен',
    containers: {
      feeds: 'Фиды',
      topics: 'Посты',
    },
  },
};
