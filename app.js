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

const auth = require('./middlewares/auth');
const { signinValidation, signupValidation } = require('./middlewares/validation');
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

mongoose.connect('mongodb://localhost:27017/mestodb',
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

app.use(requestLogger);

app.use('/signin', signinValidation, login);

app.use('/signup', signupValidation, createUser);

app.use('/users', auth, users);
app.use('/cards', auth, cards);
app.use('*', notFoundRoutes);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server launched sucesfully! App listening on port: ${PORT}`);
});
