import express from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../config.js';

const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, config.JWT.secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default verifyToken;