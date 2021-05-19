import i18next from 'i18next';
import initView from './view.js';
import translation from './assets/ruLocale.js';
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
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url'),
    submit: document.querySelector('.btn[type="submit"]'),
    feedbackContainer: document.querySelector('#feedback'),
    toast: document.querySelector('.toast'),
    feedbackForUpdateErrors: document.querySelector('.update-feedback'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: translation,
    },
  });

  const watchedState = initView(state, elements, i18nInstance);

  elements.form.addEventListener('submit', submitHandler(watchedState, elements));

  startUpdateRss(watchedState);
};

/*
  e) => {
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
        watchedState.topicColl.push(newTopic);
        watchedState.form.status = 'finished';

        watchedState.linkList.push(userUrl);
      })
      .catch(() => {
        // кэтч для ошибок в случае если по ссылке находится не рсс формат
        // но парсер все равно форматировал данные
        watchedState.form.status = 'failed';
        watchedState.errors.parseError = 'errors.parseError';
      });
  });
};
*/
