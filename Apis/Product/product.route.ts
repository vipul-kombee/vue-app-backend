import express, { Router, RequestHandler } from 'express';
// const ProductController = require("./product.controller");

import auth from '../../Middlewares/auth';
import roleAccess from '../../Middlewares/roleAccess';
import { UserType } from '../../types';

import { getProducts, createProduct, searchProducts, getProductsByuserId, getSingleProduct, deleteProduct, editProduct } from './product.controller';

const router: Router = express.Router();

router.get(
  "/getProducts",
  auth as RequestHandler,
  roleAccess([UserType.SUPERADMIN, UserType.BUYER]) as RequestHandler,
  getProducts as RequestHandler
);
router.get(
  "/filterProducts",
  auth as RequestHandler,
  searchProducts as RequestHandler
)
router.get(
  "/getProducts/:userId",
  auth as RequestHandler,
  roleAccess([UserType.SELLER]) as RequestHandler,
  getProductsByuserId as RequestHandler
);
router.get(
  "/getProduct/:id",
  auth as RequestHandler,
  roleAccess([UserType.SELLER]) as RequestHandler,
  getSingleProduct as RequestHandler
);
router.post(
  "/createProduct/:userId",
  auth as RequestHandler,
  roleAccess([UserType.SELLER]) as RequestHandler,
  createProduct as RequestHandler
);
router.delete(
  "/deleteProduct/:id",
  auth as RequestHandler,
  roleAccess([UserType.SELLER]) as RequestHandler,
  deleteProduct as RequestHandler
);
router.put(
  `/editProduct/:id`,
  auth as RequestHandler,
  roleAccess([UserType.SELLER]) as RequestHandler,
  editProduct as RequestHandler
);


export default router;
