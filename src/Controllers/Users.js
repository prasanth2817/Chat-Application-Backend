import usersModel from "../Models/Users.js";
import Auth from "../Common/Auth.js";
import EmailService from "../Common/EmailServices.js";

const createUsers = async (req, res) => {
  try {

    let user = await usersModel.findOne({ email: req.body.email });
    if (!user) {
      req.body.password = await Auth.hashPassword(req.body.password);
      await usersModel.create(req.body);
      res.status(201).send({ message: "Account Created sucessfully" });
    } else
      res
        .status(400)
        .send({ message: `user ${req.body.email} Already Exists` });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    let user = await usersModel.findOne({ email: req.body.email });
    if (user) {
      let hashCompare = await Auth.hashCompare(
        req.body.password,
        user.password
      );
      if (hashCompare) {
        let token = await Auth.createToken({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        });
        res.status(200).send({ message: "Login successfull", token });
      } else {
        res.status(400).send({ message: "Invalid Password" });
      }
    } else
      res.status(400).send({ message: `user ${req.body.email} Not Exists` });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const user = await usersModel.findOne(
      { email: req.body.email },
      { password: 0 }
    );
    if (user) {
      const token = await Auth.createToken({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user._id,
      });
      const resetUrl = `http://localhost:8002/reset-password/${token}`;
      const emailContent = {
        to: user.email,
        subject: "Reset Password Request",
        text: `Dear ${user.firstName},\n\nWe received a request to reset your password. Click the link below to reset your password:\n\n${resetUrl}`,
        html: `<p>Dear ${user.firstName},</p><p>We received a request to reset your password. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      };
      await EmailService.sendMail(emailContent);
      res.status(200).send({
        message: "The password reset link has been sent to your email.",
      });
    } else {
      return res.status(404).send({
        message: "User not found. Please enter a registered email address.",
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);
    if (req.body.newpassword === req.body.confirmpassword) {
      let user = await usersModel.findOne({ email: data.email });
      user.password = await Auth.hashPassword(req.body.newpassword);
      await user.save();

      res.status(200).send({
        message: "Password Updated Successfully",
      });
    } else {
      res.status(400).send({
        message: "Password Does Not match",
      });
    }
  } catch (error) {
    res.status(401).send({
      message: "Invalid or expired token",
    });
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// const getUsersByIds = async (req, res) => {
//   try {
//     const { ids } = req.body; // Extract IDs from the request body
//     const users = await usersModel.find({ _id: { $in: ids } }); // Fetch users whose IDs match the provided IDs

//     // Check if any users were found
//     if (users.length > 0) {
//       res.status(200).send(users); // Return the found users
//     } else {
//       res.status(404).send({ message: "No users found." }); // Handle case where no users are found
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .send({ message: "Internal Server error", error: error.message }); // Handle server errors
//   }
// };

export default {
  createUsers,
  Login,
  forgetPassword,
  resetPassword,
};
