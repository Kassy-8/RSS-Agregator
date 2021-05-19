/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import { buildUrl } from './submitHandler.js';
import parseRss from './parseRss.js';

const updateRss = (state, callback) => {
  state.errors.badRequestErrors = [];

  console.log('runUpdateRSS');
  const { feedList } = state;
  if (_.isEmpty(feedList)) {
    callback();
    return;
  }

  const promises = feedList.map(({ rssLink, id }) => axios.get(buildUrl(rssLink))
    .then((response) => {
      const data = parseRss(response.data);
      const { topics } = data;
      topics.forEach((topic) => {
        topic.id = id;
      });

      const newTopics = topics
        .filter((newTopic) => state.topicColl
          .every((topic) => topic.topicGuid !== newTopic.topicGuid));

      if (!_.isEmpty(newTopics)) {
        state.topicColl.push(...newTopics);
      }
    })
    .catch((error) => {
      const badRequest = { url: rssLink, error };
      state.errors.badRequestErrors.push(badRequest);
    }));

  const promise = Promise.all(promises);
  promise
    .then(() => {
      callback();
    });
};

const startUpdateRss = (state) => {
  console.log('runStartUpdate');
  setTimeout(() => updateRss(state, () => startUpdateRss(state)), 5000);
};

export default startUpdateRss;
