const User = require('../models/user');
const { errorOutput } = require('../utils/utils');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => errorOutput(err, res));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params._id)
    .orFail(() => new Error('invalidUserId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;

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

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    },
    {
      runValidators: true,
      new: true,
    },
  )
    .orFail(new Error('NotFound'))
    .then((updatedUser) => res.send({ updatedUser }))
    .catch((err) => handleErr(err))
    .catch(next);
};

module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('invalidUserId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res));
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new Error('invalidUserId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => errorOutput(err, res));
};
