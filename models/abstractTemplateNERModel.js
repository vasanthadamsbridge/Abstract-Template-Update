const mongoose = require("mongoose");

const abstractTemplateNERSchema = new mongoose.Schema(
  {},
  {
    strict: false,
  }
);

const abstractTemplateNERModel = mongoose.model("abstract_template_ner", abstractTemplateNERSchema);

module.exports = abstractTemplateNERModel;
