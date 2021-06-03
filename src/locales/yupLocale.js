import { messagePath } from '../constants.js';

export default {
  string: {
    url: messagePath.incorrectUrl,
  },
  mixed: {
    required: messagePath.emptyUrl,
    notOneOf: messagePath.duplicateUrl,
  },
};
