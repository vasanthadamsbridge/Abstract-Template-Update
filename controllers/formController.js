const formService = require("../services/formService");

module.exports.updateTemplateItems = async (req, res) => {
  try {
    await formService.updateTemplateItems(req.body)
    return res.status(200).send({});
  } catch (error) {
    console.log("error", error);
    return res.status(500).send(error);
  }
}

module.exports.updateTemplateFieldItems = async (req, res) => {
  try {
    await formService.updateTemplateFieldItems(req.body)
    return res.status(200).send({});
  } catch (error) {
    console.log("error", error);
    return res.status(500).send(error);
  }
};

