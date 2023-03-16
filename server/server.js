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
// Initial population of redis cache -> larger than subsequent calls
// Happens when server is activated
async function initialize() {
  await mongoose.connect(process.env.MONGO_URI);
  // First connects 
  try {
    // Pulls an aggregate of random images from the mongoDB
    const docs = await initialimages.aggregate([{ $sample: { size: 64 } }]);
    // Promisifies the Redis db (makes it async)
    const redisSetAsync = promisify(redisClient.set).bind(redisClient);
    // Assembles a group of promises taken from the aggregated db sample
    const promises = docs.map(async element => {
      // Awaits the element's url, then creates a binary 
      const response = await fetch(element.url);
      // Converts the data into a buffer from the received arrayBuffer obj
      const buffer = Buffer.from(await response.arrayBuffer());
      // Converts teh buffer to a base 64 string
      const imageData = buffer.toString('base64');
      // Assembles the ID from the retrieved DB entry and the image URL and places them into the redis db
      await redisSetAsync(element._id.toString(), imageData);
      // Confirms success of element storage 
      console.log(`Stored image ${element._id} in Redis cache.`);
    });
    // Ensures all of the promises have finished before moving out of the function
    await Promise.all(promises);
  } catch (err) {
    console.log('error in the initialize function ' + err);
  }
}

const app = express();
app.use((req, res, next) => {
  // Prevents cors errors 
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
const PORT = 3000;

// Runs initialize function

initialize();

// Runs on page load/page render
app.get('/getRedis', async (req, res) => {
  // Converts getting keys and getting values into async 
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
    // Turned into json format and passed along to the frontend 
    res.json({ images: imageUrls });
  } catch (err) {
    console.log('error in the /getRedis endpoint: ' + err);
    res.status(500).send('Error retrieving values from Redis cache.');
  }
});
// Runs when we scroll the window - populates additional images into redis cache
app.get('/more', async (req, res) => {
  try {
    // Turns .keys, .mget, and .flushdb into promises
    const redisKeysAsync = promisify(redisClient.keys).bind(redisClient);
    const redisMGetAsync = promisify(redisClient.mget).bind(redisClient);
    const redisFlush = promisify(redisClient.flushdb).bind(redisClient);
    // Flushes db of the previously rendered/already passed to browser images
    await redisFlush();
    // Collects another set of random images from the db (currently at about 100,000 images)
    const docs = await initialimages.aggregate([{ $sample: { size: 16 } }]);
    // Promisifies the redis db client setting 
    const redisSetAsync = promisify(redisClient.set).bind(redisClient);
    // Maps the aggregated image objects to place them into the db by converting to buffers, then to base 64 strings
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
