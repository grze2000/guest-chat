const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    userId: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    }
});

const RoomSchema = new Schema({
    roomId: {
        type: String,
        required: true
    },
    messages: [MessageSchema]
});

module.exports = mongoose.model('Room', RoomSchema, 'rooms');