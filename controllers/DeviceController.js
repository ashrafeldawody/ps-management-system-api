const Device = require("../models/DeviceModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

function DeviceData(data) {
	this.name= data.name;
	this.type = data.type;
	this.price = data.price;
	this.multi_price = data.multi_price;
	this.games = data.games;
}

/**
 * Device List.
 *
 * @returns {Object}
 */
exports.deviceList = [
	auth,
	function (req, res) {
		try {
			Device.find().select("name type quantity price").then((Devices)=>{
				if(Devices.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", Devices);
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
 * Device Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.deviceDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Device.findOne({_id: req.params.id}).select("name type quantity price").then((device)=>{
				if(device !== null){
					let deviceData = new DeviceData(device);
					return apiResponse.successResponseWithData(res, "Operation success", deviceData);
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
 * Device store.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.deviceStore = [
	auth,
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Device.findOne({name : value}).then(device => {
			if (device) {
				return Promise.reject("Device already exist with this name.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			let device = new Device(
				{
					name: req.body.name,
					type: req.body.type,
					games: req.body.games,
					price: req.body.price,
					multi_price: req.body.multi_price
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save Device.
				device.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let deviceData = new DeviceData(device);
					return apiResponse.successResponseWithData(res,"Device add Success.", deviceData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Device update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.deviceUpdate = [
	auth,
	body("name", "Name must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Device.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(device => {
			if (device) {
				return Promise.reject("Device already exist with this name.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			let device = new Device(
				{
					name: req.body.name,
					type: req.body.type,
					games: req.body.games,
					price: req.body.price,
					multi_price: req.body.multi_price,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Device.findById(req.params.id, function (err, foundDevice) {
						if(foundDevice === null){
							return apiResponse.notFoundResponse(res,"Device not exists with this id");
						}else{
							Device.findByIdAndUpdate(req.params.id, device, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}else{
									let deviceData = new DeviceData(device);
									return apiResponse.successResponseWithData(res,"Device update Success.", deviceData);
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
 * Device Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.deviceDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Device.findById(req.params.id, function (err, foundDevice) {
				if(foundDevice === null){
					return apiResponse.notFoundResponse(res,"Device not exists with this id");
				}else{
					//Check authorized user
					if(foundDevice.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						Device.findByIdAndRemove(req.params.id,function (err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							}else{
								return apiResponse.successResponse(res,"Device delete Success.");
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