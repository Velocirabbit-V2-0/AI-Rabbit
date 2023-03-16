const express = require("express");
const router = express.Router();

const imagesController = require("../controllers/imageV2Controller");

router.post("/save_image", imagesController.saveImage, (req, res) => {
  res.status(200).json("image saved");
});

router.get("/get_image", imagesController.getImageById, (req, res) => {
  console.log("res 0", res.locals.image);
  res.status(200).json(res.locals.image);
});

router.get("/", (req, res) => {
  res.status(200).json("images v2");
});

router.get("/get_all_images", imagesController.getAllImages, (req, res) => {
  res.status(200).json(res.locals.images);
});

module.exports = router;
