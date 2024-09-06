const mongoose = require("mongoose");

const metrics = new mongoose.Schema({
    accuracy: { type: Number, required: true },
    precision: { type: Number, required: true },
    recall: { type: Number, required: true },
    f1Score: { type: Number, required: true },
    specificity: { type: Number, required: true }
});

const models = new mongoose.Schema({
    modelName: { type: String, required: true },
    metrics: metrics
});

const user = new mongoose.Schema({
    email: {type: String, required: true, unique:true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    models: [models]
}, {
    timestamps: true
});

const User = mongoose.model('User', user);

module.exports = User;