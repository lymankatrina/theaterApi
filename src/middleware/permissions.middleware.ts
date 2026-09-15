import { 
  Request, 
  Response, 
  NextFunction 
} from 'express';
import { collections } from '../services/database.services';

const validUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authUser = req.oidc?.user;
  if (!authUser?.sub) {
    res.status(401).json({
      message: 'User not authenticated'
    });
  return;
  }
  try {
    const user = await collections.users.findOne({
      auth0Id: authUser.sub
    });
    if (!user) {
      res.status(403).json({
        message: 'Access denied'
      });
    return;
    }
    next();
  } catch (error) {
    console.error(
      'Error validating user:',
      error
    );
    res.status(500).json({
      message: 'Failed to validate user'
    });
  }
};

const validAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authUser = req.oidc?.user;
  if (!authUser?.sub) {
    res.status(401).json({
      message: 'User not authenticated'
    });
  return;
  }
  try {
    const user = await collections.users.findOne({
      auth0Id: authUser.sub
    });
    if (!user || user.role !== 'admin') {
      res.status(403).json({
        message: 'Access denied'
      });
      return;
    }
    next();
  } catch (error) {
    console.error(
      'Error validating administrator:',
      error
    );
    res.status(500).json({
      message:'Failed to validate administrator'
    });
  }
};

const validUserOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authUser = req.oidc?.user;
  const { userId } = req.params;

  if (!authUser?.sub) {
    res.status(401).json({
      message: 'User not authenticated'
    });
    return;
  }
  try {
    const user = await collections.users.findOne({
      auth0Id: authUser.sub
    });
    if (!user) {
      res.status(403).json({
        message: 'Access denied'
      });
      return;
    }
    const isOwnProfile =
      user._id.toString() === userId;
    if (
      !isOwnProfile && 
      user.role !== 'admin'
    ) {
      res.status(403).json({
        message: 'Access denied'
      });
      return;
    }
    next();
  } catch (error) {
    console.error(
      'Error validating user permissions:',
      error
    );
    res.status(500).json({
      message: 'Failed to validate user permissions'
    });
  }
};

export { 
  validUser, 
  validAdmin, 
  validUserOrAdmin 
};
