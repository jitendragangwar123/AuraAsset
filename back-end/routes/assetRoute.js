const express = require("express");
const assetController = require("../controllers/assetControllers");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../front-end/public/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
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