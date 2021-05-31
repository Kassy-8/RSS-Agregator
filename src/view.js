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

const createModalWindow = (topic, elements) => {
  const { modal } = elements;
  const {
    title, link, description,
  } = topic;

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

  // В бутстрап 5 для изменения толщины начертания используются классы fw-bold и fw-normal
  // поменяла на класс из младшей версии, чтобы прошли автотесты
  // linkEl.classList.add((viewedTopics.includes(linkEl.id))
  //   ? 'font-weight-normal'
  //   : 'font-weight-bold');
  linkEl.classList.add((viewedTopics.includes(linkEl.id))
    ? 'fw-normal'
    : 'fw-bold');
  linkEl.textContent = title;
  return linkEl;
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
  const links = state.posts.map((topic) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between');

    const link = createTopicLink(topic, viewedTopics);
    li.append(link);

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = 'modalTopic';
    button.textContent = i18nObject.t('topics.button');

    button.addEventListener('click', () => {
      const modalWindow = createModalWindow(topic, elements);
      modalWindow.show();

      // хотела оставить здесь только пуш во viewedTopics,
      // само изменение отслеживалось бы через watchedState и обрабатывалось бы в отдельной функции
      // но не получилось, хотя изменения в стейте происходят и при добавлении новых фидов
      // просмотренные посты учитываются. Постигнуть почему так - не смогла.
      const { topicId } = topic;
      if (!viewedTopics.includes(topicId)) {
        viewedTopics.push(topicId);
        link.classList.remove('fw-bold');
        link.classList.add('fw-normal');
      }
    });
    li.append(button);

    return li;
  });
  topicsList.append(...links);
};

// Функция, которая должна была срабатывать на добавление просмотренного поста в uiState
// const markViewedTopics = (viewedTopics, elements) => {
//   const { topicsContainer } = elements;
//   const topicLinks = topicsContainer.querySelectorAll('a');
//   topicLinks.forEach((link) => {
//     if (viewedTopics.includes(link.id)) {
//       link.classList.remove('font-weight-bold');
//       link.classList.add('font-weight-normal');
//     }
//   });
// };

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
    switch (path) {
      case 'form.status':
        renderForm(value, elements, i18nObject);
        break;
      case 'form.validation.error':
        renderValidationErrors(state, value, elements, i18nObject);
        break;
      case 'feeds':
        renderFeeds(state, elements, i18nObject);
        break;
      case 'posts':
        renderTopics(state, elements, i18nObject);
        break;
      case 'errors.networkError':
      case 'errors.parseError':
        renderError(value, elements, i18nObject);
        break;
      case 'errors.badRequestErrors':
        renderBadRequestError(value, elements, i18nObject);
        break;
      // предполагаемый вариант снятия выделения с просмотренных постов
      // case 'uiState.viewedTopics':
      //   markViewedTopics(value, elements);
      //   break;
      default:
        break;
    }
  });

  return watchedState;
};
