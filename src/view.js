import { Toast } from 'bootstrap';
import onChange from 'on-change';

const renderFeeds = (state, i18nObject) => {
  const feedContainer = document.querySelector('.feeds');
  feedContainer.innerHTML = '';

  const mainFeedTitle = document.createElement('h2');
  mainFeedTitle.textContent = i18nObject.t('containers.feeds');
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
  const links = state.topicColl.map(({ topicTitle, topicLink }) => {
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

// как пример для работы с тоастом
/*
const renderNetworkError = (error, elements, i18nObject) => {
  const { toast } = elements;
  if (!error) {
    return;
  }
  const toastBody = toast.querySelector('.toast-body');
  // текст дублируется, стоит ли оставлять?
  // насколько иноформативен вывод ошибок сети? может из них доставать код статуса?
  toastBody.textContent = i18nObject.t('errors.networkError', { error });
  const toastEl = new Toast(toast, { autohide: true });
  toastEl.show();
};
*/

// стоит ли делать рендер отдельно ошибок парсинга? Может слить с нетворком, без тоаста
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
        renderFeeds(state, i18nObject);
        break;
      case 'topicColl':
        renderTopics(state, i18nObject);
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
