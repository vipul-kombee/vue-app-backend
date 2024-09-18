const express = require('express')
const router = express.Router();
const ProductController = require('./product.controller');

router.get('/getProducts', ProductController.getProducts);
router.post('/createProduct/:userId', ProductController.createProduct);
router.delete('/deleteProduct/:id', ProductController.deleteProduct);

module.exports = router;