require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const cards = require('./routes/cards');

const { handleAuthorization } = require('./middlewares/auth');

const { PORT = 3000 } = process.env;
const app = express();

const {
  createUser,
  login,
} = require('./controllers/users');

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});


app.use('/signin', login);
app.use('/signup', createUser);

app.use('/users', handleAuthorization, users);
app.use('/cards', handleAuthorization, cards);
app.use((req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {
  console.log(`Server launched sucesfully! App listening on port: ${PORT}`);
});
