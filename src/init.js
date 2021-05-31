import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap';
import i18next from 'i18next';
import translation from './assets/ruLocale.js';
import initView from './view.js';
import handleSubmit from './handleSubmit.js';
import subscriptToFeedsUpdates from './startUpdateRss.js';

export default () => {
  const state = {
    feedsUrls: [],
    feeds: [],
    posts: [],
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
      // viewedTopics: new Set(),
      modal: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input[name=url]'),
    submit: document.querySelector('.btn[type="submit"]'),
    feedContainer: document.querySelector('.feeds'),
    topicsContainer: document.querySelector('.topics'),
    modal: document.querySelector('.modal'),
    feedbackContainer: document.querySelector('#feedback'),
    feedbackForUpdateErrors: document.querySelector('.update-feedback'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: process.env.NODE_ENV === 'development',
    resources: {
      ru: translation,
    },
  })
    .then(() => {
      const watchedState = initView(state, elements, i18nInstance);

      elements.form.addEventListener('submit', (event) => handleSubmit(watchedState, elements, event));

      // subscriptToFeedsUpdates(watchedState);
    });
};
