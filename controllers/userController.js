import userModel from "../models/userModel.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone, answer } =
      req.body;
    // validation
    if (
      !name ||
      !email ||
      !password ||
      !city ||
      !address ||
      !country ||
      !phone ||
      !answer
    ) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    //check exisiting user
    const exisitingUSer = await userModel.findOne({ email });
    //validation
    if (exisitingUSer) {
      return res.status(500).send({
        success: false,
        message: "email already taken",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });
    res.status(201).send({
      success: true,
      message: "Registeration Success, please login",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Register API",
      error,
    });
  }
};

//LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Add Email OR Password",
      });
    }
    // check user
    const user = await userModel.findOne({ email });
    //user valdiation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "USer Not Found",
      });
    }
    //check pass
    const isMatch = await user.comparePassword(password);
    //valdiation pass
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "invalid credentials",
      });
    }
    //teken
    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Successfully",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: "false",
      message: "Error In Login Api",
      error,
    });
  }
};



// LOGOUT
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout SUccessfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LOgout API",
      error,
    });
  }
};



// update user passsword
export const udpatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    //valdiation
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old or new password",
      });
    }
    // old pass check
    const isMatch = await user.comparePassword(oldPassword);
    //validaytion
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Old Password",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In update password API",
      error,
    });
  }
};



// FORGOT PASSWORD
export const passwordResetController = async (req, res) => {
  try {
    // user get email || newPassword || answer
    const { email, newPassword, answer } = req.body;
    // valdiation
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    // find user
    const user = await userModel.findOne({ email, answer });
    //valdiation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "invalid user or answer",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Your Password Has Been Reset Please Login !",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In password reset API",
      error,
    });
  }
};

// Oauth controller 
const loadAuth = (req, res) => {
  res.render('auth');
}

const successGoogleLogin = (req, res) => {
  if (!req.user)
    res.redirect('/failure');
  console.log(req.user);
  res.send("you are signed in as " + req.user.email);
}

const failureGoogleLogin = (req, res) => {
  res.send("Error");
}

export { loadAuth, successGoogleLogin, failureGoogleLogin };