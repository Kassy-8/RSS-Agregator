import { Toast } from 'bootstrap';
import onChange from 'on-change';

const renderFeeds = (state) => {
  const feedContainer = document.querySelector('.feeds');
  feedContainer.innerHTML = '';

  const mainFeedTitle = document.createElement('h2');
  mainFeedTitle.textContent = 'Фиды';
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

const renderTopics = (state) => {
  const topicsContainer = document.querySelector('.topics');
  topicsContainer.innerHTML = '';

  const mainTopicsTitle = document.createElement('h2');
  mainTopicsTitle.textContent = 'Посты';
  topicsContainer.append(mainTopicsTitle);

  const topicsList = document.createElement('ul');
  topicsList.classList.add('list-group');
  topicsContainer.append(topicsList);

  state.topicsColl.forEach(({ topics }) => {
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

const renderValidationErrors = (state, value, elements, i118nObject) => {
  const { input, feedbackContainer } = elements;
  feedbackContainer.innerHTML = '';

  if (state.form.validation.valid === true) {
    input.classList.remove('is-invalid');
    feedbackContainer.classList.remove('invalid-feedback');
  } else {
    feedbackContainer.classList.add('invalid-feedback');
    input.classList.add('is-invalid');
    feedbackContainer.textContent = i118nObject.t(value);
  }
};

const renderNetworkError = (error, elements, i118nObject) => {
  const { toast } = elements;
  if (!error) {
    return;
  }
  const toastBody = toast.querySelector('.toast-body');
  // текст дублируется, стоит ли оставлять?
  // насколько иноформативен вывод ошибок сети? может из них доставать код статуса?
  toastBody.textContent = i118nObject.t('errors.networkError', { error });
  const toastEl = new Toast(toast, { autohide: true });
  toastEl.show();
};

const renderForm = (state, formState, elements, i118nObject) => {
  const {
    form, input, submit, feedbackContainer,
  } = elements;
  switch (formState) {
    case 'processed': {
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.textContent = '';
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
      feedbackContainer.textContent = i118nObject.t('successFeedback');
      renderFeeds(state);
      renderTopics(state);
      form.reset();
      break;
    }
    default:
      throw new Error(`Unknown type of formState: ${state}`); // заменить тут?
  }
};

// сделать ли тут мэппинг
export default (state, elements, i118nObject) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        renderForm(state, value, elements, i118nObject);
        break;
      case 'form.validation.error': {
        renderValidationErrors(state, value, elements, i118nObject);
        break;
      }
      case 'errors.networkError':
        renderNetworkError(value, elements, i118nObject);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
