const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.js');

// Register

const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            email,
            password: await bcrypt.hash(password, 42),
            name
        });

        await user.save();

        const token = generateToken(user);

        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const Matched = await bcrypt.compare(password, user.password);

        if (!Matched) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
};

const getUser = async (req, res) => {
    const { email } = req.params;
  
    try {
        const user = await User.findOne({ email }).select('-password');
  
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
  
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const addModel = async (req, res) => {
    const { email } = req.params;
    const { modelName, metrics } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.models.push({ modelName, metrics });
        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getModels = async (req, res) => {
    const { email } = req.params;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.models.map(model => model.modelName));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

const getModelMetrics = async (req, res) => {
    const { email, modelName } = req.params;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const model = user.models.find(model => model.modelName === modelName);

        if (!model) {
            return res.status(404).json({ msg: 'Model not found' });
        }

        res.json({ modelName: model.modelName, metrics: model.metrics });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

module.exports = { register, login, getUser, addModel, getModels, getModelMetrics };