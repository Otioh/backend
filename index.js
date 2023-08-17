const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const misbFormat = require("./TS/misb");
const sendEmail = require('./mailer');

const { generateArticleContent } = require('./ai');

async function generateArticle(req, res) {
  const prompt = req.body.prompt; // Get the prompt from the request body or any other source

  try {
    const articleContent = await generateArticleContent(prompt);
    res.json({ article: articleContent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate article content' });
  }
}




const app = express();
app.use(cors())
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);





const pool = mysql.createPool({
  host: "sql.freedb.tech",
  user: "freedb_erim.microskool",
  password: "G%cV?zfxa%5SwTv",
  database: "freedb_microskool",
  connectionLimit: 10,
});

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "microskool",
//   connectionLimit: 10,
// });


const responseObj = {
  message: "",
  success: false,
  data: []
}



const multer = require('multer');
const { publicEncrypt } = require('crypto');


const multerStorageDoc = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, 'Documents')
  },
  filename: (req, file, cb) => {

    cb(null, file.originalname);
    fs.mkdir('Documents/User' + req.params.id, { recursive: true }, (err) => {

    })

    setTimeout(() => {
      fs.copyFileSync('./Documents/' + file.originalname, 'Documents/User' + req.params.id + "/" + file.originalname)
      fs.unlink('./Documents/' + file.originalname, (err) => {

      })
    }, 3000);



  }
})


const multerStorageCampus = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, 'assets')
  },
  filename: (req, file, cb) => {

    cb(null, req.body.acro + ".png");




  }
})






const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'assets')
  },
  filename: (req, file, cb) => {
    let ext = file.mimetype.split('/')[1];
    const email = req.params.email;

    let name = `${email?.split('@')[0]}--${Math.random(0, 300)}`;
    let saveName = name + "." + ext;
    cb(null, `${name}.${ext}`)
    pool.query("UPDATE users SET image='https://elegant-jacket-lamb.cyclic.app/assets/" + saveName + "' WHERE email='" + email + "'", (error, result, row) => {

    })
  }
})


const multerStorageLecture = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'assets/videos')
  },
  filename: (req, file, cb) => {
    let ext = file.mimetype.split('/')[1];
    const { user, course, topic, lecturer, campus } = req.params;
    console.log(req.params)
    let name = `${user?.split('@')[0]}--${Math.random(0, 300)}`;
    let saveName = name + "." + ext;
    cb(null, `${name}.${ext}`)

    pool.query("INSERT INTO `lectures` (`id`, `course`, `topic`, `lecturer`, `date`, `video`, `user`, `campus`, `wrong`, `correct`, `lid`) VALUES (NULL, '" + course + "', '" + topic + "', '" + lecturer + "', '" + new Date() + "', './assets/videos/" + saveName + "', '" + user + "', '" + campus + "', '0', '0', '" + campus + Date.now() + course + Date.now() + "');", (error, result, row) => {

    })
  }
})




const multerTempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp')
  },
  filename: (req, file, cb) => {

    cb(null, req.params.filename);

  }
})
const uploadDoc = multer({
  storage: multerStorageDoc
})

const uploadCamp = multer({
  storage: multerStorageCampus
})

const upload = multer({
  storage: multerStorage
})



const uploadLecture = multer({
  storage: multerStorageLecture
})




const getTempFile = multer({
  storage: multerTempStorage
})

app.use('/assets', express.static('assets'))

app.use(express.static(path.join(__dirname, "assets")));



app.post('/profile/:email', upload.single('avatar'), function (req, res, next) {
  res.send({ ...responseObj, message: "Upload Successful", success: true })
})

app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
})


app.post('/file/:filename', getTempFile.array('file', 12), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any

  if (req.params.filename.split('.')[1] === "misb") {
    setTimeout(() => {


      fs.readFile('temp/' + req.params.filename, (err, data) => {

        if (JSON.parse(data).content) {
          res.send({ ...responseObj, data: JSON.parse(data), success: true, message: "Document Valid" })

        } else {
          res.send({ ...responseObj, data: data, success: false, message: "Corrupt File" })

        }


      })
      fs.unlink('temp/' + req.params.filename, (err) => {

      })




    }, 3000);

  } else {
    res.send({ ...responseObj, success: false, message: "Wrong File Type" })

  }

})










app.post('/lecture', uploadLecture.single('lecture'), function (req, res, next) {



  res.send({ ...responseObj, message: "Lecture Stream Initiated", success: true })
})

app.post('/lecture/:campus/:user/:course/:lecturer/:topic', uploadLecture.single('lecture'), function (req, res, next) {



  res.send({ ...responseObj, message: "Lecture Stream Initiated ", success: true })
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





app.get('/lectures/:campus', (req, res) => {
  pool.query("SELECT * FROM lectures WHERE campus='" + req.params.campus + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Lectures" })
    } else {
      res.send({ ...responseObj, data: result, success: true, message: "Lectures Retrieved Successfully" })
    }

  })


})

app.get('/lectures/watch/:id', (req, res) => {

  pool.query("SELECT * FROM lectures WHERE lid='" + req.params.id + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Lecture" })
    } else {
      if (result.length > 0) {

        const videoPath = result[0].video;

        const videoStat = fs.statSync(videoPath);

        const fileSize = videoStat.size;

        const videoRange = req.headers.range;

        if (videoRange) {

          const parts = videoRange.replace(/bytes=/, "").split("-");

          const start = parseInt(parts[0], 10);

          const end = parts[1]

            ? parseInt(parts[1], 10)

            : fileSize - 1;

          const chunksize = (end - start) + 1;

          const file = fs.createReadStream(videoPath, { start, end });

          const header = {

            'Content-Range': `bytes ${start}-${end}/${fileSize}`,

            'Accept-Ranges': 'bytes',

            'Content-Length': chunksize,

            'Content-Type': 'video/mp4',

          };

          res.writeHead(206, header);

          file.pipe(res);

        } else {

          const head = {

            'Content-Length': fileSize,

            'Content-Type': 'video/mp4',

          };

          res.writeHead(200, head);

          fs.createReadStream(videoPath).pipe(res);

        }












      } else {
        res.send({ ...responseObj, message: "No Lecture with the provided ID" })
      }
    }

  })


})









app.get('/', (req, res) => {

  res.send({ ...responseObj, message: "Welcome", success: true })
});


app.post('/', (req, res) => {
  res.send({ ...responseObj, message: "Login Successful", success: true })
})


app.get('/users', (req, res) => {
  pool.query("SELECT * FROM users", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Users" })
    } else {
      res.send({ ...responseObj, data: result, success: true, message: "Users Retrieved Successfully" })
    }

  })

})



app.get('/auth/:email', (req, res) => {
  pool.query("SELECT verified FROM users WHERE email='" + req.params.email + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Users" })
    } else {
      if (result.length > 0) {
        if (result[0]?.verified === 'true') {
          res.send({ ...responseObj, data: false, success: true, message: "Users Validity Retrieved Successfully" })
        } else {

          let code = Math.floor(Math.random() * 1000000);
          pool.query("UPDATE users SET verify_code=" + code + " WHERE email='" + req.params.email + "'", (error, result, row) => {
            if (error) { }
          })
          console.log(code)
          // mailer({ recipients: req.params.email, subject: 'Email Verification - Microskool', message: 'Use this code to verify your Email: ' + code })
          res.send({ ...responseObj, success: true, message: "Check your mailbox for a verification code " + req.params.email, data: true })
        }
      } else {
        res.send({ ...responseObj, success: false, message: "No user found with " + req.params.email })
      }

    }
  })
})





app.post('/auth/:email', (req, res) => {
  let { code } = req.body;
  pool.query("SELECT * FROM users WHERE email='" + req.params.email + "' && verify_code='" + code + "' ", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Users" })
    } else {
      if (result.length > 0) {
        pool.query("UPDATE users SET verified='true' WHERE email='" + req.params.email + "' && verify_code='" + code + "' ", (error, result, row) => {
          if (error) {
            res.send({ ...responseObj, data: result, message: "Error Verifying Email, try again" })

          } else {
            res.send({ ...responseObj, data: result, success: true, message: "Email verified Successfully" })

          }
        })
      } else {
        res.send({ ...responseObj, success: false, message: "Wrong Verification Code" })
      }
    }
  })
})




app.post('/auth', (req, res) => {
  let { email, password } = req.body;
  if (email === "" || password === "") {
    res.send({ ...responseObj, message: 'Both Email & Password are required' })
  } else {

    pool.query("SELECT * FROM users WHERE email='" + email + "' && password='" + password + "'", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, message: "Error Validating Users" })
      } else {
        if (result.length > 0) {
          res.send({ ...responseObj, data: result, success: true, message: "Logged in Successfully" })

        } else {
          res.send({ ...responseObj, message: "Wrong Password" })
        }
      }
    })
  }
})



app.post('/users', (req, res) => {
  let { first_name, surname, email, password, matric, phone } = req.body;
  if (first_name === "" || surname === "" || email === "" || password === "" || matric === "" || phone === "" || first_name === undefined || surname === undefined || email === undefined || password === undefined || matric === undefined || phone === undefined) {
    res.send({ ...responseObj, message: "All Fields are required" })
  } else {
    pool.query("SELECT * FROM users WHERE email='" + email + "' OR matric='" + matric + "'", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, message: "Error Validating Users" })
      } else {
        if (result.length > 0) {
          res.send({ ...responseObj, message: "Email or Matric Already Exist" })
        } else {
          pool.query("INSERT INTO `users` (`id`, `first_name`, `surname`, `email`, `password`, `phone`, `matric`, `created_at`, `verified`, `verify_code`,  `campus`, `institution`,  `department`, `level`, `courses`, `image`, `coins`, `cgpa`, `privileges`) VALUES (NULL, '" + first_name + "', '" + surname + "', '" + email + "', '" + password + "', '" + phone + "', '" + matric + "', '" + new Date() + "', 'false', '', '',  '', '', '', '', '',0, 0,0)", (error, result, row) => {
            if (error) {
              res.send({ ...responseObj, message: "Error Occurred" + error })
            } else {
              res.send({ ...responseObj, success: true, message: "Signup Successfully" })
            }
          })
        }
      }
    })
  }
})






app.post('/users/:email', (req, res) => {
  let { first_name, surname, matric, institution, campus, department, level, courses, coins, password, privileges } = req.body;
  console.log(coins)
  pool.query("UPDATE `users` SET `first_name`='" + first_name + "',  `surname`='" + surname + "', `matric`='" + matric + "', `campus`='" + campus + "', `institution`='" + institution + "',  `department`='" + department + "', `level`='" + level + "', `courses`='" + courses + "', `coins`=" + coins + ", `privileges`=" + privileges + ", `password`='" + password + "' WHERE email='" + req.params.email + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Occurred" + error })
    } else {
      res.send({ ...responseObj, success: true, message: "Profile Updated Successfully" })
    }
  })




})





app.get('/users/:email', (req, res) => {
  pool.query("SELECT * FROM users WHERE email='" + req.params.email + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Users" })
    } else {
      if (result.length > 0) {
        res.send({ ...responseObj, data: result, success: true, message: "Users Retrieved Successfully" })

      } else {
        res.send({ ...responseObj, data: result, success: false, message: "Users Not Found" })

      }
    }

  })

})





app.get('/mycourses/:email', (req, res) => {
  pool.query("SELECT * FROM mycourses WHERE user='" + req.params.email + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving mycourses" })
    } else {
      res.send({ ...responseObj, data: result, success: true, message: "mycourses Retrieved Successfully" })
    }

  })

})

app.delete('/mycourses/:id', (req, res) => {
  pool.query("DELETE FROM mycourses WHERE id='" + req.params.id + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Deleting mycourses" })
    } else {
      res.send({ ...responseObj, data: result, success: true, message: "Deleted Successfully" })
    }

  })

})






app.get('/courses/:campus', (req, res) => {

  pool.query("SELECT * FROM allcourse WHERE campus='" + req.params.campus + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Courses", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Courses Fetched Successfully", data: result })

    }
  })

})




app.get('/campuses', (req, res) => {

  pool.query("SELECT * FROM campuses", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Campuses", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Campuses Fetched Successfully", data: result })

    }
  })

})




app.get('/departments', (req, res) => {

  pool.query("SELECT * FROM departments", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Departments", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Departments Fetched Successfully", data: result })

    }
  })

})


app.post('/departments', (req, res) => {
  const { name } = req.body;
  console.log(name)
  if (name?.toLowerCase()?.includes('department')) {
    res.send({ ...responseObj, success: false, message: "keyword Department cannot be included" })
  } else {


    pool.query("SELECT * FROM departments WHERE name='" + name + "'", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, success: false, message: "Error Fetching Departments", data: error })

      } else {
        if (result.length > 0) {
          res.send({ ...responseObj, success: false, message: "Department Already Exist", data: error })

        } else {
          pool.query("INSERT INTO departments (`id`,`name`, `user`)VALUES(NULL, '" + name + "', 'Admin')", (error, result, row) => {
            if (error) {
              res.send({ ...responseObj, success: false, message: "Error Creating Department " + error, data: error })

            } else {
              res.send({ ...responseObj, success: true, message: "Department Created Successfully", })
            }
          })

        }


      }
    })

  }

})


app.post('/departments/:id', (req, res) => {
  const { name } = req.body;

  pool.query("UPDATE departments SET name='" + name + "' WHERE id=" + req.params.id + "", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Updating Department", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Department Updated Successfully", })
    }
  })

})


app.delete('/departments/:id', (req, res) => {


  pool.query("DELETE FROM departments WHERE id=" + req.params.id + "", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Deleting Department " + error, data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Department Deleted Successfully", })
    }
  })

})






app.post('/campuses', uploadCamp.single('logo'), (req, res) => {
  const { name, acro } = req.body;

  if (name === "" || acro === "") {
    res.send({ ...responseObj, success: false, message: "All Fields are Required" })
  } else {


    pool.query("SELECT * FROM campuses WHERE name='" + name + "'", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, success: false, message: "Error Fetching campuses", data: error })

      } else {
        if (result.length > 0) {
          res.send({ ...responseObj, success: false, message: "Campus Already Exist", data: error })

        } else {
          pool.query("INSERT INTO campuses (`id`,`name`, `user`, `logo`, `acro`)VALUES(NULL, '" + name + "', 'Admin', 'https://elegant-jacket-lamb.cyclic.app/assets/" + req.body.acro + ".png" + "', '" + acro + "')", (error, result, row) => {
            if (error) {
              res.send({ ...responseObj, success: false, message: "Error Creating Campus " + error, data: error })

            } else {
              res.send({ ...responseObj, success: true, message: "Campus Created Successfully", })
            }
          })

        }


      }
    })

  }

})


app.post('/campuses/:id', uploadCamp.single('logo'), (req, res) => {
  const { name, acro, logo } = req.body;

  if (logo === undefined || logo === null || logo === "null") {
    res.send({ ...responseObj, success: false, message: "Logo is required" })
  } else {

    pool.query("UPDATE campuses SET name='" + name + "', logo='https://elegant-jacket-lamb.cyclic.app/assets/" + req.body.acro + ".png" + "', acro='" + acro + "' WHERE id=" + req.params.id + "", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, success: false, message: "Error Updating Department", data: error })

      } else {
        res.send({ ...responseObj, success: true, message: "Department Updated Successfully", })
      }
    })

  }
})


app.delete('/campuses/:id', (req, res) => {


  pool.query("DELETE FROM campuses WHERE id=" + req.params.id + "", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Deleting Department " + error, data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Department Deleted Successfully", })
    }
  })

})









app.post('/courses', (req, res) => {
  const { code, title, campus, department, level, user } = req.body;
  if (code === '' || code === undefined || title === '' || title === undefined || level === '' || level === undefined) {
    res.send({ ...responseObj, success: false, message: "All Fields are required", data: [] })


  } else {
    pool.query("SELECT * FROM allcourse WHERE code='" + code + "'", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, success: false, message: "Error Validating Course", data: error })
      } else {
        if (result.length > 0) {
          res.send({ ...responseObj, success: false, message: "Course [" + code + "] Already Exist", data: error })
        } else {
          pool.query("INSERT INTO `allcourse` (`id`, `code`, `title`, `campus`, `department`, `level`, `user`) VALUES (NULL, '" + code + "', '" + title + "', '" + campus + "', '" + department + "', '" + level + "', '" + user + "');", (error, result, row) => {
            if (error) {
              res.send({ ...responseObj, success: false, message: "Error Creating Course", data: error })
            } else {
              res.send({ ...responseObj, success: true, message: "Course [" + code + "] Created Successfully" })

            }

          })

        }
      }
    })
  }
})





app.post('/mycourses', (req, res) => {
  const { code, user } = req.body;
  pool.query("SELECT * FROM mycourses WHERE course='" + code + "' && user='" + user + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Validating Course", data: error })
    } else {
      if (result.length > 0) {
        res.send({ ...responseObj, success: false, message: "Course [" + code + "] Already Exist for " + user, data: error })
      } else {

        pool.query("INSERT INTO `mycourses` (`id`, `course`,`user`) VALUES (NULL, '" + code + "', '" + user + "');", (error, result, row) => {
          if (error) {
            res.send({ ...responseObj, success: false, message: "Error Adding Course", data: error })
          } else {
            res.send({ ...responseObj, success: true, message: code + " Added Successfully" })

          }
        })
      }
    }
  })
})





app.post('/schedules', (req, res) => {
  const { course, time_in, time_out, venue, day, user, campus, department, level } = req.body;
  pool.query("SELECT * FROM schedule WHERE course='" + course + "' && day='" + day + "' && department='" + department + "' && campus='" + campus + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Validating Course", data: error })
    } else {
      if (result.length > 0) {
        res.send({ ...responseObj, success: false, message: "Course [" + course + "] Already Exist for " + department + ' department on ' + day, data: error })
      } else {

        pool.query("INSERT INTO `schedule` (`id`, `course`, `time_in`, `time_out`, `venue`, `day`, `user`, `wrong`, `correct`, `campus`, `department`, `level`) VALUES (NULL, '" + course + "', '" + time_in + "', '" + time_out + "', '" + venue + "', '" + day + "', '" + user + "', 0, 0, '" + campus + "', '" + department + "', '" + level + "');", (error, result, row) => {
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





app.get('/assignments', (req, res) => {

  pool.query("SELECT * FROM assignments ", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Assignments", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Assignments Fetched Successfully", data: result })

    }
  })

})








app.delete('/assignments/:id', (req, res) => {

  pool.query("DELETE  FROM assignments WHERE id='" + req.params.id + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Deleting Assignments", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Assignments Deleted Successfully", data: result })

    }
  })

})





app.get('/schedules/:campus/:department/:level', (req, res) => {

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





app.post('/postFile/:id', uploadDoc.single('file'), (req, res) => {

})

app.post('/assignments', (req, res) => {



  const { course, question, title, campus, filestat, user, filename } = req.body;
  pool.query("INSERT INTO `assignments` (`id`, `course`, `question`,`date`, `title`, `file`, `campus`, `downloads`, `warnings`,  `filestat`, `user`) VALUES (NULL, '" + course + "', '" + question + "', '" + new Date() + "',  '" + title + "', '" + filename + "', '" + campus + "', 0, 0,  '" + filestat + "', '" + user + "');", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Posting Assignment", data: error })
    } else {
      res.send({ ...responseObj, success: true, message: "Assignment Posted Successfully" })

    }
  })

})


app.post('/transactions', (req, res) => {
  const { transaction_id, item, description_sender, description_receiver, sender, receiver, amount, status } = req.body;

  if (amount > 0) {


    if (item === "Wallet Funded") {
      const percent = (amount * 2) / 100;
      pool.query("INSERT INTO `revenues` (`id`, `description`,`user`, `amount`, `date`) VALUES (NULL,  'Revenue from " + sender + " Wallet Funding', '" + sender + "',  " + percent + ", '" + new Date() + "');", (error, result, row) => {
        if (error) {

        } else {


        }
      })
    }

    pool.query("INSERT INTO `transactions` (`id`, `transaction_id`, `item`, `description_sender`, `description_receiver`, `sender`, `receiver`, `amount`, `date`, `status`) VALUES (NULL, '" + transaction_id + "', '" + item + "', '" + description_sender + "', '" + description_receiver + "', '" + sender + "', '" + receiver + "', " + amount + ", '" + new Date() + "', '" + status + "');", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, success: false, message: "Error Posting Transaction", data: error })
      } else {
        res.send({ ...responseObj, success: true, message: "Transaction Posted Successfully" })

      }
    })
  } else {
    res.send({ ...responseObj, success: false, message: "Amount most be greater than 0.00", data: [] })
  }
})



app.get('/transactions/:user', (req, res) => {


  pool.query("SELECT * FROM transactions WHERE sender='" + req.params.user + "' OR receiver='" + req.params.user + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Transactions", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Transactions Fetched Successfully", data: result })

    }
  })

})


app.get('/revenues', (req, res) => {

  pool.query("SELECT * FROM revenues ", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Revenues", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Revenues Fetched Successfully", data: result })

    }
  })

})

app.post('/revenues', (req, res) => {
  const { description, user, amount } = req.body;

  if (amount > 0) {


    pool.query("INSERT INTO `revenues` (`id`, `description`,`user`, `amount`, `date`) VALUES (NULL,  '" + description + "', '" + user + "',  " + amount + ", '" + new Date() + "');", (error, result, row) => {
      if (error) {
        res.send({ ...responseObj, success: false, message: "Error Posting Revenue", data: error })
      } else {
        res.send({ ...responseObj, success: true, message: "Revenue Posted Successfully" })

      }
    })
  } else {
    res.send({ ...responseObj, success: false, message: "Amount most be greater than 0.00", data: [] })
  }
})




app.post('/transactions/validate', (req, res) => {
  const { sender, amount, password } = req.body;
  pool.query("SELECT * FROM users WHERE email='" + sender + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Users" })
    } else {
      if (result.length > 0) {
        if (amount > parseFloat(result[0].coins)) {
          res.send({ ...responseObj, data: result, success: false, message: "Amount greater than your current balance" })

        } else {

          if (password === result[0].password) {
            res.send({ ...responseObj, data: result, success: true, message: "Transaction is Possible" })

          } else {
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
            message: "You already voted this " + subject,
          });
        } else {

          pool.query(
            "INSERT INTO `votes` (`id`, `subject`, `type`, `user`, `subject_id`, `campus`, `department`, `level`) VALUES (NULL, '" + subject + "', '" + type + "', '" + user + "', " + subject_id + ", '" + campus + "', '" + department + "', '" + level + "');",
            (error, result, row) => {
              if (error) {
                res.send({
                  ...responseObj,
                  data: result,
                  success: false,
                  message: "Error Posting Vote ",
                });
              } else {




                pool.query("SELECT * FROM schedule WHERE id='" + subject_id + "'", (error, resul, row) => {
                  let newWrong = resul[0].wrong + 1;
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
                      if (newWrong - newcorrect > 2) {
                        pool.query(
                          "DELETE FROM schedule WHERE `schedule`.`id` = " + subject_id,
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



app.post('/paybook', (req, res) => {
  const { sender, receiver, amount } = req.body;

  let RECEIVER;
  let SENDER;
  const percent = (amount * 70) / 100;
  pool.query("SELECT * FROM users WHERE email='" + sender + "'", (error, result, row) => {

    SENDER = result[0];
  })

  pool.query("SELECT * FROM users WHERE email='" + receiver + "'", (error, result, row) => {
    RECEIVER = result[0];

    const senderBalance = SENDER?.coins - amount;

    const receiverBalance = percent + RECEIVER?.coins;


    pool.query("UPDATE users SET coins=" + receiverBalance + " WHERE email='" + receiver + "'", (error, result, row) => {

    })


    pool.query("UPDATE users SET coins=" + senderBalance + " WHERE email='" + sender + "'", (error, result, row) => {

    })


  })





  pool.query("INSERT INTO `transactions` (`id`, `transaction_id`, `item`, `description_sender`, `description_receiver`, `sender`, `receiver`, `amount`, `date`, `status`) VALUES (NULL, '" + "T255" + Math.random() * 2344354 + "', 'Material', 'Payment you made for a Microskool Document(MiSB)', 'Charge for (MiSB) Document', '" + sender + "', 'Microskool', " + amount + ", '" + new Date() + "', 'Approved');", (error, result, row) => {

  })


  pool.query("INSERT INTO `transactions` (`id`, `transaction_id`, `item`, `description_sender`, `description_receiver`, `sender`, `receiver`, `amount`, `date`, `status`) VALUES (NULL, '" + "T255" + Math.random() * 2344354 + "', 'Material', 'Remittance for a Microskool Document(MiSB)', 'Remittance for a Microskool Document(MiSB)', 'Microskool', '" + receiver + "', " + percent + ", '" + new Date() + "', 'Approved');", (error, result, row) => {
    if (!error) {
      res.send({ ...responseObj, success: true, message: "Purchase Completed" })
    }
  })


  pool.query("INSERT INTO `revenues` (`id`, `description`,`user`, `amount`, `date`) VALUES (NULL,  'Revenue from MiSB % charge from " + sender + " in favour of " + receiver + "', '" + sender + "',  " + amount - percent + ", '" + new Date() + "');", (error, result, row) => {
    if (error) {

    } else {


    }
  })




})





app.get('/transactions', (req, res) => {

  pool.query("SELECT * FROM transactions", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Transactions", data: error })

    } else {
      res.send({ ...responseObj, success: true, message: "Transactions Fetched Successfully", data: result })

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
  pool.query("SELECT subject_id, type FROM votes WHERE user='" + req.params.user + "'", (error, result, row) => {
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
      "SELECT * FROM votes WHERE type='" + req.params.type + "' && subject='" +
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






app.post("/writefile", (req, res) => {
  const { filename, data } = req.body;
  fs.writeFileSync("filename.js", { ...misbFormat, content: data });
  console.log("data inteed")
  res.send("written");

})

app.get("/writefile/:filename", (req, res) => {

  let file = fs.readFileSync(req.params.filename)

  res.download(req.params.filename);



});








//Editor


app.get("/allPost/:email", (req, res) => {

  pool.query(
    "SELECT * FROM files WHERE editor='" +
    req.params.email +
    "'",
    (error, result, row) => {
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
    }
  );

})





app.post("/addArticle", (req, res) => {
  let { title, content, id, author, editor, editorname, fileName } = req.body;

  pool.query(
    "INSERT INTO `files` (`id`, `author`, `editor`, `fileName`, `dateCreated`, `dateLastEdited`, `content`, `title`, `editorname`) VALUES ('" +
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
    "', '" + content + "', '" + title + "', '" + editorname + "');",
    (error, result, row) => {
      if (error) {

        res.send({ ...responseObj, message: "Error Posting" });
      } else {


        res.send({ ...responseObj, message: "New File Created", success: true });
      }
    }
  );

});

app.get('/corscheck', (req, res) => {

  fetch('https://app.googptai.com/storage/pexels/eating-healthy.mp4').then((res) => res.blob()).then((blob => console.log(blob)))
  res.send("Done")
})





app.post("/getPostId", (req, res) => {

  pool.query("SELECT * FROM files where id = '" + req.body.ids + "' ", (error, result, row) => {
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


app.get("/deletePost/:id", (req, res) => {

  pool.query(
    "DELETE FROM files where id = '" + req.params.id + "' ",
    (error, result, row) => {
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
          message: "files Deleted Successfully",
          data: result,
        });
      }
    }
  );
})



app.get('/downloadFile/:dir', (req, res) => {
  const fileArr = req.params.dir.split("*")
  let file = "User" + fileArr[0] + "/" + fileArr[1]
  res.download('./Documents/' + file)
})



app.post("/editArticle", (req, res) => {
  let { title, content, ids, fileName } = req.body;
  pool.query(
    "UPDATE `files` SET `title`='" +
    title +
    "', `content`='" +
    content +
    "' , `fileName`='" +
    fileName +
    "' , `dateLastEdited`='" +
    new Date() +
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
        console.log(error);
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








//File Reading/Download
app.get("/download/:fileId", (req, res) => {

  pool.query(
    "SELECT * FROM files where id = '" + req.params.fileId + "' ",
    (error, result, row) => {
      if (error) {
        res.send({
          ...responseObj,
          success: false,
          message: "Error Fetching files",
          data: error,
        });
      } else {

        if (result.length > 0) {
          fs.writeFileSync(
            result[0].fileName,
            JSON.stringify(result[0])
          );
          setTimeout(() => {
            res.download(result[0].fileName);
          }, 2000);



        } else {
          res.send({
            ...responseObj,
            success: false,
            message: "The file does not exist",
            data: error,
          });
        }
      }
    }
  );
})



app.post("/readFile", (req, res) => {
  const { file } = req.body;

  console.log(file)


})




app.post('/updatecoins', (req, res) => {
  const { email, coins, type } = req.body;
  pool.query("SELECT * FROM users where email = '" + email + "' ",
    (error, result, row) => {
      if (error) {
        res.send({
          ...responseObj,
          success: false,
          message: "Error Fetching users",
          data: error,
        });
      } else {

        let bal = 0;
        if (type === "credit") {
          bal = parseFloat(result[0]?.coins) + parseFloat(coins);
        } else {
          bal = parseFloat(result[0]?.coins) - parseFloat(coins);
        }

        pool.query("UPDATE users set coins=" + bal + " WHERE email='" + email + "'", (err, res, row) => {

        })


      }
    })



})







app.get('/assignments/user/:email', (req, res) => {

  pool.query("SELECT * FROM assignments WHERE campus='" + req.params.campus + "'", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, success: false, message: "Error Fetching Assignments", data: error })

    } else {
      pool.query("SELECT * FROM mycourses WHERE user='" + req.params.email + "'", (error, resul, row) => {
        if (error) {
          res.send({ ...responseObj, success: false, message: "Error Fetching Courses", data: error })

        } else {

          res.send({ ...responseObj, success: true, message: "Assignments Fetched Successfully for " + req.params.email, data: resul })


        }
      })



    }
  })

})






//OpenAi



app.get('/openai', async (req, res) => {


  res.send('Yes');
})

app.get('/reset/', (req, res) => {


  res.send({ ...responseObj, success: false, message: "User not provided" })

})




app.get('/reset/:email', (req, res) => {

  let code = Math.floor(Math.random() * 1000000);
  pool.query("UPDATE users SET verify_code=" + code + " WHERE email='" + req.params.email + "'", (error, result, row) => {
    if (error) { } else {

    }
  })

  pool.query("SELECT password from users WHERE email='" + req.params.email + "'", (err, result, row) => {
    if (result.length > 0) {

      // mailer({ recipients: req.params.email, subject: 'Reset Password - Microskool', message: 'Your current passord hint is:[' + result[0].password.substring(0, 1) + '********' + result[0].password.substring(result[0].password.length - 1) + '] (If you still cannot remember)  Use this code to confirm your request to reset your password: ' + code })
      res.send({ ...responseObj, success: true, message: "Check your mail for Password Recovery instructions" })

    } else {
      res.send({ ...responseObj, success: false, message: "User not found, please create an account" })

    }

  })


})

app.post('/reset/', (req, res) => {
  const { email, currentPassword, code, newPassword } = req.body;
  if (email === "" || email === undefined || newPassword === "" || newPassword === undefined) {
    res.send({ ...responseObj, success: false, message: "Password and a user is required" })
  } else {
    if (currentPassword === "" || currentPassword === undefined && code === "" || code === undefined) {
      res.send({ ...responseObj, success: false, message: "You must provide current password or a confirmation code" })
    }
    else {


      pool.query("SELECT * FROM users WHERE email='" + email + "' && password='" + currentPassword + "' OR verify_code='" + code + "'", (err, result, row) => {
        if (result.length > 0) {


          pool.query("UPDATE users SET password='" + newPassword + "' WHERE email='" + email + "' && password='" + currentPassword + "' OR verify_code='" + code + "'", (err, result, row) => {
            if (err) {
              res.send({ ...responseObj, success: false, message: "An error occurred, check your entry and try again: " + err })
            } else {
              res.send({ ...responseObj, success: true, message: "Password changed successfully" })
            }
          })
        } else {
          res.send({ ...responseObj, success: false, message: "Authentication Failed" })

        }
      })

    }
  }

})



app.get('/preview-doc/:path', async (req, res) => {
  const fileArr = req.params.path.split("*")
  let file = fileArr[0] + "/" + fileArr[1]
  let fileObj = await fs.readFileSync('./Documents/User4/manual.misb')
  res.send(JSON.parse(fileObj))
  // console.log(fileObj)

})



// define your own email api which points to your server.
app.post('/sendemail/', function (req, res) {
  const { name, email, subject, message } = req.body;
  //implement your spam protection or checks.
  sendEmail(name, email, subject, message);
  res.send('Sent')
});



// Add the route handler to your express app or any other backend framework
app.post('/articles', generateArticle);



app.listen(5000, () => console.log("Listening on 5000")); 