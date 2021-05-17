import axios from 'axios';
import _ from 'lodash';
import { buildUrl } from './submitHandler.js';

export default (state, parser) => {
  const { linkList } = state;
  if (_.isEmpty(linkList)) {
    return;
  }

  const urls = linkList.map((link) => buildUrl(link));
  const promises = urls.map((url) => axios.get(url)
    .then((response) => ({ status: 'success', response }))
    .catch((error) => ({ status: 'failed', url, error })));
  const promise = Promise.all(promises);
  promise
    .then((responses) => {
      const topics = responses.filter(({ status }) => status === 'success')
        .map(({ response }) => parser(response.data))
        .flatMap((data) => data.topics);
      const newTopics = _.differenceWith(topics, state.topicColl, _.isEqual);

      if (!_.isEmpty(newTopics)) {
        newTopics.forEach((newTopic) => state.topicColl.push(newTopic));
      }

      const badRequests = responses.filter(({ status }) => status === 'failed')
        .map(({ url, error }) => ({ url, error }));

      badRequests.forEach((badRequest) => state.errors.badRequestErrors.push(badRequest));
    });
};
