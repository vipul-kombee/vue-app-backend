import Product from './product.model';
import { isValidObjectId } from 'mongoose';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { IProduct } from '../../types';
import { MulterError } from 'multer';
import { FilterQuery } from 'mongoose';



//code to store image files in particular folder
const storage = multer.diskStorage({
  destination: (cb: (error: Error | null, destination: string) => void) => {
    cb(null, "ImageUploads/"); // Define the directory where uploaded files will be stored
  },
  filename: ( file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + "-" + file.originalname); //define file name
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
})

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().exec();
    res.status(200).json({
      message: "Products fetched!",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in fetch products",
      error: error.message,
    });
  }
};

export const getSingleProduct = async (req: Request, res: Response) => {
    const productId: string = req.params.id;
    try {
        const product = await Product.findById(productId).exec();
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }
        res.status(200).json({
            message: "Product fetched!",
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error in fetch product",
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getProductsByuserId = (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        message: "userId is not valid",
        Id: userId,
      });
    }

    Product.find({ seller: userId })
      .exec()
      .then((products) => {
        res.status(200).json({
          message: "Products fetched!",
          totalProducts: products.length,
          products,
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Error in fetch products",
          error: error.message
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Error in fetch products",
      error: error.message
    });
  }
};

// exports.createProduct = (req, res) => {
//   const userId = req.params.userId;
//   upload.single("productImage")
//   try {
//     const product = new Product({
//       name: req.body.name,
//       price: req.body.price,
//       description: req.body.description,
//       seller: userId,
//     });

//     product
//       .save()
//       .then(() => {
//         res.status(201).json({
//           message: "Product added successfully!",
//           product,
//         });
//       })
//       .catch((err) => {
//         res.status(500).json({
//           message: "Error while creating product",
//           error: err,
//         });
//       });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error in create product",
//       error,
//     });
//   }
// };

export const createProduct = (req: Request, res: Response) => {
  
  //use upload middleware to handle upload of product image
  //except file with field name productimage
  upload.single("productImage")(req, res, (err: Error | MulterError | null) => {
    if (err) {
      return res.status(400).json({
        message: "Error uploading file",
        error: err
      });
    }

   //create object 
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      seller: req.params.userId,
      productImage: req.file ? `upload/${req.file.filename}` : undefined,
    });

    
    if (req.file) {  //check req.file is exists or not
      product.productImage = `upload/${req.file.filename}`;  //set productimage to path of uploaded file.
    }

      product.save()
        .then((savedProduct) => {
          res.status(201).json({
            message: "Product added successfully",
            product: savedProduct,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Error while creating product",
            error: err,
          });
        });
});
};

//update product Api
export const editProduct = async (req: Request, res: Response) => {
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

    upload.single("productImage")(req, res, async (err) => {
      if(err instanceof multer.MulterError) {
        return res.status(400).json({
          message: "File upload error",
          error: err.message
        });
      } else if (err) {
        return res.status(500).json({
          message: "Unknown error",
          error: err.message
        });
      }

      try {
        // Create update object from form-data
        const updateData: IProduct = {
          name: '',
          price: '',
          description: '',
          productImage: ''
        };

        // Only update fields that are present in the request
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.price) updateData.price = req.body.price;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.seller) updateData.seller = req.body.seller;

        // Add productImage to update data if a new image was uploaded
        if (req.file) {
          if(product.productImage){
            const oldImagePath = product.productImage.replace('upload/', '');
            const fullPath = `ImageUploads/${oldImagePath}`;

            if(fs.existsSync(fullPath)){
              fs.unlinkSync(fullPath);
            }
          }

          //update with new image path
          updateData.productImage = `upload/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          { $set: updateData },
          { new: true }
        );
        
        if (updatedProduct) {
          return res.status(200).json({
            message: "product updated!",
            product: updatedProduct,
          });
        } else {
          return res.status(404).json({
            message: "Product not updated",
          });
        } 
      } catch (error) {
        // If there's an error and a new file was uploaded, delete it
        if (req.file) {
          const filePath = `ImageUploads/${req.file.filename}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        return res.status(500).json({
          message: "Error updating product",
          error: error.message
        });
      }
    })
  } catch (error) {
    res.status(500).json({
      message: "Error in edit Product",
      error,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
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

     // Remove image from ImageUploads folder once its particular product deleted
     if (product.productImage) {
        const oldImagePath = product.productImage.replace('upload/', '');
        const fullPath = `ImageUploads/${oldImagePath}`;

        if(fs.existsSync(fullPath)){
          fs.unlinkSync(fullPath);
        }
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

//filtered products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      limit = "10",
      page = "1"
    } = req.query as {
      search?: string;
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      sortOrder?: string;
      limit?: string;
      page?: string;
    };

    //filter object
    let filter: FilterQuery<IProduct> = {};

    // Search by name or description
    if(search) {
      filter.$or = [
        {name: { $regex: search, $options: 'i'}},
        { description: { $regex: search, $options: 'i' } }
      ]
    }
   
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if(minPrice) filter.price.$gte = parseFloat(minPrice);
      if(maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1};
    }

    //calculate skip for pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    //get total count for pagination
    const total = await Product.countDocuments(filter);

    //Execute query
    const products = await Product.find(filter)
       .sort(sort)
       .skip(skip)
       .limit(parseInt(limit as string));

       const totalPages = Math.ceil(total / parseInt(limit as string));

    // Add aggregation for faceted search (optional)
    const aggregation = await Product.aggregate([
      { $match: filter },
      {
        $facet: {
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 100, 500, 1000, 5000],
                default: 'Other',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ]);   

    res.status(200).json({
      status: 'success',
      message: "fetch Filtered Products!",
      data: {
        pagination: {
          total,
          facets: aggregation[0],
          page: parseInt(page as string),
          totalPages,
          limit: parseInt(limit as string)
        },
        products
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error in Filtered Products",
      error,
    });
  }
}
