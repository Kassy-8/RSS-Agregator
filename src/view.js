import { Modal } from 'bootstrap';
import onChange from 'on-change';
import { messagePath, formStatus } from './constants.js';

const createFeedListElement = (feed) => {
  const element = document.createElement('li');
  element.classList.add('list-group-item');

  const title = document.createElement('h3');
  title.textContent = feed.title;
  const description = document.createElement('p');
  description.textContent = feed.description;
  element.append(title, description);
  return element;
};

const renderFeeds = (state, elements, i18nObject) => {
  const { feedContainer } = elements;
  feedContainer.innerHTML = '';

  const mainFeedTitle = document.createElement('h2');
  mainFeedTitle.textContent = i18nObject.t('feedsTitle');
  feedContainer.append(mainFeedTitle);

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'list-group-flush', 'mb-5');
  feedContainer.append(feedList);

  state.feeds.forEach((feed) => {
    const feedListEl = createFeedListElement(feed);

    feedList.append(feedListEl);
  });
};

const createModalWindow = (topicId, state, elements) => {
  const { modal } = elements;

  const currentTopic = state.topics.find((topic) => topic.topicId === topicId);
  const {
    title, link, description,
  } = currentTopic;

  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.textContent = title;
  const modalDescription = modal.querySelector('.modal-body');
  modalDescription.textContent = description;
  const buttonForReading = modal.querySelector('.btn-primary');
  buttonForReading.href = link;
  buttonForReading.target = '_blank';
  const modalWindow = new Modal(modal);
  return modalWindow;
};

const createTopicLink = (topic, viewedTopics) => {
  const { topicId, link, title } = topic;
  const linkEl = document.createElement('a');
  linkEl.id = topicId;
  linkEl.href = link;
  linkEl.target = '_blank';
  linkEl.classList.add((viewedTopics.has(linkEl.id))
  //   ? 'fw-normal'
  //   : 'fw-bold');
    ? 'font-weight-normal'
    : 'font-weight-bold');
  linkEl.textContent = title;
  return linkEl;
};

const createTopicButton = (topic, i18nObject) => {
  const { topicId } = topic;

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.dataset.id = topicId;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modalTopic';
  button.textContent = i18nObject.t('topics.button');

  return button;
};

const renderTopics = (state, elements, i18nObject) => {
  const { viewedTopics } = state.uiState;
  const { topicsContainer } = elements;
  topicsContainer.innerHTML = '';

  const mainTopicsTitle = document.createElement('h2');
  mainTopicsTitle.textContent = i18nObject.t('topics.title');
  topicsContainer.prepend(mainTopicsTitle);

  const topicsList = document.createElement('ul');
  topicsList.classList.add('list-group');
  topicsContainer.append(topicsList);
  const links = state.topics.map((topic) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between');

    const link = createTopicLink(topic, viewedTopics);
    li.append(link);

    const button = createTopicButton(topic, i18nObject);
    li.append(button);

    return li;
  });
  topicsList.append(...links);
};

const markViewedTopics = (viewedTopics, elements) => {
  const { topicsContainer } = elements;

  const topicLinks = topicsContainer.querySelectorAll('a');
  topicLinks.forEach((link) => {
    if (viewedTopics.has(link.id)) {
      link.classList.remove('font-weight-bold');
      link.classList.add('font-weight-normal');
      // link.classList.remove('fw-bold');
      // link.classList.add('fw-normal');
    }
  });
};

const renderValidationErrors = (state, value, elements, i18nObject) => {
  const { input, feedbackContainer } = elements;
  feedbackContainer.innerHTML = '';

  if (state.form.validation.valid === true) {
    input.classList.remove('is-invalid');
    feedbackContainer.classList.remove('invalid-feedback');
  } else {
    input.classList.add('is-invalid');
    feedbackContainer.classList.add('invalid-feedback');
    feedbackContainer.textContent = i18nObject.t(value);
  }
};

const renderError = (error, elements, i18nObject) => {
  const { feedbackContainer } = elements;
  feedbackContainer.innerHTML = '';

  if (!error) {
    feedbackContainer.classList.remove('text-danger');
  } else {
    feedbackContainer.classList.add('text-danger');
    feedbackContainer.textContent = i18nObject.t(error);
  }
};

const renderBadRequestError = (values, elements, i18nObject) => {
  const { feedbackForUpdateErrors } = elements;

  if (values.length === 0) {
    feedbackForUpdateErrors.innerHTML = '';
    feedbackForUpdateErrors.classList.remove('text-warning');
    return;
  }

  const topicContainerTitle = document.querySelector('div.topics > h2');
  topicContainerTitle.after(feedbackForUpdateErrors);

  const errorsMessage = values
    .map((value) => i18nObject
      .t(messagePath.badRequestErrors, { url: value.url, response: value.error }))
    .join('\n');
  feedbackForUpdateErrors.classList.add('text-warning');
  feedbackForUpdateErrors.textContent = errorsMessage;
};

const renderForm = (formState, elements, i18nObject) => {
  const {
    form, input, submit, feedbackContainer,
  } = elements;
  switch (formState) {
    case formStatus.processed: {
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.innerHTML = '';
      break;
    }
    case formStatus.sending: {
      input.setAttribute('readonly', true);
      submit.disabled = true;
      break;
    }
    case formStatus.failed: {
      input.removeAttribute('readonly');
      submit.disabled = false;
      input.select();
      break;
    }
    case formStatus.finished: {
      input.removeAttribute('readonly');
      submit.disabled = false;
      input.select();
      feedbackContainer.classList.add('text-success');
      feedbackContainer.textContent = i18nObject.t(messagePath.successFeedback);
      form.reset();
      break;
    }
    default:
      throw new Error(`Unknown type of formState: ${formState}`);
  }
};

export default (state, elements, i18nObject) => {
  const watchedState = onChange(state, (path, value) => {
    const mapping = {
      'form.status': () => renderForm(value, elements, i18nObject),
      'form.validation.error': () => renderValidationErrors(state, value, elements, i18nObject),
      feeds: () => renderFeeds(state, elements, i18nObject),
      topics: () => renderTopics(state, elements, i18nObject),
      'errors.networkError': () => renderError(value, elements, i18nObject),
      'errors.parseError': () => renderError(value, elements, i18nObject),
      'errors.badRequestErrors': () => renderBadRequestError(value, elements, i18nObject),
      'uiState.modal': () => createModalWindow(value, state, elements),
      'uiState.viewedTopics': () => markViewedTopics(value, elements),
    };

    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};
