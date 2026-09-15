import { Router } from 'express';

import { movieRouter } from './movies.route';

const routes = Router();

routes.use('/movies', movieRouter);

export default routes;
