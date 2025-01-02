const { updateTemplateItems } = require("../controllers/formController");

const router = require("express").Router();

router.post("/update_template_items", updateTemplateItems);

module.exports = router;
