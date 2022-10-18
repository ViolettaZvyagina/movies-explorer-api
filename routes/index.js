const userRouter = require('express').Router();
const movieRouter = require('express').Router();
const { validateUpdateProfile, validateCreateMovie, validateDeleteMovie } = require('../middlewares/validation');

const {
  updateProfile,
  getUser,
} = require('../controllers/users');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

userRouter.get('/me', getUser);
userRouter.patch(
  '/me',
  validateUpdateProfile,
  updateProfile,
);

movieRouter.get('/', getMovies);
movieRouter.post(
  '/',
  validateCreateMovie,
  createMovie,
);

movieRouter.delete(
  '/:id',
  validateDeleteMovie,
  deleteMovie,
);

module.exports = { userRouter, movieRouter };
