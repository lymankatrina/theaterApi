import {
  Request,
  Response,
  NextFunction
} from 'express';

import {
  validationResult
} from 'express-validator';

export const validate = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      errors: errors.array().map(error => {
        if (error.type === 'field') {
          return {
            [error.path]: error.msg
          };
        }
        return {
          validation: error.msg
        };
      })
    });
    return;
  }
  next();
};
