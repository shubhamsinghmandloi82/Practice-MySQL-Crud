const express=require('express')
const router=express.Router()
const controller=require('../controller/userController')
const { verifyTokenFn }=require('../utils/token')
const multer=require('multer')

// multer code here for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src/uploads')
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })



router.post('/createNewUser',upload.single('profile_image'),controller.createNewUser)
router.post('/resendVerificationCode',controller.resendVerificationCode)
router.post('/verifyUser',controller.verifyUser)
router.post('/login',controller.login)

router.get('/userProfile',verifyTokenFn,controller.userProfile)
router.put('/updateProfile',verifyTokenFn,upload.single('profile_image'),controller.updateProfile)
router.delete('/deleteProfile',verifyTokenFn,controller.deleteProfile)


router.post('/changePassword',verifyTokenFn,controller.changePassword)
// forgot password with otp
router.post('/forgotPassword',controller.forgotPassword)
router.post('/forgotChangePassword',controller.forgotChangePassword)
// forgot password with link
router.post('/forgotPasswordLink',controller.forgotPasswordLink)
router.post('/forgotChangePasswordLink/:token',controller.forgotChangePasswordLink)


router.post('/sendNotification',controller.sendNotification)



//---------------------- for table api show in console -----------------
var Table = require('cli-table');
var table = new Table({
    head: ['Method', 'Middlewares','Routes','Controllers']
  , colWidths: [10,30,30,30]
});

for (let key of router.stack){
        let val = key ; 
        if (val.route){
            val = val.route ;
          
            let test = {}
            test[val.stack[0].method] = val.path ;
            test[val.stack[0].method] = [val.stack[0].name] 
            let data = val.path.split('/')
            test[val.stack[0].method].push(val.path) 
            test[val.stack[0].method] .push (data[1])
            table.push(test)
        }  
}
console.log(table.toString());


module.exports=router;