/* eslint no-param-reassign: ["error", { "props": false }] */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parseRss from './parseRss.js';

const getAllOriginsUrl = () => 'https://hexlet-allorigins.herokuapp.com/raw';

export const buildUrl = (link) => {
  const url = new URL(getAllOriginsUrl());
  url.searchParams.append('url', link);
  url.searchParams.append('disableCache', true);
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

export default (state, elements) => (event) => {
  event.preventDefault();
  state.form.status = 'processed';

  const formData = new FormData(elements.form);
  const userUrl = formData.get('url').trim();

  const error = validateUrl(userUrl, state);

  if (error) {
    state.form.validation.valid = false;
    state.form.validation.error = error;
    return;
  }

  state.form.validation.valid = true;
  state.form.validation.error = null;
  state.form.status = 'sending';

  const url = buildUrl(userUrl);
  axios
    .get(url)
    .catch(() => {
      state.errors.networkError = 'errors.networkError';
      state.form.status = 'failed';
    })
    .then((response) => {
      state.errors.networkError = null;

      const rssData = parseRss(response.data);
      return rssData;
    })
    .then((rssData) => {
      const id = _.uniqueId();
      const { title, description, topics } = rssData;
      const newFeed = {
        id, title, description, rssLink: userUrl,
      };
      state.feedList.push(newFeed);

      topics.forEach((topic) => {
        topic.id = id;
      });
      state.topicColl.push(...topics);
      // const newTopic = { id, topics };

      state.form.status = 'finished';

      state.errors.parseError = null;
      state.linkList.push(userUrl);
    })
    .catch(() => {
      state.form.status = 'failed';
      state.errors.parseError = 'errors.parseError';
    });
};
