import { Router } from 'express';

import { userRouter } from '../routes/users.route';

import { movieRouter } from './movies.route';
import { swaggerRouter } from './swagger.route';

const routes = Router();

routes.use('/users', userRouter);
routes.use('/movies', movieRouter);
routes.use('/', swaggerRouter);

export default routes;
