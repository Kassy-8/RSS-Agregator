/* eslint no-param-reassign: ["error", { "props": false }] */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parseRss from './parseRss.js';
import { messagePath, formStatus } from './constants.js';

const getProxyApi = () => 'https://hexlet-allorigins.herokuapp.com/get';

export const buildUrlWithProxy = (link) => {
  const url = new URL(getProxyApi());
  url.searchParams.append('disableCache', true);
  url.searchParams.append('url', link);
  return url;
};

yup.setLocale({
  string: {
    url: messagePath.incorrectUrl,
  },
  mixed: {
    required: messagePath.emptyUrl,
    notOneOf: messagePath.duplicateUrl,
  },
});

const validateUrl = (value, state) => {
  const schema1 = yup.string().required().url();
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
  state.form.status = formStatus.processed;

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
  state.form.status = formStatus.sending;

  const url = buildUrlWithProxy(userUrl);
  axios
    .get(url)
    .then((response) => {
      state.errors.networkError = null;

      const rssData = parseRss(response.data.contents);
      return rssData;
    })
    .catch(() => {
      state.errors.networkError = messagePath.networkError;
      state.form.status = formStatus.failed;
    })
    .then((rssData) => {
      const id = _.uniqueId();
      const { title, description, topics } = rssData;

      const newFeed = {
        id, title, description,
      };
      state.feedList.unshift(newFeed);

      topics.forEach((topic) => {
        topic.feedId = id;
        topic.topicId = _.uniqueId();
      });
      state.topicColl.unshift(...topics);

      state.form.status = formStatus.finished;
      state.errors.parseError = null;
      state.linkList.unshift(userUrl);
    })
    .catch(() => {
      state.errors.parseError = messagePath.parseError;
      state.form.status = formStatus.failed;
    });
};
