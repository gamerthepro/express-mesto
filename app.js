require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const users = require('./routes/users');
const cards = require('./routes/cards');
const notFoundRoutes = require('./routes/notFound');

const { handleAuthorization } = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const {
  createUser,
  login,
} = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().min(2).max(30),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().required().min(2).max(30),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use('/users', handleAuthorization, users);
app.use('/cards', handleAuthorization, cards);
app.use('*', notFoundRoutes);

app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });
});

app.use(errorLogger);

app.use(errors());

app.listen(PORT, () => {
  console.log(`Server launched sucesfully! App listening on port: ${PORT}`);
});
