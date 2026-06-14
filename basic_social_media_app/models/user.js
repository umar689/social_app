const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    age:Number,
    profilepic:{
        type :String,
        default:'./uploads/images/person.png'
    },
    post: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }]
});
 
module.exports = mongoose.model("User", userSchema);