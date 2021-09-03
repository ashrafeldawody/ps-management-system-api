const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let BillSchema = new Schema({
	name: {type: Schema.Types.ObjectId, ref: "Device"},
	play_sessions: [{startTime: { type: Date, default: Date.now },endTime: { type: Date, default: null },type: { type: String, enum : ["Single","Multi"], default: "Single" }, }],
	cafe_items:[{item: {type: Schema.Types.ObjectId, ref: "Device"},quantity: {type: Number,default:1}}],
	quantity: {type: String, required: true},
	price: {type: Number, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Bill", BillSchema);