import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { UsersController } from '../controllers/users.controller';

import { validUser, validAdmin, validUserOrAdmin } from '../middleware/permissions.middleware';

import {
  userIdParamValidationRules,
  updateUserValidationRules,
  updateUserRoleValidationRules,
  userEmailQueryValidationRules
} from '../middleware/validators/users.validator';

import { validate } from '../middleware/validators/validate';
import { checkUserExists } from '../middleware/users.middleware';

export const userRouter = Router();

const controller = new UsersController();

userRouter.get('/', requiresAuth(), userEmailQueryValidationRules(), validate, validAdmin, controller.getUsers);

userRouter.get('/me', requiresAuth(), checkUserExists, validUser, controller.getCurrentUser);

userRouter.get('/:userId', requiresAuth(), validAdmin, userIdParamValidationRules(), validate, controller.getUserById);

userRouter.put(
  '/:userId',
  requiresAuth(),
  userIdParamValidationRules(),
  updateUserValidationRules(),
  validate,
  validUserOrAdmin,
  controller.updateUserById
);

userRouter.patch(
  '/:userId/role',
  requiresAuth(),
  validAdmin,
  userIdParamValidationRules(),
  updateUserRoleValidationRules(),
  validate,
  controller.updateUserRole
);

userRouter.delete('/:userId', requiresAuth(), validAdmin, userIdParamValidationRules(), validate, controller.deleteUserById);

export default userRouter;
