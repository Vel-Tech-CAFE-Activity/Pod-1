const express=require('express');
const router=express.Router();
const dashboardController=require('../controllers/dashboardController');



router.get('/dashboard',dashboardController.dashboard);
//get is changed to post



module.exports=router;