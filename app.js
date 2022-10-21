require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const limiter = require('./utils/rateLimiter');
const mongoUrl = require('./utils/mongoUrl');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const errorHandler = require('./errors/errorHandler');

const { PORT = 3000, NODE_ENV, MONGO_DB } = process.env;

const app = express();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);
app.use(requestLogger);
app.use(limiter);

app.use('/', require('./routes'));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

async function main() {
  await mongoose.connect(NODE_ENV === 'production'
    ? MONGO_DB
    : mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });

  app.use(errorLogger);
  app.use(errors());

  app.use(errorHandler);

  await app.listen(PORT);
  console.log(`App listening on port ${PORT}`);
}

main();
