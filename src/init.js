import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import parseRss from './parseRss.js';
import initView from './view.js';
import translation from './assets/ruLocale.js';

const getAllOriginsUrl = () => 'https://hexlet-allorigins.herokuapp.com/raw';
const buildUrl = (link) => {
  const url = new URL(getAllOriginsUrl());
  url.searchParams.append('url', link);
  return url;
};

yup.setLocale({
  string: {
    url: 'validation.incorrectUrl',
  },
  mixed: {
    notOneOf: 'validation.duplicateUrl',
  },
});

const validateUrl = (value, state) => {
  const schema1 = yup.string().url();
  const schema2 = yup.mixed().notOneOf(state.linkList);
  try {
    schema1.validateSync(value);
    schema2.validateSync(value);
    return null;
  } catch (error) {
    return error.message;
  }
};

export default () => {
  const state = {
    linkList: [],
    feedList: [],
    topicsColl: [],
    errors: {
      networkError: null,
      parseError: null,
    },
    form: {
      status: 'processed',
      validation: {
        valid: true,
        error: null,
      },
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url'),
    submit: document.querySelector('.btn[type="submit"]'),
    feedbackContainer: document.querySelector('.feedback'),
    toast: document.querySelector('.toast'),
  };

  // Здесь вероятно после инит будет then и дальше все пойдет только в нем
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: translation,
    },
  });

  const watchedState = initView(state, elements, i18nInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'processed';

    const formData = new FormData(elements.form);
    const userUrl = formData.get('url').trim();

    const error = validateUrl(userUrl, watchedState);

    if (error) {
      watchedState.form.validation.valid = false;
      watchedState.form.validation.error = error;
      return;
    }

    watchedState.form.validation.valid = true;
    watchedState.form.validation.error = error;
    watchedState.form.status = 'sending';

    const url = buildUrl(userUrl);
    axios
      .get(url)
      .catch((netErr) => {
        watchedState.errors.networkError = netErr.message;
        watchedState.form.status = 'failed';
      })
      .then((response) => {
      // если по ссылку невалидный рсс, он тоже попадет сюда.
      // может пуш ссылки отнести к последему шагу
        watchedState.linkList.push(userUrl);
        // надо на каком-то этапе почистить ошибки которые невалидные
        watchedState.errors.networkError = null;
        watchedState.errors.parseError = null;

        const rssData = parseRss(response.data);
        return rssData;
      })
      .then((rssData) => {
        const id = _.uniqueId();
        const { title, description, topics } = rssData;
        const newFeed = { id, title, description };
        const newTopic = { id, topics };
        watchedState.feedList.push(newFeed);
        watchedState.topicsColl.push(newTopic);
        watchedState.form.status = 'finished';
      })
      .catch(() => {
        // кэтч для ошибок в случае если по ссылке находится не рсс формат
        // но парсер все равно форматировал данные
        watchedState.form.status = 'failed';
        watchedState.errors.parseError = 'errors.parseError';
      });
  });
};
