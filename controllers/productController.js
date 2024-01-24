const Product = require("../models/ProductModal");
const { success, error } = require("../utils/responseWrapper");
const ApiFeatures = require("../utils/apiFeature");
const cloudinary = require("cloudinary");

exports.createProduct = async (req, res) => {
  try {
    let productDetails = req.body.productDetails;

    for (let i = 0; i < productDetails.length; i++) {
      let images = productDetails[i].images;
      const imagesLinks = [];

      for (let j = 0; j < images.length; j++) {
        const result = await cloudinary.v2.uploader.upload(images[j], {
          folder: "products",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      productDetails[i].images = imagesLinks;
    }

    req.body.productDetails = productDetails;

    const product = await Product.create(req.body);

    res.send(success(200, product));
  } catch (e) {
    console.log("Error Occured", e.message);
    res.send(error(500, e.message));
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    res.send(
      success(200, {
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
      })
    );
  } catch (e) {
    res.send(error(500, e.message));
  }
};

//Get All Products (Admin)
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.send(success(200, products));
  } catch (e) {
    res.send(500, e.message);
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    console.log(product);

    if (!product) {
      return res.send(error(404, "Product not found"));
    }

    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await Product.deleteOne({ _id: req.params.id });

    res.send(success(200, "Product Delete Successfully"));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

// Get Product Details
exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.send(error(404, "Product Not Found"));
    }
    res.send(success(200, product));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

// Update Product -- Admin

exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      flavour,
      weightPrice,
      longDescription,
      StockSmall: Stock,
    } = req.body;
    const { id } = req.params;
    let product = await Product.findById(id);

    if (!product) {
      return res.send(error(404, "Product not found"));
    }

    // Images Start Here
    /*  let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if (images !== undefined) {
      // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      req.body.images = imagesLinks;
    } */

    if (name) {
      product.name = name;
    }
    if (Stock) {
      product.Stock = Stock;
    }
    if (flavour) {
      product.flavour = flavour;
    }
    if (longDescription) {
      product.longDescription = longDescription;
    }
    if (description) {
      product.description = description;
    }
    if (category) {
      product.category = category;
    }
    if (weightPrice) {
      product.weightPrice = weightPrice;
    }
    /* if (images) {
      product.images = imagesLinks;
    } */

    await product.save();

    res.send(success(200, product));
  } catch (e) {
    console.log(e);
    res.send(error(500, e.message));
  }
};
