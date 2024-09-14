const express = require("express");
const router = express.Router();
const Post = require("../routes/models/Post");
const User = require("../routes/models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;
/*
 
  CHECK LOGIN 
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/*
 *GET/
 *ADMIN-LOGIN PAGE
 */

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with node js ,express  and mongodb",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
/*
 *POSt/
 *ADMIN-check login
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});
/*
 *GET/
 *ADMIN DASHBOARD
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "simple blog created with  nodejs ,express and mongodb",
    };

    const data = await Post.find();

    res.render("admin/dashboard", {
      locals,
      data,
      layout:adminLayout
    });
  } catch (error) {
    console.log(error);
  }

  
});

/*
*GET/
*ADMIN create new post
*/

router.get("/add-post", authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: "Add Post",
        description: "simple blog created with  nodejs ,express and mongodb",
      };
  
      const data = await Post.find();
  
      res.render("admin/add-post", {
        locals,
        layout: adminLayout
      });
    } catch (error) {
      console.log(error);
    }
  });
  /*
*Post/
*ADMIN create new post
*/

router.post("/add-post", authMiddleware, async (req, res) => {
    try {
    try {
      const newPost= new Post({
        title:req.body.title,
        body:req.body.body
      });
      await Post.create(newPost);
      res.redirect('/dashboard');
      
    } catch (error) {
      console.log(error);
    }
    } catch (error) {
      console.log(error);
    }
  });
    /*
*GET/
*ADMIN create new post
*/

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "simple blog created with  nodejs ,express and mongodb",
    };
   
 const data=await Post.findOne({_id: req.params.id })
  res.render('admin/edit-post',{
    locals,
    data,
    layout:adminLayout
  }) 

  } catch (error) {
    console.log(error);
  }
});

  /*
*PUT/
*ADMIN create new post
*/

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
   
await Post.findByIdAndUpdate(req.params.id,{
  title:req.body.title,
  body:req.body.body,
  updatedAt: Date.now()
});
  res.redirect(`/edit-post/${req.params.id}`)     

  } catch (error) {
    console.log(error);
  }
});

//router.post("/admin", async (req, res) => {
//  try {
//  const { username, password } = req.body;
//if (req.body.username === "admin" && req.body.password === "password") {
//res.send("you are logged in");
//} else {
//res.send("wrong user name or password");
// }
//} catch (error) {
//console.log(error);
//}
//});
/*
 *post/
 *ADMIN-register
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code == 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

/*
 *Delelte/
 *ADMIN-Delete

 */
 
router.delete('/delete-post/:id',authMiddleware,async (req,res)=>{
try {
  await Post.deleteOne({_id:req.params.id});
  res.redirect('/dashboard');
} catch (error) {
  console.log(error);
  
}
})
/*
GET
*Admin logout
*/
router.get('/logout',(req,res)=>{
  res.clearCookie('token');
 // res.json({message:'Logout SuccessFull Please Visit Again'})
 res.redirect('/')
})
module.exports = router;
