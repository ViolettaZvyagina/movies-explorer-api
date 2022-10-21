const router = require('express').Router();
const { userRouter } = require('./users');
const { movieRouter } = require('./movies');
const { validateLogin, validateCreateUser } = require('../middlewares/validation');
const { createUser, login, logout } = require('../controllers/users');
const NotFoundError = require('../errors/notFoundError');
const { auth } = require('../middlewares/auth');
const { errorLogger } = require('../middlewares/logger');

router.post(
  '/signin',
  validateLogin,
  login,
);
router.post(
  '/signup',
  validateCreateUser,
  createUser,
);

router.use(auth);

router.post('/signout', logout);

router.use('/users', userRouter);

router.use('/movies', movieRouter);

router.use(errorLogger);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
