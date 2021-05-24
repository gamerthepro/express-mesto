const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { errorOutput } = require('../utils/utils');

const { BadRequestError } = require('../errors/400-BadRequestError');
const { NotFoundError } = require('../errors/404-NotFoundError');
const { UnauthorizedError } = require('../errors/401-UnauthorizedError');
const { InternalServerError } = require('../errors/500-InternalServerError');
const { ConflictError } = require('../errors/409-ConflictError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      throw new InternalServerError('Ошибка на сервере при получении данных пользователей');
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
      email: req.body.email,
      password: hash,
    }))
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`Переданы некорректные данные: ${err.message}`);
      } else if (err.code === 11000) {
        throw new ConflictError('Пользователь с такими данными уже зарегистрирован');
      } else if (err.name === 'NotFound') {
        throw new NotFoundError('Данные не найдены');
      } else if (err.statusCode === 500) {
        throw new InternalServerError('Ошибка на сервере при получении данных пользователей');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  User.findUserByCredentials(req.body.email, req.body.password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

      res.cookie('userToken', token, {
        maxAge: 604800000,
        httpOnly: true,
        sameSite: true,
      }).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      throw new UnauthorizedError('Необходима авторизация');
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFound'))
    .then((user) => {
      if (!user) {
        throw new BadRequestError('Переданы некорректные данные');
      } else {
        res.status(200).send({ user });
      }
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        throw new BadRequestError('Переданы некорректные данные');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('Данные не найдены');
      }
      next(err);
    })
    .catch(next);
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('invalidUserId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res))
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('invalidUserId'))
    .then((user) => res.send({ data: user }))
    .then()
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`Переданы некорректные данные: ${err.message}`);
      } else if (err.message === 'TypeError') {
        throw new BadRequestError('Переданы некорректные данные');
      } else {
        errorOutput(err, res);
      }
    })
    .catch(next);
};
