const express = require("express");
const assetController = require("../controllers/assetControllers");
const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({});
const upload = multer({
    storage,
    limits: {
        fieldSize: 10 * 1024 * 1024,
    },
});
router
    .get("/", assetController.welcomeMsg)
    .post("/list-property", upload.array("images", 4), assetController.listProperty)
    .get("/getPropertyDatails", assetController.getPropertyDatails)
    .get("/getPropertyDatailsByTitle", assetController.getPropertyDatailsByTitle)


module.exports = router;