const mongoose = require("mongoose");
const bookListing = require("../models/listing.js");
const rawData = require("./data.js");

const mongoUrl = "mongodb://localhost:27017/newBookReview";

const initializeData = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("MongoDB connected");
    
    await bookListing.deleteMany({});
    const processedData = rawData.map((listing) => ({ 
      ...listing, 
      owner: "69d97aae8ba7fdf0949adc77" 
    }));
    await bookListing.insertMany(processedData);
    console.log("Data initialized successfully");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.connection.close();
  }
};

initializeData();
