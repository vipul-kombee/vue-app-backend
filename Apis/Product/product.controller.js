const Product = require("./product.model");
const { isValidObjectId } = require("mongoose");

exports.getProducts = (req, res) => {
  try {
    Product.find()
      .exec()
      .then((products) => {
        res.status(200).json({
          message: "Products fetched!",
          products,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Error in fetch products",
      error,
    });
  }
};

exports.getSingleProduct = (req, res) => {
    const productId = req.params.id;
    try {
        Product.findById(productId).exec()
        .then((product) => {
            res.status(200).json({
                message: "Product fetched!",
                product,
              });
        })
        .catch(() => {
            res.status(500).json({
              message: "Error in fetch product",
              error,
            });
          });
    } catch (error) {
        res.status(500).json({
          message: "Error in fetch product",
          error,
        });
      }
}

exports.getProductsByuserId = (req, res) => {
  const userId = req.params.userId;
  try {
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "userId is not valid",
        Id: productId,
      });
    }

    Product.find({ seller: userId })
      .exec()
      .then((products) => {
        res.status(200).json({
          message: "Products fetched!",
          products,
        });
      })
      .catch(() => {
        res.status(500).json({
          message: "Error in fetch products",
          error,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Error in fetch products",
      error,
    });
  }
};

exports.createProduct = (req, res) => {
  const userId = req.params.userId;
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      seller: userId,
    });

    product
      .save()
      .then(() => {
        res.status(201).json({
          message: "Product added successfully!",
          product,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Error while creating product",
          error: err,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Error in create product",
      error,
    });
  }
};

exports.editProduct = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      message: "userId is not valid",
      Id: productId,
    });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({
        message: "product not found with this id",
        Id: productId,
      });
    }

    const updateProduct = await Product.findByIdAndUpdate(productId, {
      $set: {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        seller: req.body.seller,
      },
    });

    if (updateProduct) {
      return res.status(200).json({
        message: "product updated!",
        updateProduct,
      });
    } else {
      res.status(404).json({
        message: "Product not updated",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error in edit Product",
      error,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      message: "userId is not valid",
      Id: productId,
    });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({
        message: "product not found with this id",
        Id: productId,
      });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in delete Product",
      error,
    });
  }
};
