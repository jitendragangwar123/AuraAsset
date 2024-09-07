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
   .get("/get-property-details", assetController.getPropertyDatails)
   .get("/get-property-details-by-title", assetController.getPropertyDatailsByTitle)
   .post("/store-transactions-data",assetController.storeTransactionsData)
   .get("/get-transactions-data",assetController.getTransactionsData)
   .get("/get-properties-by-user-address",assetController.getPropertiesByUserAddress)
   .put("/:id/update-holding-tokens",assetController.updateHoldingTokens)
   .put("/:id/update-earned-yields",assetController.updateEarnedYields)

module.exports = router;
