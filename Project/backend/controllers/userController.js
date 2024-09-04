import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../'

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



        res.status(201).json(user)
    }
}