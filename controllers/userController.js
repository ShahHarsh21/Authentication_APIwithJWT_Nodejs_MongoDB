import UserModel from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class UserController {
    static userRegistration = async (req, res) => {
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
                        const saved_user = await UserModel.findOne({ email: email });
                        // Generate Token
                        const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
                        res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
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

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email: email });
                if (user) {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (user.email === email && isMatch) {
                        // Generate Token
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
                        res.status(200).send({ "status": "success", "message": "Login Success", "token": token })
                    } else {
                        res.send({ "status": "Failed", "message": "Email or Password is not Valid" });
                    }
                } else {    
                    res.send({ "status": "Failed", "message": "You are not a Register User" });
                }
            } else {
                res.send({ "status": "Failed", "message": "All fields are required" });
            }
        } catch (error) {
            console.log(error);
            res.send({ "status": "Failed", "message": "Unable to Login" });
        }
    }

    static changeUserPassword = async (req,res) => {
        const {password, password_confirmation} = req.body;
        if(password && password_confirmation){
            if(password === password_confirmation){
                const salt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(password, salt);
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
                res.send({ "status": "success", "message": "Password changed succesfully" })
            }else{
                res.send({ "status": "Failed", "message": "Password and Confirm Password doesn't match" });
            }
        }else{
            res.send({ "status": "Failed", "message": "All fields are required" });
        }
    }   


}

export default UserController;