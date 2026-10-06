import { Router } from 'express';

import { userRouter } from '../routes/users.route';

import { movieRouter } from './movies.route';
import { seatsRouter } from './seats.route';
import { showtimeRouter } from './showtimes.route';
import { ticketsRouter } from './tickets.route';
import { concessionRouter } from './concessions.route';
import { priceRouter } from './prices.route';
import { cartRouter } from './carts.route';
import { swaggerRouter } from './swagger.route';

const routes = Router();

routes.use('/users', userRouter);
routes.use('/movies', movieRouter);
routes.use('/seats', seatsRouter);
routes.use('/showtimes', showtimeRouter);
routes.use('/tickets', ticketsRouter);
routes.use('/concessions', concessionRouter);
routes.use('/prices', priceRouter);
routes.use('/carts', cartRouter);
routes.use('/', swaggerRouter);

export default routes;
