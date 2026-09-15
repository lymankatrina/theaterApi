import { Router } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { UsersController } from '../controllers/users.controller';

import { 
  validUser, 
  validAdmin,
  validUserOrAdmin 
} from '../middleware/permissions.middleware';

import { 
  userIdParamValidationRules, 
  userEmailParamValidationRules, 
  updateUserValidationRules,
  updateUserRoleValidationRules
} from '../middleware/validators/users.validator';

import { validate }  from '../middleware/validators/validate';
import { checkUserExists } from '../middleware/users.middleware';

export const userRouter = Router();

const controller = new UsersController();

userRouter.get(
  '/all', 
  requiresAuth(), 
  validAdmin, 
  controller.getUsers
); 

userRouter.get(
  '/me',
  requiresAuth(),
  checkUserExists,
  validUser,
  controller.getCurrentUser
);

userRouter.get(
  '/email/:email', 
  requiresAuth(),
  validAdmin,
  userEmailParamValidationRules(),
  validate, 
  controller.getUserByEmail
);

userRouter.get(
  '/:userId', 
  requiresAuth(), 
  validAdmin, 
  userIdParamValidationRules(), 
  validate, 
  controller.getUserById
);

userRouter.put(
  '/update/:userId', 
  requiresAuth(), 
  userIdParamValidationRules(), 
  updateUserValidationRules(), 
  validate, 
  validUserOrAdmin,
  controller.updateUserById
);

userRouter.put(
  '/role/:userId',
  requiresAuth(),
  validAdmin,
  userIdParamValidationRules(),
  updateUserRoleValidationRules(),
  validate,
  controller.updateUserRole
);

userRouter.delete(
  '/delete/:userId', 
  requiresAuth(), 
  validAdmin, 
  userIdParamValidationRules(), 
  validate, 
  controller.deleteUserById
);

export default userRouter;
