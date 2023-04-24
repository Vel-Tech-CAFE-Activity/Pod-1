exports.dashboard=async(req,res)=>{
    const locals={
    title:" DASHBOARD - Notes Buddy"
    }
    res.render('dashboard/index',{
        locals,
        layout: '../views/layouts/dashboard'
    })
    
    
}
