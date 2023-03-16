require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const initialImagesRouter = require("./routes/initialImagesRouter");
const mongoose = require('mongoose');
const Redis = require('redis');
const redisClient = Redis.createClient();
const { promisify } = require('util');
// const fetch = require('node-fetch');

const initialimages = mongoose.model('initialimages', new mongoose.Schema({}));

async function initialize() {
  await mongoose.connect(process.env.MONGO_URI);

  try {
    const docs = await initialimages.aggregate([{ $sample: { size: 64 } }]);
    const redisSetAsync = promisify(redisClient.set).bind(redisClient);
    const promises = docs.map(async element => {
      const response = await fetch(element.url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const imageData = buffer.toString('base64');
      await redisSetAsync(element._id.toString(), imageData);
      console.log(`Stored image ${element._id} in Redis cache.`);
    });
    await Promise.all(promises);
  } catch (err) {
    console.log('error in the initialize function ' + err);
  }
}


const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
const PORT = 3000;


initialize();

//this isnt working

app.get('/getRedis', async (req, res) => {
  const redisKeysAsync = promisify(redisClient.keys).bind(redisClient);
  const redisMGetAsync = promisify(redisClient.mget).bind(redisClient);

  try {
    // Retrieve all keys in Redis cache
    const keys = await redisKeysAsync('*');
    // Retrieve values for all keys in Redis cache
    const values = await redisMGetAsync(keys);

    // Decode the base64 encoded PNG image data and create an array of image URLs
    const imageUrls = values.map(value => {
      if (value) {
        return "data:image/png;base64," + value;
      } else {
        return null;
      }
    });

    res.json({ images: imageUrls });
  } catch (err) {
    console.log('error in the /getRedis endpoint: ' + err);
    res.status(500).send('Error retrieving values from Redis cache.');
  }
});

app.get('/more', async (req, res) => {
  try {
    const redisKeysAsync = promisify(redisClient.keys).bind(redisClient);
    const redisMGetAsync = promisify(redisClient.mget).bind(redisClient);
    const redisFlush = promisify(redisClient.flushdb).bind(redisClient);

    await redisFlush();
    const docs = await initialimages.aggregate([{ $sample: { size: 16 } }]);
    const redisSetAsync = promisify(redisClient.set).bind(redisClient);
    const promises = docs.map(async element => {
      const response = await fetch(element.url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const imageData = buffer.toString('base64');
      await redisSetAsync(element._id.toString(), imageData);
      console.log(`Stored image ${element._id} in Redis cache.`);
    });
    const tempUrls = await Promise.all(promises);
    // Retrieve all keys in Redis cache
    const keys = await redisKeysAsync('*');
    // Retrieve values for all keys in Redis cache
    const values = await redisMGetAsync(keys);

    // Decode the base64 encoded PNG image data and create an array of image URLs
    const imageUrls = values.map(value => {
      if (value) {
        return "data:image/png;base64," + value;
      } else {
        return null;
      }
    });

    res.json({ images: imageUrls });
    
  }


    // res.json({ images: imageUrls });
   catch (err) {
    console.log('error in the /more endpoint: ' + err)}
})

// const imageController = require("./controllers/imageController");
const imagesV2Router = require("./routes/imagesV2Router");

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());


app.use("/imagesV2", imagesV2Router);
app.use("/initialImages", initialImagesRouter);

// catch-all route handler for any requests to an unknown route
app.use((req, res) => res.status(404).send("This is not the page you're looking for..."));

// Global error handler -- CHANGE TO NOT SHOW CLIENT ANYTHING TOO SPECIFIC, BUT RATHER SHOW A GENERIC CONSOLE LOG FOR NOW. CAN CHANGE TO AN ERROR PAGE/RESPONSE LATER?
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
