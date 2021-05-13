import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parseRss from './parseRss.js';
import initView from './view.js';

const errorMessages = {
  incorrectUrl: 'Некорректный url BAD BAD',
  duplicateUrl: 'Url уже присутствует в списке фидов',
};

const getAllOriginsUrl = () => 'https://hexlet-allorigins.herokuapp.com/raw';
const buildUrl = (link) => {
  const url = new URL(getAllOriginsUrl());
  url.searchParams.append('url', link);
  return url;
};

const isDuplicateUrl = (value, state) => state.linkList.includes(value);

const validateUrl = (value, state) => {
  const schema = yup.string().url(errorMessages.incorrectUrl);
  try {
    schema.validateSync(value);
    if (isDuplicateUrl(value, state)) {
      return errorMessages.duplicateUrl;
    }
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
    networkError: null,
    form: {
      status: 'filling',
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
  };

  const watchedState = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

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

    watchedState.linkList.push(userUrl);
    watchedState.form.status = 'sending';
    const url = buildUrl(userUrl);
    axios
      .get(url)
      .then((response) => {
        const rssData = parseRss(response.data);
        return rssData;
      })
      .catch((err) => {
        // здесь кэтч для ошибок сети
        watchedState.networkError = err;
        watchedState.form.status = 'failed';
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
        console.log('this is nor rss url');
      });
  });
};
