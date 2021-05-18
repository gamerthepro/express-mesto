const users = require('express').Router();
const {
  getUsers, getUser, getCurrentUser, updateAvatar, updateUserInfo,
} = require('../controllers/users');

users.get('/', getUsers);
users.get('/me', getCurrentUser);
users.get('/:_id', getUser);
users.patch('/me', updateUserInfo);
users.patch('/me/avatar', updateAvatar);

module.exports = users;
