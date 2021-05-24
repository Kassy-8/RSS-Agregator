export default (data) => {
  const domParser = new DOMParser();
  const domObject = domParser.parseFromString(data, 'text/html');
  const titleElement = domObject.querySelector('title');
  const title = titleElement.textContent;
  const descriptionElement = domObject.querySelector('description');
  const description = descriptionElement.textContent;

  const topicsElements = domObject.querySelectorAll('item');
  const topics = Array.from(topicsElements).map((topic) => {
    const topicTitleElement = topic.querySelector('title');
    const topicTitle = topicTitleElement.textContent;

    const topicDescriptionElement = topic.querySelector('description');
    const topicDescription = topicDescriptionElement.textContent;

    const topicLinkElement = topic.querySelector('link').nextSibling;
    const topicLink = topicLinkElement.textContent.trim();

    const topicGuidElement = topic.querySelector('guid');
    const topicGuid = topicGuidElement.textContent;

    return {
      topicTitle, topicDescription, topicLink, topicGuid,
    };
  });
  return { title, description, topics };
};
