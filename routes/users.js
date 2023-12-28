var express = require('express');
const { hashPassword, createToken, hashCompare } = require('../controllers/auth');
const { UserModel } = require('../models/userSchema');
var router = express.Router();

// signup user
router.post("/signup", async (req, res)=>{
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    if(!user){
      req.body.password = await hashPassword(req.body.password);
      let data = new UserModel(req.body);
      await data.save();
      res.status(200).json({message: "User signed up successfully"});
    } else {
      res.status(401).json({message: "User already exists"});
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// signin user
router.post('/signin', async (req, res) => {
  try {
    const { userVerify, password } = req.body;
    let user = await UserModel.findOne({
      $or: [{ phone: userVerify }, { email: userVerify }],
    });
    console.log(user);
      if(user){
          if(await hashCompare(password, user.password)){
              let token = createToken({ _id: user._id, name: user.name, shirtSize: user.shirtSize, hipSize: user.hipSize })

              res.status(200).json({message: "User successfully logged in", token, userName: user.name });
          } else {
              res.status(401).json({message: "Invalid credentials"})
          }
      } else {
          res.status(404).json({message: "User not found"})
      }           
       
      } catch (error) {
        console.log(error);
      res.status(500).json({ message: "Internal Server Error", error });      
      }
});

// send password reset request via mail
router.post('/forgot-password', async (req, res)=>{
  try {
    let user = await UserModel.findOne({email: req.body.email})
      if(user){
        let token = Math.random().toString(36).slice(-8);
        user.resetlink = token;
        user.resetExpiresAt = Date.now() + 360000 //1hr
        await user.save()

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
      });
 
      const message = {
        from: 'nodemailer@gmail.com',
        to: user.email,
        subject: "password reset request",
        text: `To reset your password, Kindly click on the following link reset your password:
             ${fe_url}/reset-password/${token}
         Kindly ignore the mail if you have not requested a password reset.`
    }

    transporter.sendMail(message, (error, info)=>{
      if(error){
        res.status(404).json({message: "Something went wrong. Please try again."})
      }
      console.log(info.response)
      res.status(200).json({message: "Password reset requested successfully"})
    })

      } else {
          res.status(404).send({message: "User not found"})
      }  
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
})

// Set new password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // const data = await decodeToken(token);
    const user = await UserModel.findOne({
      resetlink: token,
      resetExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid Token" });
    }

    // Reset the user's password
    user.password = await hashPassword(password);
    user.resetlink = null;
    user.resetExpiresAt = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// User logout route
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

module.exports = router;