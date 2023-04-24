//Get
    //Homepage
    exports.Homepage=async(req,res)=>{
        const locals={
        title:"Notes Buddy"
        }
        
        res.render('index',locals);
        
        
    }
    
    //Get
        //ABOUT
        // exports.about=async(req,res)=>{
        //     const locals={
        //     title:" ABOUT - Notes Buddy"
        //     }
            
        //     res.render('about',locals);
            
            
        // }
    
    
    