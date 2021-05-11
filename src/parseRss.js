export default (data) => {
  const domParser = new DOMParser();
  const domObject = domParser.parseFromString(data, 'text/html');
  console.log('domObject', domObject);
  const title = domObject.querySelector('title').textContent;
  console.log('title', title.textContent);
  const description = domObject.querySelector('description').textContent;

  const items = domObject.querySelectorAll('item');
  console.log('items', items);
  const topics = Array.from(items).map((item) => {
    const topicTitle = item.querySelector('title').textContent;
    const topicDescription = item.querySelector('description').textContent;
    const topicLink = item.querySelector('link').nextSibling.textContent.trim();
    return { topicTitle, topicDescription, topicLink };
  });
  console.log('topics', topics);
  return { title, description, topics };
};
