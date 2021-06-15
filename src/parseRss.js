export default (data) => {
  const domParser = new DOMParser();
  const domObject = domParser.parseFromString(data, 'text/html');
  const error = new Error();
  error.isParseError = true;

  const parseError = domObject.querySelector('parseerror');
  if (parseError) {
    throw error;
  }

  const titleElement = domObject.querySelector('title');
  const title = titleElement.textContent;
  const descriptionElement = domObject.querySelector('description');
  const description = descriptionElement.textContent;

  const topicsElements = domObject.querySelectorAll('item');
  const topics = [...topicsElements].map((topic) => {
    const topicTitleElement = topic.querySelector('title');
    const topicTitle = topicTitleElement.textContent;

    const topicDescriptionElement = topic.querySelector('description');
    const topicDescription = topicDescriptionElement.textContent;

    const linkElement = topic.querySelector('link').nextSibling;
    const link = linkElement.textContent.trim();

    const guidElement = topic.querySelector('guid');
    const guid = guidElement.textContent;

    return {
      title: topicTitle, description: topicDescription, link, guid,
    };
  });
  return { title, description, topics };
};
