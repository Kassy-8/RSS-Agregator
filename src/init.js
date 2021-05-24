import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import i18next from 'i18next';
import translation from './assets/ruLocale.js';
import initView from './view.js';
import submitHandler from './submitHandler.js';
import startUpdateRss from './startUpdateRss.js';

export default () => {
  const state = {
    linkList: [],
    feedList: [],
    topicColl: [],
    errors: {
      networkError: null,
      parseError: null,
      badRequestErrors: [],
    },
    form: {
      status: 'processed',
      validation: {
        valid: true,
        error: null,
      },
    },
    uiState: {
      viewedTopics: [],
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input[name=url]'),
    submit: document.querySelector('.btn[type="submit"]'),
    feedContainer: document.querySelector('.feeds'),
    topicsContainer: document.querySelector('.topics'),
    modalEl: document.querySelector('.modal'),
    feedbackContainer: document.querySelector('#feedback'),
    feedbackForUpdateErrors: document.querySelector('.update-feedback'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: translation,
    },
  })
    .then(() => {
      const watchedState = initView(state, elements, i18nInstance);

      elements.form.addEventListener('submit', submitHandler(watchedState, elements));

      startUpdateRss(watchedState);
    });
};
