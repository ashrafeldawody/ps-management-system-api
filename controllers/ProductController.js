const Product = require("../models/ProductModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

function ProductData(data) {
	this.name= data.name;
	this.type = data.type;
	this.price = data.price;
	this.quantity = data.multi_price;
}

/**
 * Product List.
 * 
 * @returns {Object}
 */
exports.productList = [
	auth,
	function (req, res) {
		try {
			Product.find().select("name type quantity price").then((Products)=>{
				if(Products.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", Products);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.productDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Product.findOne({_id: req.params.id}).select("name type quantity price").then((product)=>{
				if(product !== null){
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(res, "Operation success", productData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.productStore = [
	auth,
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Product.findOne({name : value}).then(product => {
			if (product) {
				return Promise.reject("Product already exist with this name.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			let product = new Product(
				{ 	name: req.body.name,
					type: req.body.type,
					quantity: req.body.quantity ? req.body.quantity : -1,
					price: req.body.price
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save Product.
				product.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(res,"Product add Success.", productData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.productUpdate = [
	auth,
	body("name", "Name must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Product.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(product => {
			if (product) {
				return Promise.reject("Product already exist with this name.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			let product = new Product(
				{ 	name: req.body.name,
					type: req.body.type,
					quantity: req.body.quantity ? req.body.quantity : -1,
					price: req.body.price,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Product.findById(req.params.id, function (err, foundProduct) {
						if(foundProduct === null){
							return apiResponse.notFoundResponse(res,"Product not exists with this id");
						}else{
							Product.findByIdAndUpdate(req.params.id, product, {},function (err) {
								if (err) { 
									return apiResponse.ErrorResponse(res, err); 
								}else{
									let productData = new ProductData(product);
									return apiResponse.successResponseWithData(res,"Product update Success.", productData);
								}
							});
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.productDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Product.findById(req.params.id, function (err, foundProduct) {
				if(foundProduct === null){
					return apiResponse.notFoundResponse(res,"Product not exists with this id");
				}else{
					//Check authorized user
					if(foundProduct.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						Product.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Product delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];