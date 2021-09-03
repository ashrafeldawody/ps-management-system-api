const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let ControllerSchema = new Schema({
	id: {type: Number, required: true},
	issues: [{type: String, fixed: Boolean}],
}, {timestamps: true});

module.exports = mongoose.model("Controller", ControllerSchema);