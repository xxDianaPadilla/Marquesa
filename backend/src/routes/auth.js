import express from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../config.js';
import verifyToken from '../middlewares/validateAuthToken.js';

const router = express.Router();

router.get('/verify', (req, res) => {
    try {
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided',
                isAuthenticated: false 
            });
        }

        const decoded = jwt.verify(token, config.JWT.secret);
        
        res.status(200).json({
            id: decoded.id,
            userType: decoded.userType,
            isAuthenticated: true
        });
        
    } catch (error) {
        console.error('Error verificando token:', error);
        
        res.status(401).json({ 
            message: 'Invalid or expired token',
            isAuthenticated: false 
        });
    }
});

router.get('/user-info', verifyToken, async (req, res) => {
    try {
        const {id, userType} = req.user;

        if(userType === 'admin'){
            const adminInfo = {
                id: 'admin',
                name: 'Administrador',
                email: config.admin.email,
                profilePicture: config.admin.profilePicture,
                birthdate: config.admin.birthdate,
                address: config.admin.address,
                dui: config.admin.dui,
                phone: config.admin.phone,
                userType: 'admin'
            };

            return res.json({success: true, user: adminInfo});
        }else{
            return res.json({
                success: true,
                user: {
                    id,
                    userType,
                    message: 'Implementar consulta a base de datos para usuarios regulares (en proceso)'
                }
            });
        }
    } catch (error) {
        console.error('Error getting user info: ', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

export default router;