/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import { buildFeedProxyUrl } from './handlers.js';
import parseRss from './parseRss.js';

const updateRss = (state) => {
  const { feedsUrls } = state;
  const promises = feedsUrls.map((link) => axios.get(buildFeedProxyUrl(link))
    .then((response) => {
      const data = parseRss(response.data.contents);
      const { topics } = data;

      const newTopics = topics
        .filter((newTopic) => state.topics.every((topic) => topic.guid !== newTopic.guid));
      if (!_.isEmpty(newTopics)) {
        newTopics.forEach((topic) => {
          topic.topicId = _.uniqueId();
        });
        state.topics.unshift(...newTopics);
      }
    })
    .catch((error) => {
      console.log(error);
    }));

  return Promise.all(promises);
};

const subscriptToFeedsUpdates = (state) => {
  setTimeout(() => updateRss(state)
    .finally(() => {
      subscriptToFeedsUpdates(state);
    }), 5000);
};

export default subscriptToFeedsUpdates;
