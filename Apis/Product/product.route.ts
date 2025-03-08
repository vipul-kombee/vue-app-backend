import express, { Router } from 'express';
// const ProductController = require("./product.controller");
const auth = require("../../Middlewares/auth");
const roleAccess = require("../../Middlewares/roleAccess");
const UserController = require("../User/user.controller");

import { getProducts ,createProduct, searchProducts, getProductsByuserId, getSingleProduct, deleteProduct, editProduct } from './product.controller';

const router: Router = express.Router();

router.get(
  "/getProducts",
  auth,
  roleAccess(["SUPERADMIN", "BUYER"]),
  getProducts as express.RequestHandler
);
router.get(
  "/filterProducts",
  auth,
  searchProducts as express.RequestHandler
)
router.get(
  "/getProducts/:userId",
  auth,
  roleAccess(["SELLER"]),
  getProductsByuserId as express.RequestHandler
);
router.get(
  "/getProduct/:id",
  auth,
  roleAccess(["SELLER"]),
  getSingleProduct as express.RequestHandler
);
router.post(
  "/createProduct/:userId",
  auth,
  roleAccess(["SELLER"]),
  createProduct as express.RequestHandler
);
router.delete(
  "/deleteProduct/:id",
  auth,
  roleAccess(["SELLER"]),
  deleteProduct as express.RequestHandler
);
router.put(
  `/editProduct/:id`,
  auth,
  roleAccess(["SELLER"]),
  editProduct as express.RequestHandler
);

module.exports = router;
