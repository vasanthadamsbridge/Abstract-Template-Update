const mongoose = require("mongoose");

const abstractTemplateFieldSchema = new mongoose.Schema(
  {},
  {
    strict: false,
  }
);

const abstractTemplateFieldModel = mongoose.model("abstract_template_field", abstractTemplateFieldSchema);

module.exports = abstractTemplateFieldModel;
