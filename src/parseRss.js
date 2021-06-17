export default (data) => {
  const domParser = new DOMParser();
  const domObject = domParser.parseFromString(data, 'text/html');
  const error = new Error();
  error.isParseError = true;

  const parseError = domObject.querySelector('parseerror');
  if (parseError) {
    throw error;
  }

  const rssData = {};
  try {
    const titleElement = domObject.querySelector('title');
    rssData.title = titleElement.textContent;
    const descriptionElement = domObject.querySelector('description');
    rssData.description = descriptionElement.textContent;

    const topicsElements = domObject.querySelectorAll('item');
    rssData.topics = [...topicsElements].map((topic) => {
      const topicTitleElement = topic.querySelector('title');
      const title = topicTitleElement.textContent;

      const topicDescriptionElement = topic.querySelector('description');
      const description = topicDescriptionElement.textContent;

      const linkElement = topic.querySelector('link').nextSibling;
      const link = linkElement.textContent.trim();

      const guidElement = topic.querySelector('guid');
      const guid = guidElement.textContent;

      return {
        title, description, link, guid,
      };
    });
  } catch {
    throw error;
  }
  return rssData;
};
