const movieRouter = require('express').Router();
const { validateCreateMovie, validateDeleteMovie } = require('../middlewares/validation');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

movieRouter.get('/', getMovies);
movieRouter.post(
  '/',
  validateCreateMovie,
  createMovie,
);

movieRouter.delete(
  '/:movieId',
  validateDeleteMovie,
  deleteMovie,
);

module.exports = { movieRouter };
