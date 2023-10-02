const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 5000;
const multer = require('multer');
const nodemailer = require('nodemailer');


app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/assets', express.static('assets'))

app.use(express.static(path.join(__dirname, "assets")));

const responseObj = {
    message: "",
    success: false,
    data: []
}

//Real Live Server
const pool = mysql.createPool({
    host: "localhost",
    user: "dropoudc_dropoud_admin",
    password: "DxRUK#Ubr~3h",
    database: "dropoudc_Dropoud",

});
const endpoint = 'https://backend.dropoud.com/'



const transporter = nodemailer.createTransport({
    host: 'mail.dropoud.com', // Replace with your SMTP server hostname
    port: 465, // Replace with the appropriate port
    secure: true, // Set to true for SSL connections (e.g., for Gmail)
    auth: {
        user: 'support@dropoud.com', // Your email address
        pass: 'x6qv#qY)yR;8', // Your email password
    },
});




//MULTER

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



const multerStorageAssignment = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, 'assets')
    },
    filename: (req, file, cb) => {
        const fileName = "myFile" + req.body.course + Date.now() + ".misb"
        cb(null, fileName);

        const { course, title, campus, filestat, user } = req.params;

        pool.query("INSERT INTO `assignments` (`id`, `course`,`date`, `title`, `file`, `campus`, `downloads`, `warnings`,  `filestat`, `user`) VALUES (NULL, '" + course + "',  '" + new Date() + "',  '" + title + "', '" + "assets/" + fileName + "', '" + campus + "', 0, 0,  '" + filestat + "', '" + user + "');", (error, result, row) => {
            if (error) {

            }
        })



    }
})



const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets')
    },
    filename: (req, file, cb) => {
        let ext = file.mimetype.split('/')[1];
        const email = req.params.email;

        let name = email ? `${email.split('@')[0]}--${Math.random(0, 300)}` : 'email';
        let saveName = name + "." + ext;
        cb(null, `${name}.${ext}`)
        pool.query("UPDATE users SET image='" + endpoint + "assets/" + saveName + "' WHERE email='" + email + "'", (error, result, row) => {

        })
    }
})


const multerStorageLecture = multer.diskStorage({
    destination: async (req, file, cb) => {
        fs.mkdir(`assets/videos/${req.params.lid}`, (err) => {
            if (err) {

                console.log(err)
                cb(null, `assets/videos/${req.params.lid}`)
            } else {
                cb(null, `assets/videos/${req.params.lid}`)
            }
        })

    },
    filename: (req, file, cb) => {
        let ext = file.mimetype.split('/')[1];
        const { user, course, topic, lecturer, campus, lid } = req.params;

        let name = user ? `${user.split('@')[0]}--${Math.random(0, 300)}` : 'user';
        let saveName = name + "." + ext;
        cb(null, `${name}.${ext}`)

        pool.query("SELECT * FROM lectures WHERE lid='" + lid + "'", (error, result, row) => {
            if (error) {
                res.send({ ...responseObj, message: "Error Retrieving Lecture" })
            } else {
                if (result.length > 0) {

                } else {

                    pool.query("INSERT INTO `lectures` (`id`, `course`, `topic`, `lecturer`, `date`, `video`, `user`, `campus`, `wrong`, `correct`, `lid`) VALUES (NULL, '" + course + "', '" + topic + "', '" + lecturer + "', '" + new Date() + "', './assets/videos/" + lid + "/" + saveName + "', '" + user + "', '" + campus + "', '0', '0', '" + lid + "');", (error, result, row) => {

                    })
                }
            }
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
    storage: multerStorageLecture, limits: { fileSize: 300 * 1024 * 1024 }
})




const uploadAssignment = multer({
    storage: multerStorageAssignment
})







const getTempFile = multer({
    storage: multerTempStorage
})
































//ENDPOINTS
app.get('/', (req, res) => {

    res.send({ ...responseObj, message: "Welcome", success: true })
});

app.post('/profile/:email', upload.single('avatar'), function (req, res, next) {
    console.log(req.body)
    res.send({ ...responseObj, message: "Upload Successful", success: true })
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



app.post('/lecture', uploadLecture.single('lecture'), function (req, res, next) {



    res.send({ ...responseObj, message: "Lecture Stream Initiated", success: true })
})





app.post('/lecture/:campus/:user/:course/:lecturer/:lid/:topic', uploadLecture.single('lecture'), function (req, res, next) {


    console.log('first')
    res.send({ ...responseObj, message: "Lecture Stream Initiated ", success: true })
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



app.get('/filesdir', (req, res) => {
    const directoryPath = 'assets/videos';

    // Read the directory
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        // Filter out directories, leave only files
        const fileNames = files.filter(file => {
            return fs.statSync(path.join(directoryPath, file)).isFile();
        });

        res.send(fileNames);
    });


})


app.post('/intent', (req, res) => {
    const { user, intent } = req.body;
    if (user === "" || intent === "") {
        res.send({ ...responseObj, message: "Error Retrieving User" })
    } else {
        pool.query("SELECT * FROM users WHERE email='" + user + "'", (error, result, row) => {
            if (error) {
                res.send({ ...responseObj, message: "Error Retrieving User" })
            } else {
                if (result.length > 0) {
                    if (parseInt(result[0].coins) < 30) {
                        res.send({ ...responseObj, message: result[0].first_name + ", You do not have sufficient coins, fund your wallet to continue" })
                    } else {

                        pool.query("UPDATE users SET intent='" + intent + "' WHERE email='" + user + "'", (err) => {
                            if (!err) {
                                pool.query("SELECT * FROM lectures WHERE lid='" + intent + "'", (error, result, row) => {
                                    if (error) {

                                    } else {
                                        if (result.length > 0) {
                                            res.send({ ...responseObj, message: "Intent Set", success: true, data: { rate: '295/Hour', user: result[0].user } })

                                        }
                                    }
                                })
                            }
                        })

                    }
                } else {
                    res.send({ ...responseObj, message: "Invalid User" })
                }
            }
        })


    }
})


app.get('/:user/lectures/watch/:id/:index', (req, res) => {
    let meUser;
    if (req.params.user !== undefined || req.params.user !== 'undefined' || req.params.index === '0') {

        pool.query("SELECT * FROM lecture_views WHERE user='" + req.params.user + "' &&  lecture_id='" + req.params.id + "' ", (error, result, row) => {
            if (error) {

            } else {
                if (result.length > 0) {

                } else {
                    pool.query("INSERT INTO `lecture_views` (`id`, `user`, `lecture_id`, `date`) VALUES (NULL, '" + req.params.user + "', '" + req.params.id + "', '" + new Date() + "')", (error, result, row) => {
                        if (error) {

                        } else {

                        }
                    })
                }

            }
        })
    }


    pool.query("SELECT * FROM users WHERE id='" + req.params.user + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, message: "Error Retrieving User" })
        } else {
            if (result.length > 0) {
                meUser = result[0]
                if (parseInt(result[0].coins) < 30) {
                    res.send({ ...responseObj, message: result[0].first_name + ", You do not have sufficient coins, fund your wallet to continue" })


                } else {
                    if (result[0].intent === req.params.id) {



                        pool.query("SELECT * FROM lectures WHERE lid='" + req.params.id + "'", (error, result, row) => {
                            if (error) {
                                res.send({ ...responseObj, message: "Error Retrieving Lecture" })
                            } else {
                                if (result.length > 0) {


                                    function getVideoFiles(directory) {
                                        return fs.readdirSync(directory).filter(file => {
                                            const ext = path.extname(file).toLowerCase();
                                            return ext === '.mp4' || ext === '.webm'; // Adjust video extensions as needed
                                        }).reverse();
                                    }
                                    if (parseInt(req.params.index) > getVideoFiles('assets/videos/' + req.params.id).length - 1) {

                                        console.log('out of range')
                                        res.send('Out of Range')



                                    } else {



                                        res.setHeader('Content-Type', 'video/mp4'); // Set headers here
                                        res.setHeader('Cache-Control', 'no-cache'); // Example: Prevent caching







                                        streamVideos(res, getVideoFiles('assets/videos/' + req.params.id)[parseInt(req.params.index)], `assets/videos/${req.params.id}`);





                                        function streamVideos(response, file, videosDirectory) {


                                            const videoFilePath = path.join(videosDirectory, file);
                                            const videoStream = fs.createReadStream(videoFilePath);


                                            let myCoins = parseInt(meUser.coins) - (25 / 2);


                                            pool.query("UPDATE users SET coins=" + myCoins + " WHERE email='" + meUser.email + "'", (err) => {
                                                if (!err) {
                                                    videoStream.pipe(response);
                                                }
                                            })








                                            videoStream.on('end', () => {

                                                console.log('first')



                                                console.log('All videos streamed.');

                                            });

                                            videoStream.on('error', err => {
                                                console.error('Error streaming video:', err);
                                                response.status(500).send('Internal Server Error');
                                            });
                                        }

                                    }



                                } else {
                                    res.send({ ...responseObj, message: "No Lecture with the provided ID" })
                                }
                            }
                        })



                    } else {
                        res.send({ ...responseObj, message: "You don't intend to join this class" })
                    }







                }
            }
        }
    })
})








app.get('/lectures/viewers/:lid', (req, res) => {
    pool.query("SELECT * FROM lecture_views WHERE lecture_id='" + req.params.lid + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, message: "Error Retrieving Viewers" })
        } else {
            if (result.length > 0) {

                res.send({ ...responseObj, data: result, success: true, message: "Viewers Retrieved Successfully" })
            } else {
                res.send({ ...responseObj, message: "Lecture does not exist" })
            }
        }

    })

})



app.get('/auth/:email', (req, res) => {
    pool.query("SELECT verified FROM users WHERE email='" + req.params.email + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, message: "Error Retrieving Users" })
        } else {
            if (result.length > 0) {
                if (result[0].verified === 'true') {
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
                    pool.query("INSERT INTO `users` (`id`, `first_name`, `surname`, `email`, `password`, `phone`, `matric`, `created_at`, `verified`, `verify_code`,  `campus`, `institution`,  `department`, `level`, `courses`, `image`, `coins`, `cgpa`, `privileges`, `intent`) VALUES (NULL, '" + first_name + "', '" + surname + "', '" + email + "', '" + password + "', '" + phone + "', '" + matric + "', '" + new Date() + "', 'false', '', '',  '', '', '', '', '" + endpoint + "assets/pro.png',0, 0,0, '')", (error, result, row) => {
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
            res.send({ ...responseObj, message: "Error Retrieving User" })
        } else {
            if (result.length > 0) {
                res.send({ ...responseObj, data: result, success: true, message: "User Retrieved Successfully" })

            } else {
                res.send({ ...responseObj, data: result, success: false, message: "User Not Found" })

            }
        }

    })

})





app.get('/mycourses/:email', (req, res) => {
    pool.query("SELECT * FROM mycourses WHERE user='" + req.params.email + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, message: "Error Retrieving mycourses" })
        } else {
            res.send({ ...responseObj, data: result, success: true, message: req.params.email + " courses Retrieved Successfully" })
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
    if (name.toLowerCase().includes('department')) {
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
                    pool.query("INSERT INTO campuses (`id`,`name`, `user`, `logo`, `acro`)VALUES(NULL, '" + name + "', 'Admin', '" + endpoint + "assets/" + req.body.acro + ".png" + "', '" + acro + "')", (error, result, row) => {
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

        pool.query("UPDATE campuses SET name='" + name + "', logo='" + endpoint + "assets/" + req.body.acro + ".png" + "', acro='" + acro + "' WHERE id=" + req.params.id + "", (error, result, row) => {
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
        pool.query("SELECT * FROM allcourse WHERE code='" + code + "' && campus='" + campus + "'", (error, result, row) => {
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









app.post('/assignments/:campus/:user/:course/:title/:filestat', uploadAssignment.single('misb'), (req, res) => {
    res.send({ ...responseObj, success: true, message: "Assignment Posted Successfully" })



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



app.delete('/votes/:periodId', (req, res) => {

    pool.query("DELETE FROM votes WHERE subject_id='" + req.params.periodId + "'", (error, result, row) => {
        if (error) {
            res.send({ ...responseObj, message: "Error removing Votes" });
        } else {

            pool.query("UPDATE schedule SET correct=" + 0 + ", wrong=" + 0 + " WHERE id='" + req.params.periodId + "'", (error, result, row) => {
                if (error) {
                    res.send({ ...responseObj, message: "Error Clearing Votes" });
                    console.log(error)
                } else {

                    res.send({
                        ...responseObj,
                        success: true,
                        message: "Votes Cleared Successfully ",
                    });


                }
            })

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

        const senderBalance = SENDER.coins - amount;

        const receiverBalance = percent + RECEIVER.coins;


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
                    bal = parseFloat(result[0].coins) + parseFloat(coins);
                } else {
                    bal = parseFloat(result[0].coins) - parseFloat(coins);
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





app.get("/support", (req, res) => {
    pool.query("SELECT * FROM support", (error, result, row) => {
        if (error) {
            res.send({
                ...responseObj,
                success: false,
                message: "Error Fetching support",
                data: error,
            });
        } else {
            res.send({
                ...responseObj,
                success: true,
                message: "Support Fetched Successfully",
                data: result,
            });
        }
    });
})




app.get("/support/pending", (req, res) => {
    pool.query("SELECT * FROM support WHERE status='Pending'", (error, result, row) => {
        if (error) {
            res.send({
                ...responseObj,
                success: false,
                message: "Error Fetching support",
                data: error,
            });
        } else {
            res.send({
                ...responseObj,
                success: true,
                message: "Pending Support Fetched Successfully",
                data: result,
            });
        }
    });
})



app.get("/support/single/:email", (req, res) => {
    pool.query("SELECT * FROM support WHERE email='" + req.params.email + "'", (error, result, row) => {
        if (error) {
            res.send({
                ...responseObj,
                success: false,
                message: "Error Fetching support",
                data: error,
            });
        } else {
            res.send({
                ...responseObj,
                success: true,
                message: "Pending Support Fetched Successfully",
                data: result,
            });
        }
    });
})





app.post("/support", (req, res) => {
    const { email, name, message } = req.body;


    if (email || name || message) {



        pool.query("INSERT INTO `support` (`id`, `email`, `name`, `message`, `date`, `status`) VALUES (NULL, '" + email + "', '" + name + "', '" + message + "', '" + new Date() + "', 'Pending')", (error, result, row) => {
            if (error) {
                res.send({
                    ...responseObj,
                    success: false,
                    message: "Error Submitting Support",
                    data: error,
                });
            } else {
                res.send({
                    ...responseObj,
                    success: true,
                    message: "Support submitted successfully, check your mailbox for feedback",
                    data: [],
                });
            }
        });
    } else {
        res.send({
            ...responseObj,
            success: false,
            message: "All Fields are required",
            data: [],
        });
    }
})







app.put("/support", (req, res) => {
    const { id, status } = req.body;


    if (id || status) {



        pool.query("UPDATE `support` SET `status` = '" + status + "' WHERE `support`.`id` = " + id + ";", (error, result, row) => {
            if (error) {
                res.send({
                    ...responseObj,
                    success: false,
                    message: "Error Updating Support",
                    data: error,
                });
            } else {
                res.send({
                    ...responseObj,
                    success: true,
                    message: "Support Status Updated",
                    data: [],
                });
            }
        });
    } else {
        res.send({
            ...responseObj,
            success: false,
            message: "All Fields are required",
            data: [],
        });
    }
})











app.post("/sendmail", (req, res) => {

    const mailOptions = {
        from: 'support@dropoud.com',
        to: req.body.email,
        subject: req.body.subject,
        html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Email Subject</title>
    <style>
        /* Reset some default styles */
        body, p {
            margin: 0;
            padding: 0;
        }

        /* Set background color and text color for the whole email */
        body {
            background-color: #f0f0f0;
            color: #333;
            font-family: Arial, sans-serif;
        }

        /* Header styles */
        .header {
            background-color: rgb(83,83,170);
            color: #fff;
            text-align: center;
            padding: 20px;
        }

        /* Content styles */
        .content {
            padding: 20px;
        }

        /* Footer styles */
        .footer {
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Dropoud</h1>
        <p>${req.body.department}</p>
    </div>
    <div class="content">
        <h2>Hello ${req.body.name}!</h2>
        <p>${req.body.message}</p>
         <p>
    Please Get back to us if you have further questions
    </p>
    </div>
   
    <div class="footer">
        <p>&copy; 2023 Dropoud | <a href="https://www.dropoud.com">Visit our website</a></p>
    </div>
</body>
</html>

  `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.send({
                ...responseObj,
                success: false,
                message: "Error sending email",
                data: [],
            });
        } else {
            console.log('Email sent:', info.response);
            res.send({
                ...responseObj,
                success: true,
                message: "Support Mail Sent Successfully",
                data: [],
            });
        }
    });

})




























// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
