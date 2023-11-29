import UserModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import transporter from '../config/emailConfig.js';
import responseModel from '../models/response.model.js';


class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (user) {
            res.status(400).send(responseModel.error(400, "Email already exists"));
            //res.status(400).send({ "status": "Failed", "message": "Email already exists" });
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
                        res.status(201).send(responseModel.success(201, "Registration Success", { token: token }));
                        //res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
                    } catch (error) {
                        //console.log(error)
                        res.status(500).send(responseModel.error(500, "Unable to Register", error));
                        //res.status(500).send({ "status": "failed", "message": "Unable to Register" })
                    }
                } else {
                    res.status(400).send(responseModel.error(400, "Password and Confirm Password doesn't match"));
                    //res.status(400).send({ "status": "Failed", "message": "Password and Confirm Password doesn't match" });
                }
            } else {
                res.status(400).send(responseModel.error(400, "All fields are required"));
                //res.status(400).send({ "status": "Failed", "message": "All fields are required" });
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
                        res.status(200).send(responseModel.success(200, "Login Success", { token: token }));
                        //res.status(200).send({ "status": "success", "message": "Login Success", "token": token })
                    } else {
                        res.status(400).send(responseModel.error(400, "Email or Password is not Valid"));
                        //res.status(400).send({ "status": "Failed", "message": "Email or Password is not Valid" });
                    }
                } else {
                    res.status(400).send(responseModel.error(400, "You are not a Register User"));
                    //res.status(400).send({ "status": "Failed", "message": "You are not a Register User" });
                }
            } else {
                res.status(400).send(responseModel.error(400, "All fields are required"));
                //res.status(400).send({ "status": "Failed", "message": "All fields are required" });
            }
        } catch (error) {
            //console.log(error);
            res.status(500).send(responseModel.error(500, "Unable to Login", error));
            //res.status(500).send({ "status": "Failed", "message": "Unable to Login" });
        }
    }

    static changeUserPassword = async (req, res) => {
        const { password, password_confirmation } = req.body;
        if (password && password_confirmation) {
            if (password === password_confirmation) {
                const salt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(password, salt);
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } });
                res.status(200).send(responseModel.success(200, "Password changed succesfully"));
                //res.status(200).send({ "status": "success", "message": "Password changed succesfully" })
            } else {
                res.status(400).send(responseModel.error(400, "Password and Confirm Password doesn't match"));
                //res.status(400).send({ "status": "Failed", "message": "Password and Confirm Password doesn't match" });
            }
        } else {
            res.status(400).send(responseModel.error(400, "All fields are required"));
            //res.status(400).send({ "status": "Failed", "message": "All fields are required" });
        }
    }

    static loggedUser = async (req, res) => {
        res.status(200).send(responseModel.success(200, "Get user data successfully", { user: req.user }));
        //res.status(200).send({ "status": "success", "message": "Get user data successfully", "user": req.user })
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body;
        if (email) {
            const user = await UserModel.findOne({ email: email });
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
                console.log(link);

                // Send Email
                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "GeekShop - Password Reset Link",
                    html: `<a href=${link}>Click Here</a> to Reset Your Password`
                })

                res.status(200).send(responseModel.success(200, "Password Reset Email Sent... Please Check Your Email"));
                //res.status(200).send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" })
            } else {
                res.status(400).send(responseModel.error(400, "Email doesn't exists"));
                //res.status(400).send({ "status": "Failed", "message": "Email doesn't exists" });
            }
        } else {
            res.status(400).send(responseModel.error(400, "Email fields are required"));
            //res.status(400).send({ "status": "Failed", "message": "Email fields are required" });
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body;
        const { id, token } = req.params;
        const user = await UserModel.findById(id);
        const new_secret = user._id + process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, new_secret);
            if (password && password_confirmation) {
                if (password === password_confirmation) {
                    const salt = await bcrypt.genSalt(10);
                    const newHashPassword = await bcrypt.hash(password, salt);
                    await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });
                    res.status(200).send(responseModel.success(200, "Password Reset Successfully"));
                    //res.status(200).send({ "status": "success", "message": "Password Reset Successfully" });
                } else {
                    res.status(400).send(responseModel.error(400,"Password and Confirm Password doesn't match"));
                    //res.status(400).send({ "status": "Failed", "message": "Password and Confirm Password doesn't match" });
                }
            } else {
                res.status(400).send(responseModel.error(400,"All fields are required"));
                //res.status(400).send({ "status": "Failed", "message": "All fields are required" });
            }
        } catch (error) {
            res.status(400).send(responseModel.error(400,"Invalid Token",error));
            //res.status(400).send({ "status": "failed", "message": "Invalid Token" });
        }
    }


}

export default UserController;