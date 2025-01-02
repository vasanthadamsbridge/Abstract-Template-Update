const mongoose = require("mongoose");

const abstractTemplateSchema = new mongoose.Schema(
  {},
  {
    strict: false,
  }
);

const abstractTemplateModel = mongoose.model("abstract_template", abstractTemplateSchema);

module.exports = abstractTemplateModel;
