const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const db = require("./db");
const formsRoutes = require("./routes/formRoute");

dotenv.config();
try {
  const PORT = 17000;
  const DOMAIN = process.env.DOMAIN;

  const app = express();
  app.use(express.json({ limit: "50mb", extended: true }));
  app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
  var corsOptions = { origin: "*" };
  app.use(cors(corsOptions));

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  // Routes
  app.use("/templateScript/api", formsRoutes);

  db.connect()
    .then(() => {
      app.listen(PORT, DOMAIN, () => {
        console.log(`Form => Server running on domain ${DOMAIN} port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Form => Server error:", error);
    });
} catch (error) {
  console.log(error);
}
