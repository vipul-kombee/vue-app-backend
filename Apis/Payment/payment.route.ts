import express, { Router, RequestHandler } from 'express';
import auth from '../../Middlewares/auth';
import roleAccess from '../../Middlewares/roleAccess';
import { UserType } from '../../types';
import { createPaymentIntent, handleWebhook } from './payment.controller';

const router: Router = express.Router();

router.post(
    "/create-payment-intent",
    auth as RequestHandler,
    roleAccess([UserType.BUYER]) as RequestHandler,
    createPaymentIntent as RequestHandler
);

// Cast handleWebhook to RequestHandler to fix type mismatch
router.post(
    "/webhook",
    express.raw({ type: 'application/json' }),
    handleWebhook as RequestHandler
);

export default router; 