import { SquareEnvironment } from 'square';
import { getEnv } from './env';

const squareEnvironment = getEnv('SQUARE_ENVIRONMENT');

let environment: SquareEnvironment;
switch (squareEnvironment) {
  case 'sandbox':
    environment = SquareEnvironment.Sandbox;
    break;
  case 'production':
    environment = SquareEnvironment.Production;
    break;
  default:
    throw new Error('SQUARE_ENVIRONMENT must be sandbox or production');
}
export const squareConfig = {
  token: getEnv('SQUARE_ACCESS_TOKEN'),
  environment
};
