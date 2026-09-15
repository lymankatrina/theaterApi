import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from '../../openapi.json';

export const swaggerRouter = Router();

swaggerRouter.use(
  '/api-docs',
  swaggerUi.serve
);

swaggerRouter.get(
  '/api-docs',
  swaggerUi.setup(swaggerDocument)
);