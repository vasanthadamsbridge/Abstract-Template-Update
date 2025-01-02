const mongoose = require("mongoose");

const templateColumnStatusRightSchema = new mongoose.Schema(
  {},
  {
    strict: false,
  }
);

const templateColumnStatusRightModel = mongoose.model("template_columnstatusright", templateColumnStatusRightSchema);

module.exports = templateColumnStatusRightModel;
