const users = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getCurrentUser, updateAvatar, updateUserInfo,
} = require('../controllers/users');

users.get('/', getUsers);
users.get('/me', getCurrentUser);
users.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}),
updateUserInfo);

users.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required(),
  }),
}), updateAvatar);;

module.exports = users;
