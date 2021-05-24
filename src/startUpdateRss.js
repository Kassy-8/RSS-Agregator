/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import { buildUrlWithProxy } from './submitHandler.js';
import parseRss from './parseRss.js';

const updateRss = (state, callback) => {
  state.errors.badRequestErrors = [];

  const { linkList } = state;

  if (_.isEmpty(linkList)) {
    callback();
    return;
  }

  const promises = linkList.map((link) => axios.get(buildUrlWithProxy(link))
    .then((response) => {
      const data = parseRss(response.data.contents);
      const { topics } = data;

      const newTopics = topics
        .filter((newTopic) => state.topicColl
          .every((topic) => topic.topicGuid !== newTopic.topicGuid));

      if (!_.isEmpty(newTopics)) {
        state.topicColl.unshift(...newTopics);
      }
    })
    .catch((error) => {
      const badRequest = { url: link, error };
      state.errors.badRequestErrors.push(badRequest);
    }));

  const promise = Promise.all(promises);
  promise
    .then(() => {
      callback();
    });
};

const startUpdateRss = (state) => {
  setTimeout(() => updateRss(state, () => startUpdateRss(state)), 5000);
};

export default startUpdateRss;
