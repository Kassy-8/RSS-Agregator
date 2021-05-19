import { Modal } from 'bootstrap';
import onChange from 'on-change';

const renderFeeds = (state, elements, i18nObject) => {
  const { feedContainer } = elements;
  feedContainer.innerHTML = '';

  const mainFeedTitle = document.createElement('h2');
  mainFeedTitle.textContent = i18nObject.t('feedsTitle');
  feedContainer.append(mainFeedTitle);

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'list-group-flush');
  feedContainer.append(feedList);

  state.feedList.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const title = document.createElement('h3');
    title.textContent = feed.title;
    const description = document.createElement('p');
    description.textContent = feed.description;
    li.append(title, description);

    feedList.append(li);
  });
};

const renderTopics = (state, elements, i18nObject) => {
  const { viewedTopics } = state.uiState;
  const { topicsContainer, modalEl } = elements;
  topicsContainer.innerHTML = '';

  const mainTopicsTitle = document.createElement('h2');
  mainTopicsTitle.textContent = i18nObject.t('topics.title');
  topicsContainer.append(mainTopicsTitle);

  const topicsList = document.createElement('ul');
  topicsList.classList.add('list-group');
  topicsContainer.append(topicsList);
  const links = state.topicColl.map(({
    topicTitle, topicLink, topicDescription, topicId,
  }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between');

    const link = document.createElement('a');
    link.id = topicId;
    link.href = topicLink;
    link.target = '_blank';
    link.classList.add((viewedTopics.includes(link.id))
      ? 'fw-normal'
      : 'fw-bold');
    link.textContent = topicTitle;
    li.append(link);

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary');
    button.textContent = i18nObject.t('topics.button');

    // вынести бы хэндлер модального окна отдельно
    button.addEventListener('click', () => {
      const modalTitle = modalEl.querySelector('.modal-title');
      modalTitle.textContent = topicTitle;
      const modalDescription = modalEl.querySelector('.modal-body');
      modalDescription.textContent = topicDescription;
      const buttonForReading = modalEl.querySelector('.btn-primary');
      buttonForReading.href = topicLink;
      buttonForReading.target = '_blank';
      const modalWindow = new Modal(modalEl);
      modalWindow.show();

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
/*
const renderNetworkError = (error, elements, i18nObject) => {
  const { feedbackContainer } = elements;
  feedbackContainer.innerHTML = '';

  if (!error) {
    feedbackContainer.classList.remove('text-danger');
  } else {
    feedbackContainer.classList.add('text-danger');
    feedbackContainer.textContent = i18nObject.t('errors.networkError', { error });
  }
};
*/

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
    .map((value) => i18nObject.t('errors.badRequestErrors', { url: value.url, response: value.error }))
    .join('\n');
  feedbackForUpdateErrors.classList.add('text-warning');
  feedbackForUpdateErrors.textContent = errorsMessage;
};

const renderForm = (state, formState, elements, i18nObject) => {
  const {
    form, input, submit, feedbackContainer,
  } = elements;
  switch (formState) {
    case 'processed': {
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.innerHTML = '';
      break;
    }
    case 'sending': {
      input.disabled = true;
      submit.disabled = true;
      break;
    }
    case 'failed': {
      input.disabled = false;
      submit.disabled = false;
      input.select();
      break;
    }
    case 'finished': {
      input.disabled = false;
      submit.disabled = false;
      feedbackContainer.classList.add('text-success');
      // console.log('inside before textcontent', i18nObject.t('successFeedback'));
      // после неудачной загрузки например с ошибкой парсинга, не появляется
      // успешное поле, ошибки валидации отрабатывает. Потом на второй запрос появляется
      feedbackContainer.textContent = i18nObject.t('successFeedback');
      // console.log('inside form status case after textcontent');
      form.reset();
      break;
    }
    default:
      throw new Error(`Unknown type of formState: ${state}`); // заменить тут?
  }
};

// сделать ли тут мэппинг
export default (state, elements, i18nObject) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        renderForm(state, value, elements, i18nObject);
        break;
      case 'form.validation.error':
        renderValidationErrors(state, value, elements, i18nObject);
        break;
      case 'feedList':
        renderFeeds(state, elements, i18nObject);
        break;
      case 'topicColl':
        renderTopics(state, elements, i18nObject);
        break;
      case 'errors.networkError':
      case 'errors.parseError':
        renderError(value, elements, i18nObject);
        break;
      case 'errors.badRequestErrors':
        renderBadRequestError(value, elements, i18nObject);
        break;
      default:
        break;
    }
  });

  return watchedState;
};

/*
const renderTopics = (state, i18nObject) => {
  const topicsContainer = document.querySelector('.topics');
  topicsContainer.innerHTML = '';

  const mainTopicsTitle = document.createElement('h2');
  mainTopicsTitle.textContent = i18nObject.t('containers.topics');
  topicsContainer.append(mainTopicsTitle);

  const topicsList = document.createElement('ul');
  topicsList.classList.add('list-group');
  topicsContainer.append(topicsList);
console.log('state in renderTopic', state);
  state.topicColl.forEach(({ topics }) => {
    const links = topics.map(({ topicTitle, topicLink }) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      const link = document.createElement('a');
      link.href = topicLink;
      link.target = '_blank';
      link.textContent = topicTitle;
      li.append(link);
      return li;
    });
    topicsList.append(...links);
  });
};
*/
