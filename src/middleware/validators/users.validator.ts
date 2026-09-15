import { body, param } from 'express-validator';
import { collections } from '../../services/database.services';
import { USER_ROLES } from '../../types/users.types';

const userEmailParamValidationRules = () => {
  return [
    param('email')
      .trim()
      .isEmail()
      .withMessage(
        'Email must be valid'
      )
      .normalizeEmail()
  ];
};

const userIdParamValidationRules = () => {
  return [
    param('userId')
      .isMongoId()
      .withMessage(
        'User ID must be a valid ObjectId'
      )
  ];
};

const userFieldValidationRules = (
  isUpdate = false
) => {
  const field = (name: string) => {
    const chain = body(name);
    return isUpdate
      ? chain.optional()
      : chain;
  };
  return [
    field('firstName')
      .isString()
      .withMessage('First name must be a string')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 1, max: 75 })
      .withMessage('First name must be between 1 and 75 characters')
      .matches(/^[A-Za-z\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    field('lastName')
      .isString()
      .withMessage('Last name must be a string')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 1, max: 75 })
      .withMessage('Last name must be between 1 and 75 characters')
      .matches(/^[A-Za-z\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    field('userName')
      .isString()
      .withMessage('User name must be a string')
      .trim()
      .notEmpty()
      .withMessage('User name is required')
      .isLength({
        min: 1,
        max: 75
      })
      .withMessage('User name must be between 1 and 75 characters'),
    body('phone')
      .optional()
      .isString()
      .withMessage('Phone must be a string')
      .trim()
      .matches(
        /^(\([0-9]{3}\)\s|[0-9]{3}-)[0-9]{3}-[0-9]{4}$/
      )
      .withMessage('Enter a valid US Phone Number'),
    field('email')
      .isString()
      .withMessage('Email must be a string')
      .bail()
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .bail()
      .isEmail()
      .withMessage('Email must be valid')
      .bail()
      .normalizeEmail()
      .custom(async (email, { req }) => {
        const userId = 
          req.params?.userId;
        const existingUser = 
          await collections.users.findOne({
            email
        });
        if (
          existingUser &&
          existingUser._id.toString() !== userId
        ) {
          throw new Error(
            'Email already in use'
          );
        }
        return true;
      })
  ];
};

const updateUserValidationRules = () => {
  return userFieldValidationRules(true);
};

const updateUserRoleValidationRules = () => {
  return [
    body('role')
      .exists()
      .withMessage('Role is required')
      .isString()
      .withMessage('Role must be a string')
      .isIn(USER_ROLES)
      .withMessage('Role must be a valid user role')
  ];
};

export {
  userEmailParamValidationRules,
  userIdParamValidationRules,
  updateUserValidationRules,
  updateUserRoleValidationRules
};
