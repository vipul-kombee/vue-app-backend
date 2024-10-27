const express = require("express");
const router = express.Router();
const ProductController = require("./product.controller");
const auth = require("../../Middlewares/auth");
const roleAccess = require("../../Middlewares/roleAccess");
const UserController = require("../User/user.controller");

router.get(
  "/getProducts",
  auth,
  roleAccess(["SUPERADMIN", "BUYER"]),
  ProductController.getProducts
);
router.get(
  "/getProducts/:userId",
  auth,
  roleAccess(["SELLER"]),
  ProductController.getProductsByuserId
);
router.get(
  "/getProduct/:id",
  auth,
  roleAccess(["SELLER"]),
  ProductController.getSingleProduct
);
router.post(
  "/createProduct/:userId",
  auth,
  roleAccess(["SELLER"]),
  ProductController.createProduct
);
router.delete(
  "/deleteProduct/:id",
  auth,
  roleAccess(["SELLER"]),
  ProductController.deleteProduct
);
router.put(
  `/editProduct/:id`,
  auth,
  roleAccess(["SELLER"]),
  ProductController.editProduct
);

module.exports = router;
