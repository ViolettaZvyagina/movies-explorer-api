const userRouter = require('express').Router();
const { validateUpdateProfile } = require('../middlewares/validation');

const {
  updateProfile,
  getUser,
} = require('../controllers/users');

userRouter.get('/me', getUser);
userRouter.patch(
  '/me',
  validateUpdateProfile,
  updateProfile,
);

module.exports = { userRouter };
