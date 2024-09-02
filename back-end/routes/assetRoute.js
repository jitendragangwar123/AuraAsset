const express = require("express");
const assetController = require("../controllers/assetControllers");
const router = express.Router();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
    .get("/get-property-details", assetController.getPropertyDatails)
    .get("/get-property-details-by-title", assetController.getPropertyDatailsByTitle)


module.exports = router;