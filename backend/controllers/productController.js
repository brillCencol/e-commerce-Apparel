import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesData = await Promise.all(
          images.map(async (item) => {
            let result = await cloudinary.uploader.upload(item.path, {
              folder: "unistyle/products",
              resource_type: "image",
            });
            return {
              url: result.secure_url,
              public_id: result.public_id,
            };
          })
        );

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesData,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const toClient = (doc) => ({
  ...doc.toObject(),
  image: (doc.image || []).map(img => typeof img === 'string' ? img : img.url),
})

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({ success: true, products: products.map(toClient) })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        const product = await productModel.findById(req.body.id);
        if (!product) {
          return res.json({ success: false, message: "Product not found" });
        }

        // Delete each image from Cloudinary
        for (const img of product.image) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }

        // Then delete from MongoDB
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const singleProductGet = async (req, res) => {
  try {
    const p = await productModel.findById(req.params.id)
    if (!p) return res.json({ success: false, message: 'Not found' })
    res.json({ success: true, product: toClient(p) })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Product not found' });
    }

    // Parse JSON values
    const parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes || '[]');
    const parsedBest = bestseller === 'true' || bestseller === true;

    // Create a copy of current image array
    let updatedImages = Array.isArray(product.image) ? [...product.image] : [];

    // Helper to replace image slot if a new one is uploaded
    const replaceImage = async (fieldName, index) => {
      const file = req.files?.[fieldName]?.[0];
      if (!file) return; // no new file uploaded for this slot

      // If there’s an existing image in that slot, delete it first from Cloudinary
      if (updatedImages[index] && updatedImages[index].public_id) {
        await cloudinary.uploader.destroy(updatedImages[index].public_id);
      }

      // Upload new one
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'unistyle/products',
        resource_type: 'image',
      });

      // Replace in array
      updatedImages[index] = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    };

    // Try replacing each possible image field
    await replaceImage('image1', 0);
    await replaceImage('image2', 1);
    await replaceImage('image3', 2);
    await replaceImage('image4', 3);

    // Apply updates
    product.name = name;
    product.description = description;
    product.category = category;
    product.subCategory = subCategory;
    product.price = Number(price);
    product.sizes = parsedSizes;
    product.bestseller = parsedBest;
    product.image = updatedImages;

    await product.save();
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  singleProductGet,
  updateProduct,
}