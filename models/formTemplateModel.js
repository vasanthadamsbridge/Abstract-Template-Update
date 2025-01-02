const mongoose = require("mongoose");

const formTemplateSchema = new mongoose.Schema(
  {},
  {
    strict: false,
  }
);

const formTemplateModel = mongoose.model("form_template", formTemplateSchema);

module.exports = formTemplateModel;
