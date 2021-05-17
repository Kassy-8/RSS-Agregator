export default (data) => {
  const domParser = new DOMParser();
  const domObject = domParser.parseFromString(data, 'text/html');
  const title = domObject.querySelector('title').textContent;
  const description = domObject.querySelector('description').textContent;

  const items = domObject.querySelectorAll('item');
  const topics = Array.from(items).map((item) => {
    const topicTitle = item.querySelector('title').textContent;
    const topicDescription = item.querySelector('description').textContent;
    const topicLink = item.querySelector('link').nextSibling.textContent.trim();
    const topicGuid = item.querySelector('guid').textContent;

    // а не сделать ли тут объект с методами, чтобы прописать геттеры
    return {
      topicTitle, topicDescription, topicLink, topicGuid,
    };
  });
  return { title, description, topics };
};
