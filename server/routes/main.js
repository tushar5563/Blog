const express = require('express');
const router = express.Router();
const Post = require('../routes/models/Post');

// Routes
router.get('/', async (req, res) => {
  try {
    // Local variables to be passed to the view
    const locals = {
      title: 'My First Project',
      content: 'Yo, let\'s do it!',
    };

    // Pagination settings
    let perPage = 10;
    let page = parseInt(req.query.page) || 1;

    // Fetching paginated data
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    // Getting the total count of posts
    const count = await Post.countDocuments();
    const nextPage = page + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    // Render the 'index' view with the retrieved data
    res.render('index', {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error'); // Send an error response to the client
  }
});

// About page route



router.get('/post/:id',async(req,res)=>{
    try{
  

 let slug=req.params.id;




        const data=await Post.findById({_id: slug});
        const locals={
            title: data.title,
            desciption:"Simple Blog created with Nodejs  ,express and mongodb",
            currentRoute: `/post/${slug}`
         }
        res.render('post',{locals,data});

    }catch(error){
        console.log(error);
    }

})


router.post('/search',async(req,res)=>{
  

    try{
        const locals={
            title:"search"
    
        }
     let searchTerm=req.body.searchTerm;
    const  searchNoSpecialChar= searchTerm.replace(/[^a-zA-Z0-9]/g,"")

     const data=await Post.find({
        $or:[
            {title:{$regex:new RegExp(searchNoSpecialChar,'i')}},
            {body:{$regex:new RegExp(searchNoSpecialChar,'i')}}
        ]
     });
        res.render("search",{
            data,
            locals
        });
    }catch(error){
        console.log(error);
    }

})





router.get('/about', (req, res) => {
    res.render('about',{
      currentRoute: '/about'
    });
  });

module.exports = router;
 