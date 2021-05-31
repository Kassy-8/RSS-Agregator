/* eslint no-param-reassign: ["error", { "props": false }] */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parseRss from './parseRss.js';
import { messagePath, formStatus } from './constants.js';

const proxyBaseUrl = () => 'https://hexlet-allorigins.herokuapp.com/get';

export const buildFeedProxyUrl = (link) => {
  const url = new URL(proxyBaseUrl());
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
  const schema2 = yup.mixed().notOneOf(state.feedsUrls);
  try {
    schema1.validateSync(value);
    schema2.validateSync(value);
    return null;
  } catch (error) {
    return error.message;
  }
};

export default (state, elements, event) => {
  event.preventDefault();
  state.form.status = formStatus.processed;

  const formData = new FormData(elements.form);
  const feedUrl = formData.get('url').trim();
  const error = validateUrl(feedUrl, state);

  if (error) {
    state.form.validation.valid = false;
    state.form.validation.error = error;
    return;
  }

  state.form.validation.valid = true;
  state.form.validation.error = null;
  state.errors.networkError = null;
  state.form.status = formStatus.sending;

  const url = buildFeedProxyUrl(feedUrl);
  axios
    .get(url)
    .catch(() => {
      state.errors.networkError = messagePath.networkError;
      state.form.status = formStatus.failed;
    })
    .then((response) => {
      const rssData = parseRss(response.data.contents);
      return rssData;
    })
    .catch(() => {
      state.errors.parseError = messagePath.parseError;
      state.form.status = formStatus.failed;
    })
    .then((rssData) => {
      const id = _.uniqueId();
      const { title, description, topics } = rssData;

      const newFeed = {
        id, title, description,
      };
      state.feeds.unshift(newFeed);

      topics.forEach((topic) => {
        topic.feedId = id;
        topic.topicId = _.uniqueId();
      });
      state.posts.unshift(...topics);

      state.form.status = formStatus.finished;
      state.errors.parseError = null;
      state.feedsUrls.unshift(feedUrl);
    })
    .catch(() => {
      state.errors.parseError = messagePath.parseError;
      state.form.status = formStatus.failed;
    });
};
