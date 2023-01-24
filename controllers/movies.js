const Movie = require('../models/movie');
const NotFoundError = require('../errors/notFoundError');
const ValidateError = require('../errors/validateError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ owner: req.user._id });
    res.status(200).send(movies);
  } catch (err) {
    next(err);
  }
};

module.exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create({ ...req.body, owner: req.user._id });
    return res.status(201).send(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidateError('Переданы некорректные данные при создании фильма'));
      return false;
    }
    return next(err);
  }
};

module.exports.deleteMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const owner = req.user._id;
    const movie = await Movie.findOne({ movieId, owner });
    if (!movie) {
      throw new NotFoundError('Фильм по указанному id не найден');
    }
    if (movie.owner.toString() !== owner) {
      throw new ForbiddenError('Нет прав на удаление фильма');
    }
    await Movie.findOneAndRemove({ movieId, owner });
    return res.status(200).send(movie);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ValidateError('Передан некорректный id фильма'));
      return false;
    }
    return next(err);
  }
};
