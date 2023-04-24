const express=require('express');
const router=express.Router();
const mainController=require('../controllers/mainController');

//App Routers
router.get('/',mainController.Homepage);
//get is changed to post


module.exports=router