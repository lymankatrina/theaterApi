import { Request, Response } from 'express';
import { ObjectId, MongoServerError } from 'mongodb';
import { matchedData } from 'express-validator';

import type { UpdateUserInput, UpdateUserRoleInput } from '../dto/users.dto';
import { collections } from '../services/database.services';

export class UsersController {
  getUsers = async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const users = await collections.users
        .find(
          {},
          {
            projection: {
              auth0Id: 0
            }
          }
        )
        .sort({ 
          lastName: 1, 
          firstName: 1 
        })
        .toArray();
      res.status(200).json(users);
    } catch (error) {
      console.error(
        'Error fetching users:',
        error
      );
      res.status(500).json({
        message: 'Failed to fetch users'
      });
    }
  };

  getUserById = async (
    req: Request, 
    res: Response
  ): Promise<void> => {
    const { userId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const user =
        await collections.users.findOne({
          _id: new ObjectId(userId)
        },
      {
        projection: {
          auth0Id: 0
        }
      });
      if (!user) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(
        'Error fetching user:',
        error
      );
      res.status(500).json({
        message: 'Failed to fetch user'
      });
    }
  };

  getUserByEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = matchedData(req, {
      locations: ['params']
    });
    try {
      const user = 
        await collections.users.findOne({ 
          email 
        },
      {
        projection: {
          auth0Id: 0
        }
      });
      if (!user) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(
        'Error fetching user by email:',
        error
      );
      res.status(500).json({
        message: 'Failed to fetch user'
      });
    }
  };

  getCurrentUser = async (
    req:Request,
    res: Response
  ): Promise<void> => {
    const authUser = req.oidc?.user;
    if (!authUser?.sub) {
      res.status(401).json({
        message: 'User not authenticated'
      });
      return;
    }
    try {
      const user =
        await collections.users.findOne({
          auth0Id: authUser.sub
        });
      if (!user) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      res.status(200).json({
        userName: user.userName,
        role: user.role
      });
    } catch (error) {
      console.error(
        'Error fetching current user:',
        error
      );
      res.status(500).json({
        message: 'Failed to fetch current user'
      });
    }
  };

  updateUserById = async (
    req: Request, 
    res: Response
  ): Promise<void> => {
    const { userId } = matchedData(req, {
      locations: ['params']
    });
    const data = matchedData(req, {
      locations: ['body']
    }) as UpdateUserInput;
    if (Object.keys(data).length === 0) {
      res.status(400).json({
        message: 'No user fields provided for update'
      });
      return;
    }
    try {
      const result = 
        await collections.users.updateOne(
          { 
            _id: new ObjectId(userId) 
          }, 
          { 
            $set: data 
          }
        );
      if (result.matchedCount === 0) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      res.status(200).json({
        message:
          result.modifiedCount > 0
          ? 'User updated successfully'
          : 'User is already up to date'
      });
    } catch (error) {
      if (
        error instanceof MongoServerError &&
        error.code === 11000
      ) {
        res.status(409).json({
          message: 'Email already in use'
        });
        return;
      }
      console.error(
        'Error updating user:',
        error
      );
      res.status(500).json({
        message: 'Failed to update user'
      });
    }
  };

  updateUserRole = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { userId } = matchedData(req, {
      locations: ['params']
    });
    const data = matchedData(req, {
      locations: ['body']
    }) as UpdateUserRoleInput;
    try {
      const result = 
        await collections.users.updateOne(
          {
            _id: new ObjectId(userId)
          },
          {
            $set: {
              role: data.role
            }
          }
        );
      if (result.matchedCount === 0) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      res.status(200).json({
        message: result.modifiedCount > 0
          ? 'User role updated successfully'
          : 'User role is already up to date'
      });
    } catch (error) {
      console.error(
        'Error updating user role:',
        error
      );
      res.status(500).json({
        message:
          'Failed to update user role'
      });
    }
  };

  deleteUserById = async (
    req: Request, 
    res: Response
  ): Promise<void> => {
    const { userId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const result = 
        await collections.users.deleteOne({ 
          _id: new ObjectId(userId)
        });
      if (result.deletedCount === 0) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }
      res.status(200).json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error(
        'Error deleting user:',
        error
      );
      res.status(500).json({
        message: 'Failed to delete user'
      });
    }
  };
}
