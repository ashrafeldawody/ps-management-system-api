const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let DeviceSchema = new Schema({
	name: {type: String, required: true},
	type: {type: String, required: true},
	price: {type: Number, required: true},
	multi_price: {type: Number, required: true},
	games:[{name: String}]
}, {timestamps: true});

module.exports = mongoose.model("Device", DeviceSchema);