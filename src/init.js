import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import i18next from 'i18next';
import * as yup from 'yup';
import yupLocale from './locales/yupLocale.js';
import translation from './locales/ruLocale.js';
import initView from './view.js';
import { handleSubmit, handleButton } from './handlers.js';
import subscriptToFeedsUpdates from './subscribeRss.js';

export default () => {
  const state = {
    feedsUrls: [],
    feeds: [],
    topics: [],
    error: null,
    form: {
      status: 'processed',
      validation: {
        valid: true,
        error: null,
      },
    },
    uiState: {
      viewedTopics: new Set(),
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
  };

  const i18nInstance = i18next.createInstance();
  return i18nInstance.init({
    lng: 'ru',
    debug: process.env.NODE_ENV === 'development',
    resources: {
      ru: translation,
    },
  })
    .then(() => {
      yup.setLocale(yupLocale);

      const watchedState = initView(state, elements, i18nInstance);

      elements.form.addEventListener('submit', (event) => handleSubmit(watchedState, elements, event));
      elements.topicsContainer.addEventListener('click', (event) => handleButton(watchedState, event));

      subscriptToFeedsUpdates(watchedState);
    });
};
