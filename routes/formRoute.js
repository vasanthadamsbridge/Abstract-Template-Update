const { updateTemplateItems, updateTemplateFieldItems } = require("../controllers/formController");

const router = require("express").Router();

router.post("/update_template_items", updateTemplateItems);

router.post("/update_template_field_items", updateTemplateFieldItems);

module.exports = router;
