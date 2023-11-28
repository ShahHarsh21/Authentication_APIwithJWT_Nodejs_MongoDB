import UserModel from '../models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class UserController {
    static UserRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (user) {
            res.send({ "status": "Failed", "message": "Email already exists" });
        } else {
            if (name && email && password && password_confirmation && tc) {
                if (password === password_confirmation) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = await bcrypt.hash(password, salt);
                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc
                        })
                        await doc.save();
                    } catch (error) {
                        console.log(error)
                        res.send({ "status": "failed", "message": "Unable to Register" })
                    }
                } else {
                    res.send({ "status": "Failed", "message": "Password and Confirm Password doesn't match" });
                }
            } else {
                res.send({ "status": "Failed", "message": "All fields are required" });
            }
        }
    }
}