const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    content: String,
    date: {
        type: Date,
        default: Date.now
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    likes :[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]
});

module.exports = mongoose.model("Post", postSchema);