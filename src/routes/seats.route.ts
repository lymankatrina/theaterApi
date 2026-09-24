import { Router } from 'express';
import { SeatsController } from '../controllers/seats.controller';

const seatsRouter = Router();
const seatsController = new SeatsController();

seatsRouter.get('/', seatsController.getSeats);

export { seatsRouter };
