const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUser = async (req, res, next) => {

    const userId = req.userData.userId;

    const user = await User.findById(userId, '-password');

    res.json({user: user});
};

const signup = async (req, res, next) => {
  console.log("signup", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (e) {
        console.log("Finding");
        const error = new HttpError('Signing up failed.', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exists already.', 422);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (e) {
        console.log(e);
        const error = new HttpError('Signing up failed.', 500);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        signupDate: new Date().toISOString().split('T')[0]
    });

    try {
        await createdUser.save();
    } catch (e) {
        console.log("Saving")
        const error = new HttpError('Creating user failed.', 500);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: createdUser.id }, process.env.JWT_KEY, { expiresIn: '1h' });
    } catch (e) {
        console.log("Token")
        const error = new HttpError('Signing up failed.', 500);
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });

};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (e) {
        const error = new HttpError('Sign in failed.', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials.', 403);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (e) {
        const error = new HttpError('Sign in failed.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials.', 403);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_KEY, { expiresIn: '8760h' });
    } catch (e) {
        const error = new HttpError('Signing in failed.', 500);
        return next(error);
    }

    res.json({ userId: existingUser.id, email: existingUser.email, token: token });

};

exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
