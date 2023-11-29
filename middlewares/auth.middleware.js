import UserModel from '../models/user.model.js';
import responseModel from '../models/response.model.js';
import jwt from 'jsonwebtoken';

var checkUserAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            // Get Token from header
            token = req.headers.authorization.split(' ')[1];;

            // Verify Token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)

            // Get User from Token
            req.user = await UserModel.findById(userID).select('-password')
            next()
        } catch (error) {
            //console.log(error)
            res.status(401).send(responseModel.error(401,"Unauthorized User",error));
            //res.status(401).send({ "status": "failed", "message": "Unauthorized User" })
        }
    }
    if (!token) {
        res.status(401).send(responseModel.error(401,"Unauthorized User, No Token"));
        //res.status(401).send({ "status": "failed", "message": "Unauthorized User, No Token" })
    }
}

export default checkUserAuth