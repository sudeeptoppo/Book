const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// Try this specific variation
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  googleId: { type: String },

  readBooks: [
    {
      type: Schema.Types.ObjectId,
      ref: "bookListing",
    },
  ],
});

// Force the check: If it's an object, we use the default property
const plugin =
  typeof passportLocalMongoose === "function"
    ? passportLocalMongoose
    : passportLocalMongoose.default;

userSchema.plugin(plugin);

module.exports = mongoose.model("User", userSchema);
