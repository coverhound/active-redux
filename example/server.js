const app = require('express')();
const path = require('path');

const data = (file) => path.join(__dirname, 'data', file);

app.get('/api/articles', (req, res) => {
  res.sendFile(data('articles.json'));
});

app.get('/api/articles/1/comments', (req, res) => {
  res.sendFile(data('articles.1.comments.json'));
});

app.get('/api/people/5', (req, res) => {
  res.sendFile(data('people.5.json'));
});

app.get('/api/people/7', (req, res) => {
  res.sendFile(data('people.7.json'));
});

const port = 3001;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
