const authorModel = require("../models/authorModel")
const jwt=require("jsonwebtoken")



// ----------------------------------------- Email Validation ------------------------------------------------------

const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
const nameRegex = /^[ a-z ]+$/i
const strongPwd=/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/

// ----------------------------------------- CREATE AUTHOR ---------------------------------------------------------

const createAuthor = async function (req, res) {
  try {  
      const author_data = req.body

      // -------------------------- Checking for all the fields --------------------------------

      if (Object.keys(author_data).length == 0) { 
        return res.status(400).send({ status: false, msg: "Please Provide Data" })
      }

      if (!author_data.fname) {
        return res.status(400).send({ status: false, msg: "fname is required" })
      }
      author_data.fname = author_data.fname.trim()

      if (!author_data.fname.match(nameRegex)) {
        return res.status(400).send({ status: false, msg: "Please Provide correct input for fname" })
      }
      if (!author_data.lname) {
        return res.status(400).send({ status: false, msg: "lname is required" })
      }
      author_data.lname = author_data.lname.trim()

      if (!author_data.lname.match(nameRegex)) {
        return res.status(400).send({ status: false, msg: "Please Provide correct input for lname" })
      }

      if (!author_data.title) {
        return res.status(400).send({ status: false, msg: "title is required" })
      }
      if (["Mr", "Mrs", "Miss"].indexOf(author_data.title) == -1) {
        return res.status(400).send({ status: false, msg: "Invalid title, Please select from Mr, Mrs, Miss" })
      }
      if (!author_data.email) {
        return res.status(400).send({ status: false, msg: "email is required" })
      }
      if (!emailRegex.test(author_data.email))
        return res.status(400).send({ status: false, message: "Please Enter Email in valid Format" })

      let duplicateEmail = await authorModel.findOne({ email: author_data.email });
      if (duplicateEmail) {
        return res.status(400).send({ status: false, msg: "Email already exists!" });
      }
      if (!author_data.password) {
        return res.status(400).send({ status: false, msg: "password is required" })
      }
      if (!strongPwd.test(author_data.password))
      return res.status(400).send({ status: false, message: "Please Enter Strong Password Format" })


      let authorCreated = await authorModel.create(author_data)
      res.status(201).send({ status: true, Message: "New author created successfully", author_data: authorCreated })
    
  }catch (error) {
      res.status(500).send({ status: false, Error: error.message })
    }
  }

//-------------------------------------------login author-----------------------------------------------------------//



const loginAuthor = async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    if (Object.keys(req.body).length == 0) {
      return res.status(400).send({ status: false, msg: "Data is required" })
    }
    let user = await authorModel.findOne({ email: email, password: password });


    if (!email) {
      return res.status(400).send({ status: false, msg: "email is required" })
    }

    if (!emailRegex.test(user.email)){
        return res.status(400).send({ status: false, message: "Email valid Format not match found" })
    }
        if (!strongPwd.test(user.password))
      return res.status(400).send({ status: false, message: "Use Strong Password " })

      

    if(!user){
      return res.status(400).send({status: false, msg: "Incorrect Email or password" })
    }

    if (!password) {
      return res.status(400).send({ status: false, msg: "password is required" })
    }
    
   
    
     let token = jwt.sign({authorId:user._id,email:user.email}, "this is my privet key");
    res.setHeader("x-api-key", token);
    res.send({ status: true, token: token });
  } catch (error) {
    res.status(500).send({ staus: false, msg: error.message })
  }
};

module.exports.loginAuthor=loginAuthor
module.exports.createAuthor = createAuthor;



