import express, { Router } from 'express';
import { register, login, logout, forgotPass, resetPass } from './user.controller';

const router: Router = express.Router();

router.post("/signup", register as express.RequestHandler);
router.post("/signin", login as express.RequestHandler);
router.post("/logout", logout as express.RequestHandler);
router.post("/forgot-password", forgotPass as express.RequestHandler);
router.post("/reset-password/:token", resetPass as express.RequestHandler);

export default router;
