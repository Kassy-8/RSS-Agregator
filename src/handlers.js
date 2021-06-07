/* eslint no-param-reassign: ["error", { "props": false }] */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parseRss from './parseRss.js';
import { messagePath, formStatus } from './constants.js';
import NetworkError from './NetworkError.js';

const proxyBaseUrl = 'https://hexlet-allorigins.herokuapp.com/get';

export const buildFeedProxyUrl = (link) => {
  const url = new URL(proxyBaseUrl);
  url.searchParams.append('disableCache', true);
  url.searchParams.append('url', link);
  return url;
};

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

export const handleSubmit = (state, elements, event) => {
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
  state.error = null;
  state.form.status = formStatus.sending;

  const url = buildFeedProxyUrl(feedUrl);
  axios
    .get(url)
    .catch(() => {
      throw new NetworkError('Network Error');
    })
    .then((response) => {
      const rssData = parseRss(response.data.contents);
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
      state.topics.unshift(...topics);

      state.form.status = formStatus.finished;
      state.feedsUrls.unshift(feedUrl);
    })
    .catch((err) => {
      if (err instanceof NetworkError) {
        state.error = messagePath.networkError;
      } else {
        state.error = messagePath.parseError;
      }
      state.form.status = formStatus.failed;
    });
};

export const handleButton = (state, event) => {
  const buttonId = event.target.dataset.id;
  if (!buttonId) {
    return;
  }
  state.uiState.modal = buttonId;
  state.uiState.viewedTopics.add(buttonId);
};
