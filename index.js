const express=require('express');
const mysql=require('mysql');
const cors=require('cors');
const path=require('path');
const fs=require('fs');
const misbFormat = require("./TS/misb");
const mailer=require('./mailer');
const pool = mysql.createPool({
  host: "sql.freedb.tech",
  user: "freedb_erim..microskool",
  password: "fpD46d*8Gen2G@Z",
  database: "freedb_microskool",
  connectionLimit: 10,
});

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



const multer  = require('multer');
const { publicEncrypt } = require('crypto');

const multerStorage = multer.diskStorage({
    destination:(req, file, cb)=>{
cb(null, 'assets')
    },
    filename:(req, file, cb)=>{
        let ext=file.mimetype.split('/')[1];
        const email =req.params.email;

        let name=`${email?.split('@')[0]}--${Math.random(0,300)}`;
        let saveName=name+"."+ext;
cb(null, `${name}.${ext}`)
pool.query("UPDATE users SET image='http://192.168.43.31:5000/assets/"+saveName+"' WHERE email='"+email+"'", (error, result, row)=>{
   
})
    }
})

const upload=multer({
    storage:multerStorage  
})

app.use('/assets', express.static('assets'))

app.use(express.static(path.join(__dirname, "assets")));



app.post('/profile/:email', upload.single('avatar'), function (req, res, next) {
    res.send({...responseObj, message:"Upload Successful", success:true })
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
            if(result.length>0){
                if(result[0]?.verified==='true'){
                    res.send({...responseObj, data:false, success:true, message:"Users Validity Retrieved Successfully"})
                  }else{
    
                    let code=Math.floor(Math.random()*1000000);
                    pool.query("UPDATE users SET verify_code="+code+" WHERE email='"+req.params.email+"'", (error, result, row)=>{
                        if(error){}
                    })
                    
                    mailer({recipients:req.params.email, subject:'Email Verification - Microskool', message:'Use this code to verify your Email: '+code})
                    res.send({...responseObj, success:true, message:"Check your mailbox for a verification code "+req.params.email, data:true})
                  } 
            }else{
                res.send({...responseObj, success:false, message:"No user found with "+req.params.email})
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
    if(first_name===""||surname===""||email===""||password===""||matric===""||phone==="" || first_name===undefined||surname===undefined||email===undefined||password===undefined||matric===undefined||phone===undefined){
        res.send({...responseObj, message:"All Fields are required"})
    }else{
        pool.query("SELECT * FROM users WHERE email='"+email+"' OR matric='"+matric+"'", (error, result, row)=>{
            if(error){
                res.send({...responseObj, message:"Error Validating Users"})
            }else{
            if(result.length>0){
                res.send({...responseObj, message:"Email or Matric Already Exist"})
            }   else{
                pool.query("INSERT INTO `users` (`id`, `first_name`, `surname`, `email`, `password`, `phone`, `matric`, `created_at`, `verified`, `verify_code`,  `campus`, `institution`,  `department`, `level`, `courses`, `image`, `coins`, `cgpa`) VALUES (NULL, '"+first_name+"', '"+surname+"', '"+email+"', '"+password+"', '"+phone+"', '"+matric+"', '"+new Date()+"', 'false', '', '',  '', '', '', '', '',0, 0)", (error, result, row)=>{
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
    let {first_name, surname,  matric, institution, campus, department, level, courses, coins}=req.body;
console.log(coins)
                pool.query("UPDATE `users` SET `first_name`='"+first_name+"',  `surname`='"+surname+"', `matric`='"+matric+"', `campus`='"+campus+"', `institution`='"+institution+"',  `department`='"+department+"', `level`='"+level+"', `courses`='"+courses+"', `coins`="+coins+" WHERE email='"+req.params.email+"'", (error, result, row)=>{
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
            if(result.length>0){
                res.send({ ...responseObj, data: result, success: true, message: "Users Retrieved Successfully" })

            }else{
                res.send({ ...responseObj, data: result, success: false, message: "Users Not Found" })

            }
        }

    })

})





app.get('/mycourses/:email', (req, res)=>{
    pool.query("SELECT * FROM mycourses WHERE user='"+req.params.email+"'", (error, result, row)=>{
        if(error){
            res.send({...responseObj, message:"Error Retrieving mycourses"})
        }else{
            res.send({...responseObj, data:result, success:true, message:"mycourses Retrieved Successfully"})
        }

    })

})

app.delete('/mycourses/:id', (req, res)=>{
    pool.query("DELETE FROM mycourses WHERE id='"+req.params.id+"'", (error, result, row)=>{
        if(error){
            res.send({...responseObj, message:"Error Deleting mycourses"})
        }else{
            res.send({...responseObj, data:result, success:true, message:"Deleted Successfully"})
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
if(code==='' || code===undefined || title===''|| title===undefined || level==='' ||level===undefined){
    res.send({...responseObj, success:false, message:"All Fields are required", data:[]})
             

}else{
pool.query("SELECT * FROM allcourse WHERE code='"+code+"'", (error, result, row)=>{
    if(error){
        res.send({...responseObj, success:false, message:"Error Validating Course", data:error})
    }else{
        if(result.length>0){
            res.send({...responseObj, success:false, message:"Course ["+code+"] Already Exist", data:error})
        }else{
            pool.query("INSERT INTO `allcourse` (`id`, `code`, `title`, `campus`, `department`, `level`, `user`) VALUES (NULL, '"+code+"', '"+title+"', '"+campus+"', '"+department+"', '"+level+"', '"+user+"');", (error, result, row)=>{
                if(error){
                    res.send({...responseObj, success:false, message:"Error Creating Course", data:error})
                }else{
                    res.send({...responseObj, success:true, message:"Course ["+code+"] Created Successfully"})
            
                }
            
            })
            
        }
    }
})
}
})





app.post('/mycourses', (req, res)=>{
    const {code, user} =req.body;
    pool.query("SELECT * FROM mycourses WHERE course='"+code+"' && user='"+user+"'", (error, result, row)=>{
        if(error){
            res.send({...responseObj, success:false, message:"Error Validating Course", data:error})
        }else{
            if(result.length>0){
                res.send({...responseObj, success:false, message:"Course ["+code+"] Already Exist for "+user, data:error})
            }else{
    
                pool.query("INSERT INTO `mycourses` (`id`, `course`,`user`) VALUES (NULL, '"+code+"', '"+user+"');", (error, result, row)=>{
                    if(error){
                        res.send({...responseObj, success:false, message:"Error Adding Course", data:error})
                    }else{
                        res.send({...responseObj, success:true, message:code+" Added Successfully"})
                
                    }
                })
            }
        }
    })
    })

    



app.post('/schedules', (req, res) => {
    const {  course, time_in, time_out, venue, day, user,  campus, department, level } = req.body;
    pool.query("SELECT * FROM schedule WHERE course='" + course + "' && day='" + day + "' && department='" + department + "' && campus='" + campus + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, success: false, message: "Error Validating Course", data: error })
        } else {
            if (result.length > 0) {
                res.send({ ...responseObj, success: false, message: "Course [" + course + "] Already Exist for " + department+' department on '+day, data: error })
            } else {

                pool.query("INSERT INTO `schedule` (`id`, `course`, `time_in`, `time_out`, `venue`, `day`, `user`, `wrong`, `correct`, `campus`, `department`, `level`) VALUES (NULL, '"+course+"', '"+time_in+"', '"+time_out+"', '"+venue+"', '"+day+"', '"+user+"', 0, 0, '"+campus+"', '"+department+"', '"+level+"');", (error, result, row) => {
                    if (error) {
                        res.send({ ...responseObj, success: false, message: "Error Adding Schedule", data: error })
                    } else {
                        res.send({ ...responseObj, success: true, message: "Schedule Added Successfully" })

                    }
                })
            }
        }
    })
})



app.post('/schedules/:id', (req, res) => {
    const { course, time_in, time_out, venue, day, user, campus, department } = req.body;
    pool.query("SELECT * FROM schedule WHERE course='" + course + "' && day='" + day + "' && department='" + department + "' && campus='" + campus + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, success: false, message: "Error Validating Course", data: error })
        } else {
            if (result.length > 0) {
                res.send({ ...responseObj, success: false, message: "Course [" + course + "] Already Exist for " + department + ' on ' + day, data: error })
            } else {

                pool.query("INSERT INTO `schedule` (`id`, `course`, `time_in`, `time_out`, `venue`, `day`, `user`, `wrong`, `correct`, `campus`, `department`) VALUES (NULL, '" + course + "', '" + time_in + "', '" + time_out + "', '" + venue + "', '" + day + "', '" + user + "', 0, 0, '" + campus + "', '" + department + "');", (error, result, row) => {
                    if (error) {
                        res.send({ ...responseObj, success: false, message: "Error Adding Schedule", data: error })
                    } else {
                        res.send({ ...responseObj, success: true, message: "Schedule Added Successfully" })

                    }
                })
            }
        }
    })
})





app.get('/assignments/:campus', (req, res)=>{

    pool.query("SELECT * FROM assignments WHERE campus='"+req.params.campus+"'", (error, result, row)=>{
        if(error){
            res.send({...responseObj, success:false, message:"Error Fetching Assignments", data:error})
          
        }else{
            res.send({...responseObj, success:true, message:"Assignments Fetched Successfully", data:result})

        }
    })

})





app.get('/schedules/:campus/:department/:level', (req, res)=>{

    pool.query(
      "SELECT * FROM schedule WHERE campus='" +
        req.params.campus +
        "' && department='" +
        req.params.department +
        "'  && level='" +
        req.params.level +
        "'",
      (error, result, row) => {
        if (error) {
          res.send({
            ...responseObj,
            success: false,
            message: "Error Fetching Schedules",
            data: error,
          });
        } else {
          res.send({
            ...responseObj,
            success: true,
            message: "Schedules Fetched Successfully",
            data: result,
          });
        }
      }
    );

})







app.post('/assignments', (req, res)=>{
    const  {} =req.body;
                pool.query("INSERT INTO `assignments` (`id`, `code`, `title`, `campus`, `department`, `level`, `user`) VALUES (NULL, '"+code+"', '"+title+"', '"+campus+"', '"+department+"', '"+level+"', '"+user+"');", (error, result, row)=>{
                    if(error){
                        res.send({...responseObj, success:false, message:"Error Creating Course", data:error})
                    }else{
                        res.send({...responseObj, success:true, message:"Courses Created Successfully"})
                
                    }
    })
    })

    
    app.post('/transactions', (req, res)=>{
        const  {transaction_id, item, description_sender, description_receiver, sender, receiver, amount, status} =req.body;

        if(amount>0){

        
                    pool.query("INSERT INTO `transactions` (`id`, `transaction_id`, `item`, `description_sender`, `description_receiver`, `sender`, `receiver`, `amount`, `date`, `status`) VALUES (NULL, '"+transaction_id+"', '"+item+"', '"+description_sender+"', '"+description_receiver+"', '"+sender+"', '"+receiver+"', "+amount+", '"+new Date()+"', '"+status+"');", (error, result, row)=>{
                        if(error){
                            res.send({...responseObj, success:false, message:"Error Posting Transaction", data:error})
                        }else{
                            res.send({...responseObj, success:true, message:"Transaction Posted Successfully"})
                    
                        }
        })
    }else{
            res.send({ ...responseObj, success: false, message: "Amount most be greater than 0.00", data: [] }) 
    }
        })
    


        app.get('/transactions/:user', (req, res)=>{
           

            pool.query("SELECT * FROM transactions WHERE sender='"+req.params.user+"' OR receiver='"+req.params.user+"'", (error, result, row)=>{
                if(error){
                    res.send({...responseObj, success:false, message:"Error Fetching Transactions", data:error})
                  
                }else{
                    res.send({...responseObj, success:true, message:"Transactions Fetched Successfully", data:result})
        
                }
            })
        
        })


app.post('/transactions/validate', (req, res) => {
    const { sender, amount, password } = req.body;
    pool.query("SELECT * FROM users WHERE email='" + sender + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, message: "Error Retrieving Users" })
        } else {
            if (result.length > 0) {
if(amount>parseFloat(result[0].coins)){
    res.send({ ...responseObj, data: result, success: false, message: "Amount greater than your current balance" })

}else{

if(password===result[0].password){
    res.send({ ...responseObj, data: result, success: true, message: "Transaction is Possible" })

}else{
    res.send({ ...responseObj, data: result, success: false, message: "Incorrect Password" })

}

}


             
            } else {
                res.send({ ...responseObj, data: result, success: false, message: "Users Not Found" })

            }
        }

    })

})
        


app.post("/votes", (req, res) => {
  const { subject, subject_id, type, user, campus, department, level } =
    req.body;
  pool.query(
    "SELECT * FROM votes WHERE user='" +
      user +
      "' && subject_id='" +
      subject_id +
      "' && subject='" +
      subject +
      "'",
    (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, message: "Error Retrieving Votes" });
      } else {
        if (result.length > 0) {
          res.send({
            ...responseObj,
            data: result,
            success: false,
            message: "You already voted this "+subject,
          });
        } else {
          
            pool.query(
              "INSERT INTO `votes` (`id`, `subject`, `type`, `user`, `subject_id`, `campus`, `department`, `level`) VALUES (NULL, '"+subject+"', '"+type+"', '"+user+"', "+subject_id+", '"+campus+"', '"+department+"', '"+level+"');",
              (error, result, row) => {
                if(error){
                    res.send({
                      ...responseObj,
                      data: result,
                      success: false,
                      message: "Error Posting Vote ",
                    });
                }else{

                    


                    pool.query("SELECT * FROM schedule WHERE id='"+subject_id+"'", (error, resul, row) => {
                        let newWrong=resul[0].wrong+1;
                          let newcorrect = resul[0].correct + 1;
                        pool.query(
                          type === "correct"
                            ? "UPDATE schedule SET correct=" +
                                newcorrect +
                                "  WHERE id='" +
                                subject_id +
                                "'"
                            : "UPDATE schedule SET wrong=" +
                                newWrong +
                                "  WHERE id='" +
                                subject_id +
                                "'",
                          (error, res, row) => {
if(newWrong-newcorrect>2){
pool.query(
  "DELETE FROM schedule WHERE `schedule`.`id` = "+subject_id,
  (error, result, row) => {
    if (error) {
    }
    pool.query(
      "DELETE FROM votes WHERE subject_id='" + subject_id + "'",
      (error, result, row) => {
        if (error) {
        }
      }
    );
  }
);
}

                          }
                        );
                    });
                    res.send({
                      ...responseObj,
                      data: result,
                      success: true,
                      message: "Voted Successfully ",
                    });
                }
              }
            );
        }
      }
    }
  );
});
     



        app.get('/transactions', (req, res)=>{

            pool.query("SELECT * FROM transactions", (error, result, row)=>{
                if(error){
                    res.send({...responseObj, success:false, message:"Error Fetching Transactions", data:error})
                  
                }else{
                    res.send({...responseObj, success:true, message:"Transactions Fetched Successfully", data:result})
        
                }
            })
        
        })

           app.get("/votes", (req, res) => {
             pool.query("SELECT * FROM votes", (error, result, row) => {
               if (error) {
                 res.send({
                   ...responseObj,
                   success: false,
                   message: "Error Fetching Votes",
                   data: error,
                 });
               } else {
                 res.send({
                   ...responseObj,
                   success: true,
                   message: "Votes Fetched Successfully",
                   data: result,
                 });
               }
             });
           });


                app.get("/votes/user/:user", (req, res) => {
                  pool.query("SELECT subject_id, type FROM votes WHERE user='"+req.params.user+"'", (error, result, row) => {
                    if (error) {
                      res.send({
                        ...responseObj,
                        success: false,
                        message: "Error Fetching Votes",
                        data: error,
                      });
                    } else {
                      res.send({
                        ...responseObj,
                        success: true,
                        message: "Votes Fetched Successfully",
                        data: result,
                      });
                    }
                  });
                });

                      app.get("/votes/:campus/:department/:level/:subject", (req, res) => {
                        pool.query(
                          "SELECT * FROM votes WHERE subject='" +
                            req.params.subject +
                            "' && campus='" +
                            req.params.campus +
                            "' && department='" +
                            req.params.department +
                            "'&& level='" +
                            req.params.level +
                            "'",
                          (error, result, row) => {
                            if (error) {
                              res.send({
                                ...responseObj,
                                success: false,
                                message: "Error Fetching Votes",
                                data: error,
                              });
                            } else {
                              res.send({
                                ...responseObj,
                                success: true,
                                message: "Votes Fetched Successfully",
                                data: result,
                              });
                            }
                          }
                        );
                      });



                       app.get(
                         "/votes/:campus/:department/:level/:subject/:type",
                         (req, res) => {
                           pool.query(
                             "SELECT * FROM votes WHERE type='"+req.params.type+"' && subject='" +
                               req.params.subject +
                               "' && campus='" +
                               req.params.campus +
                               "' && department='" +
                               req.params.department +
                               "'&& level='" +
                               req.params.level +
                               "'",
                             (error, result, row) => {
                               if (error) {
                                 res.send({
                                   ...responseObj,
                                   success: false,
                                   message: "Error Fetching Votes",
                                   data: error,
                                 });
                               } else {
                                 res.send({
                                   ...responseObj,
                                   success: true,
                                   message: "Votes Fetched Successfully",
                                   data: result,
                                 });
                               }
                             }
                           );
                         }
                       );

                     




app.post("/writefile", (req, res)=>{
const {filename, data}=req.body;
 fs.writeFileSync("filename.js", {...misbFormat, content:data});
 console.log("data inteed")
res.send("written"); 

})

app.get("/writefile/:filename", (req, res) => {
  
 fs.readFile(req.params.filename, (error, data)=>{
  
       res.send(JSON.parse(data));
   })

 
});



 




//Editor


app.get("/allPost",  (req, res) => {

     pool.query("SELECT * FROM files ", (error, result, row)=>{
                if(error){
                    res.send({
                      ...responseObj,
                      success: false,
                      message: "Error Fetching files",
                      data: error,
                    });
                  
                }else{
                    res.send({
                      ...responseObj,
                      success: true,
                      message: "files Fetched Successfully",
                      data: result,
                    });
        
                }
                
            })

            })





app.post("/addArticle", (req, res) => {
  let { title,content, id, author, editor, fileName } = req.body;

    pool.query(
      "INSERT INTO `files` (`id`, `author`, `editor`, `fileName`, `dateCreated`, `dateLastEdited`, `content`, `title`) VALUES ('" +
        id +
        "', '" +
        author +
        "', '" +
        editor +
        "', '" +
        fileName +
        "', '" +
        new Date() +
        "', '" +
        new Date() +
        "', '"+content+"', '"+title+"');",
      (error, result, row) => {
        if (error) {
      
          res.send({ ...responseObj, message: "Error Posting" });
        } else {
             fs.writeFileSync(fileName, JSON.stringify({
               title,
             
               id,
               author,
               editor,
               fileName,
               content
             }));
             console.log("data inteed");
        
          res.send({ ...responseObj, message: "Posted", success: true });
        }
      }
    );
  
});







app.post("/getPostId", (req, res) => {

     pool.query("SELECT * FROM files where id = '"+req.body.ids+"' ", (error, result, row) => {
       if (error) {
         res.send({
           ...responseObj,
           success: false,
           message: "Error Fetching files",
           data: error,
         });
       } else {
         res.send({
           ...responseObj,
           success: true,
           message: "files Fetched Successfully",
           data: result,
         });
       }
     });

});


app.post("/editArticle",  (req, res) => {
   let { title, content, ids } = req.body;
pool.query(
  "UPDATE `files` SET `title`='" +
    title +
    "', `content`='" +
    content +
    "' WHERE id = '" +
    ids +
    "' ",
  (error, result, row) => {
    if (error) {
      res.send({
        ...responseObj,
        success: false,
        message: "Error Fetching files",
        data: error,
      });
      console.log(error)
    } else {
      res.send({
        ...responseObj,
        success: true,
        message: "files Fetched Successfully",
        data: result,
      });
    }
  }
);



 
});







app.listen(5000, ()=>console.log("Listening on 5000"));