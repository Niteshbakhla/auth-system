import { User } from "../models/User.js"
import { LoginInput, RegisterInput } from "../modules/auth/auth.validation.js";
import AppError from "../utils/customError.js";
import { comparePassword, hashPassword } from "../utils/password.js";





export const registerUser = async (payload: RegisterInput) => {
    let { name, email, password } = payload;
    password = await hashPassword(password)
    return await User.create({ name, email, password });

}


export const loginUser = async (payload: LoginInput) => {
    const { email, password } = payload;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
        throw new AppError("Invalid email or password", 401);
    }



    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        await User.updateOne({ _id: user._id }, { $inc: { loginAttempts: 1 } })
        throw new AppError("Invalid email or password", 400)
    }

    user.lastLoginAt = new Date()
    await user.save();


    user.loginAttempts = 0;
    await user.save();


    user.password = undefined;
    return user;
}