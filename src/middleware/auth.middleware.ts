import { auth } from 'express-openid-connect';

import { getEnv } from '../config/env';

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: getEnv('SECRET'),
    baseURL: getEnv('BASE_URL'),
    clientID: getEnv('CLIENT_ID'),
    issuerBaseURL: getEnv('ISSUER_BASE_URL')
};

const authMiddleware = auth(config);

export { authMiddleware };
