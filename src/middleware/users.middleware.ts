import { 
  Request, 
  Response, 
  NextFunction 
} from 'express';

import {
  MongoServerError
} from 'mongodb';

import type { User } from '../models/users.model';

import { collections } from '../services/database.services';

export const checkUserExists = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authUser = req.oidc?.user;

  if (!authUser?.sub || !authUser.email) {
    res.status(401).json({
      message: 'User information not available'
    });
    return;
  }

  const auth0Id = authUser.sub;
  const email = authUser.email;

  try {
    const existingUser = 
    await collections.users.findOne({ 
      auth0Id 
    });

    if (!existingUser) {
      const firstName = authUser.given_name;
      const lastName = authUser.family_name;
      const userName = authUser.name || email;

      if (!firstName || !lastName) {
        res.status(400).json({
          message: 'User profile is missing required name information'
        });
        return;
      }

      const newUser: User = {
        auth0Id,
        firstName,
        lastName,
        userName,
        email,
        role: 'customer',
        phone: 
          authUser.phone_number || undefined
      };
      
      await collections.users.insertOne(
        newUser
      );
    }
    
    next();
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.code === 11000
    ) {
      next();
      return;
    }
    console.error(
      'Failed to check or add user:', 
      error
    );

    res.status(500).json({
      message: 
        'Failed to check or add user'
    });
  }
};
