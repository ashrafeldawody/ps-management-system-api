const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let ProductSchema = new Schema({
	name: {type: String, required: true},
	image: {data: Buffer, contentType: String},
	type: {type: String, required: true},
	quantity: {type: String, required: true},
	price: {type: Number, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Product", ProductSchema);