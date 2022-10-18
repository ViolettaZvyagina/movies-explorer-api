require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { userRouter, movieRouter } = require('./routes/index');
const limiter = require('./utils/rateLimiter');
const mongoUrl = require('./utils/mongoUrl');
const { validateLogin, validateCreateUser } = require('./middlewares/validation');
const NotFoundError = require('./errors/notFoundError');
const { createUser, login, logout } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

const { PORT = 3000, NODE_ENV, MONGO_DB } = process.env;

const app = express();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);
app.use(requestLogger);
app.use(limiter);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post(
  '/signin',
  validateLogin,
  login,
);
app.post(
  '/signup',
  validateCreateUser,
  createUser,
);

app.use(auth);

app.post('/signout', logout);

app.use('/users', userRouter);

app.use('/movies', movieRouter);

app.use(errorLogger);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

async function main() {
  await mongoose.connect(NODE_ENV === 'production'
    ? MONGO_DB
    : mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });

  app.use(errors());

  app.use((err, req, res, next) => {
    const { statusCode = 500, message } = err;
    res
      .status(statusCode)
      .send({
        message: statusCode === 500
          ? 'На сервере произошла ошибка'
          : message,
      });
    next();
  });

  await app.listen(PORT);
  console.log(`App listening on port ${PORT}`);
}

main();
