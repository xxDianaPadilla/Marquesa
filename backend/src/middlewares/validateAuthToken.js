import jsonWebToken from "jsonwebtoken"
import {config }from "../config.js"

export const validateAuthToken = (aLLowedUserTypes = []) =>{

    return (req, res, next) =>{

        try {

            const {authToken} = req.cookies;
            if (!authToken) {
                return res.json({message:"no auth token, you must login firts"});

               
            }
            const decoded = jsonWebToken.verify(authToken, config.JWT.secret);
            if (!aLLowedUserTypes.includes(decoded.userType)) {
                return res.json({message: "Access denied"})
                
            }
            next();

            
        } catch (error) {
            console.log("error", error)
        }
    }
}