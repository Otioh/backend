const express=require('express');
const mysql=require('mysql');
const cors=require('cors');
const mailer=require('./mailer');
const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'microskool',
    connectionLimit:10
})

const app=express();
app.use(cors())
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const responseObj={
    message:"",
    success:false,
    data:[]
}



const multer  = require('multer')

const multerStorage = multer.diskStorage({
    destination:(req, file, cb)=>{
cb(null, 'assets')
    },
    filename:(req, file, cb)=>{
        let ext=file.mimetype.split('/')[1];
        const email =req.params.email;

        let name=`${email?.split('@')[0]}--${Math.random(0,300)}`;
cb(null, `${name}.${ext}`)
pool.query("UPDATE users SET image='"+name+"' WHERE email='"+email+"'", (error, result, row)=>{
   
})
    }
})

const upload=multer({
    storage:multerStorage  
})
app.post('/profile/:email', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any



})

app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
})

const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
app.post('/cool-profile', cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
})















app.get('/', (req, res)=>{
   
res.send({...responseObj, message:"Welcome", success:true })
});


app.post('/', (req, res)=>{
    res.send({...responseObj, message:"Login Successful", success:true })
})


app.get('/users', (req, res)=>{
    pool.query("SELECT * FROM users", (error, result, row)=>{
        if(error){
            res.send({...responseObj, message:"Error Retrieving Users"})
        }else{
            res.send({...responseObj, data:result, success:true, message:"Users Retrieved Successfully"})
        }

    })

})



app.get('/auth/:email', (req, res)=>{
    pool.query("SELECT verified FROM users WHERE email='"+req.params.email+"'", (error, result, row)=>{
        if(error){
            res.send({...responseObj, message:"Error Retrieving Users"})
        }else{
          if(result[0]?.verified==='true'){
            res.send({...responseObj, data:result, success:true, message:"Users Validity Retrieved Successfully"})
          }else{
            let code=Math.floor(Math.random()*1000000);
            pool.query("UPDATE users SET verify_code="+code+" WHERE email='"+req.params.email+"'", (error, result, row)=>{
                if(error){}
            })
            
            mailer({recipients:req.params.email, subject:'Email Verification - Microskool', message:'Use this code to verify your Email: '+code})
            res.send({...responseObj, success:false, message:"Check your mailbox for a verification code "+req.params.email})
          }            
        }
    })
})





app.post('/auth/:email', (req, res)=>{
    let { code}=req.body;
    pool.query("SELECT * FROM users WHERE email='"+req.params.email+"' && verify_code='"+code+"' ", (error, result, row)=>{
        if(error){
            res.send({...responseObj, message:"Error Retrieving Users"})
        }else{
          if(result.length>0){
            pool.query("UPDATE users SET verified='true' WHERE email='"+req.params.email+"' && verify_code='"+code+"' ", (error, result, row)=>{
                if(error){
                    res.send({...responseObj, data:result, message:"Error Verifying Email, try again"})
        
                }else{
                    res.send({...responseObj, data:result, success:true, message:"Email verified Successfully"})
        
                }
            })                 
           }else{
            res.send({...responseObj, success:false, message:"Wrong Verification Code"})
          }            
        }
    })
})




app.post('/auth', (req, res)=>{
    let {email, password}=req.body;
    if(email===""||password===""){
        res.send({...responseObj, message:'Both Email & Password are required' })
    }else{

        pool.query("SELECT * FROM users WHERE email='"+email+"' && password='"+password+"'", (error, result, row)=>{
            if(error){
                res.send({...responseObj, message:"Error Validating Users"})
            }else{
                if(result.length>0){
                    res.send({...responseObj, data:result, success:true, message:"Logged in Successfully"})

                }else{
                    res.send({...responseObj, message:"Wrong Password"})
                }
            }
        })
    }
})



app.post('/users', (req, res)=>{
    let {first_name, surname, email, password, matric, phone }=req.body;
    if(first_name===""||surname===""||email===""||password===""||matric===""||phone===""){
        res.send({...responseObj, message:"All Fields are required"})
    }else{
        pool.query("SELECT * FROM users WHERE email='"+email+"' OR matric='"+matric+"'", (error, result, row)=>{
            if(error){
                res.send({...responseObj, message:"Error Validating Users"})
            }else{
            if(result.length>0){
                res.send({...responseObj, message:"Email or Matric Already Exist"})
            }   else{
                pool.query("INSERT INTO `users` (`id`, `first_name`, `surname`, `email`, `password`, `phone`, `matric`, `created_at`, `verified`, `verify_code`,  `campus`, `institution`,  `department`, `level`, `courses`, `image`, `coins`) VALUES (NULL, '"+first_name+"', '"+surname+"', '"+email+"', '"+password+"', '"+phone+"', '"+matric+"', '"+new Date()+"', 'false', '', '',  '', '', '', '', '',0)", (error, result, row)=>{
                   if(error){
                    res.send({...responseObj, message:"Error Occurred"+error})
                   }else{
                    res.send({...responseObj, success:true, message:"Signup Successfully"})
            }})  
            } 
            }
        })
    }
})






app.post('/users/:email', (req, res)=>{
    let {first_name, surname,  matric, institution, campus, department, level, courses}=req.body;

                pool.query("UPDATE `users` SET `first_name`='"+first_name+"',  `surname`='"+surname+"', `matric`='"+matric+"', `campus`='"+campus+"', `institution`='"+institution+"',  `department`='"+department+"', `level`='"+level+"', `courses`='"+courses+"' WHERE email='"+req.params.email+"'", (error, result, row)=>{
                   if(error){
                    res.send({...responseObj, message:"Error Occurred"+error})
                   }else{
                    res.send({...responseObj, success:true, message:"Profile Updated Successfully"})
            }})  
            
            
       

})





app.get('/users/:email', (req, res)=>{
    pool.query("SELECT * FROM users WHERE email='"+req.params.email+"'", (error, result, row)=>{
        if(error){
            res.send({...responseObj, message:"Error Retrieving Users"})
        }else{
            res.send({...responseObj, data:result, success:true, message:"Users Retrieved Successfully"})
        }

    })

})







app.get('/courses/:campus', (req, res)=>{

    pool.query("SELECT * FROM allcourse WHERE campus='"+req.params.campus+"'", (error, result, row)=>{
        if(error){
            res.send({...responseObj, success:false, message:"Error Fetching Courses", data:error})
          
        }else{
            res.send({...responseObj, success:true, message:"Courses Fetched Successfully", data:result})

        }
    })

})




app.get('/campuses', (req, res)=>{

    pool.query("SELECT * FROM campuses", (error, result, row)=>{
        if(error){
            res.send({...responseObj, success:false, message:"Error Fetching Campuses", data:error})
          
        }else{
            res.send({...responseObj, success:true, message:"Campuses Fetched Successfully", data:result})

        }
    })

})




app.get('/departments', (req, res)=>{

    pool.query("SELECT * FROM departments", (error, result, row)=>{
        if(error){
            res.send({...responseObj, success:false, message:"Error Fetching Departments", data:error})
          
        }else{
            res.send({...responseObj, success:true, message:"Departments Fetched Successfully", data:result})

        }
    })

})




app.post('/courses', (req, res)=>{
const {code, title, campus, department, level, user} =req.body;
pool.query("SELECT * FROM allcourse WHERE code='"+code+"'", (error, result, row)=>{
    if(error){
        res.send({...responseObj, success:false, message:"Error Validating Course", data:error})
    }else{
        if(result.length>0){
            res.send({...responseObj, success:false, message:"Course Already Exist", data:error})
        }else{
            pool.query("INSERT INTO `allcourse` (`id`, `code`, `title`, `campus`, `department`, `level`, `user`) VALUES (NULL, '"+code+"', '"+title+"', '"+campus+"', '"+department+"', '"+level+"', '"+user+"');", (error, result, row)=>{
                if(error){
                    res.send({...responseObj, success:false, message:"Error Creating Course", data:error})
                }else{
                    res.send({...responseObj, success:true, message:"Courses Created Successfully"})
            
                }
            
            })
            
        }
    }
})
})














app.listen(5000, ()=>console.log("Listening on 5000"));