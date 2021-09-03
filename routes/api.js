const express = require("express");
const authRouter = require("./auth");
const productRouter = require("./product");
const deviceRouter = require("./device");

const app = express();

app.use("/auth/", authRouter);
app.use("/product/", productRouter);
app.use("/device/", deviceRouter);

module.exports = app;