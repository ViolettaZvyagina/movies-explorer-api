const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/notFoundError');
const ValidateError = require('../errors/validateError');
const ConflictError = require('../errors/conflictError');
const UnauthorizedError = require('../errors/unauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    }
    return res.status(200).send(user);
  } catch (err) {
    return next(err);
  }
};

module.exports.createUser = async (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(201).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidateError('Переданы некорректные данные при создании пользователя'));
      return false;
    }
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует'));
      return false;
    }
    return next(err);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    );
    if (!user) {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    }
    return res.status(200).send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ValidateError('Передан некорректный _id пользователя'));
      return false;
    }
    if (err.name === 'ValidationError') {
      next(new ValidateError('Переданы некорректные данные при создании пользователя'));
      return false;
    }
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует'));
      return false;
    }
    return next(err);
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new UnauthorizedError('Необходимо заполнить поля email и пароль'));
    return false;
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      res.send({ message: 'Пользователь успешно авторизован' });
    })
    .catch(next);
};

module.exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt').send({ message: 'token удалён' });
  } catch (err) {
    next(err);
  }
};
