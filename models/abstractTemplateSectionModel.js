const mongoose = require("mongoose");

const abstractTemplateSectionSchema = new mongoose.Schema(
  {},
  {
    strict: false,
  }
);

const abstractTemplateSectionModel = mongoose.model("abstract_template_section", abstractTemplateSectionSchema);

module.exports = abstractTemplateSectionModel;
