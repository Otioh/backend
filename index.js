const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const misbFormat = require("./TS/misb");
const sendEmail = require('./mailer');
const http = require('http')
const nodemailer = require('nodemailer');



const errorObj = {
  message: 'Something went wrong',
  fields: [
    {
      label: '',
      messagel: ''
    }
  ]
}








const app = express();
const server = http.createServer(app);

// Set the server timeout to 2 minutes (120,000 milliseconds)
server.timeout = 120000;

app.use(cors())
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const apiKey = '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';

// Initialize the OpenAI API client


const configuration = new Configuration({
  organization: "org-zcEroWt0z8uG12N0kgrzPC0L",
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);









// //Real Live Server
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "dropoudc_dropoud_admin",
//   password: "DxRUK#Ubr~3h",
//   database: "dropoudc_Dropoud",

// });
// const endpoint = 'https://backend.dropoud.com/'




// //Test Live Server   
// const pool = mysql.createPool({
//   host: "sql.freedb.tech",
//   user: "freedb_erim.microskool",
//   password: "G%cV?zfxa%5SwTv",
//   database: "freedb_microskool",
//   connectionLimit: 10,
// });
// const endpoint = 'https://drab-rose-katydid-hose.cyclic.cloud/'


//Local Server
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "dropoud",
  connectionLimit: 10,
});
// const endpoint = 'http://localhost:5000/';
const endpoint = 'http://192.168.1.44:5000/'




const responseObj = {
  message: "",
  success: false,
  data: []
}





const transporter = nodemailer.createTransport({
  host: 'mail.dropoud.com', // Replace with your SMTP server hostname
  port: 465, // Replace with the appropriate port
  secure: true, // Set to true for SSL connections (e.g., for Gmail)
  auth: {
    user: 'support@dropoud.com', // Your email address
    pass: 'x6qv#qY)yR;8', // Your email password
  },
});






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

app.use('/assets', express.static('assets'))

app.use(express.static(path.join(__dirname, "assets")));



app.post('/profile/:email', upload.single('avatar'), function (req, res, next) {
  console.log(req.body)
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






// Handle user input and generate the article
app.post('/generate-article', async (req, res) => {

  const { prompt, email, password } = req.body;

  if (!email) {
    res.status(422).send({ ...errorObj, message: 'User Email is Required!' })
    return
  }

  if (!password) {
    res.status(422).send({ ...errorObj, message: 'User Password is Required!' })
    return
  }


  if (!prompt) {
    res.status(422).send({ ...errorObj, message: 'AI Prompt or Article Description is Required!' })
    return
  }




  pool.query("SELECT * FROM users WHERE email='" + email + "' && password='" + password + "'", (error, result, row) => {
    if (error) {
      res.status(503).send({ ...errorObj, message: "Error Retrieving User" })
    } else {
      if (result.length > 0) {

        if (parseInt(result[0].coins) > 200) {

          let newbalance = parseFloat(result[0].coins) - 200;
          pool.query("UPDATE users SET coins=" + newbalance + " WHERE email='" + email + "' ", (error, result, row) => {
            if (error) {
              res.status(503).send({ ...errorObj, message: "Error Charging User" })
              console.log(error)
            } else {







              try {
                // Generate article content using OpenAI
                // const response = await openai.createCompletion({
                //   prompt: prompt,
                //   max_tokens: 10, // Adjust the max tokens based on your desired article length
                // });

                const response = {
                  data: {
                    choices: [{
                      text: `
    
    Transforming Education: A Blueprint for Improving Education in a Country

##Introduction

Education is the cornerstone of any thriving society, driving economic growth, innovation, and social progress. It is the key to unlocking the potential of individuals and the nation as a whole. However, many countries face challenges in their education systems, including inadequate resources, outdated curriculum, and unequal access to quality education. To overcome these obstacles and create a brighter future, we must focus on improving education in a comprehensive and sustainable way. In this article, we will discuss a blueprint for enhancing education in a country.

##Invest in Quality Teachers
Teachers are the heart and soul of the education system. To improve education, it is essential to attract and retain high-quality educators. This can be achieved through:

Competitive salaries and benefits to motivate and retain talented teachers.
Ongoing professional development opportunities to keep educators up-to-date with the latest teaching methods.
Mentorship and support programs for new teachers to help them excel in their roles.
Recognizing and rewarding outstanding teaching practices.

##Update Curriculum and Pedagogy
The world is constantly evolving, and so too should our educational content and methods. To ensure relevance and effectiveness, it is imperative to:

Review and update curriculum regularly to reflect current knowledge and societal needs.
Promote student-centered learning approaches, encouraging critical thinking, creativity, and problem-solving.
Incorporate technology and digital resources to enhance learning experiences.
Foster a culture of lifelong learning among both students and educators.

##Equitable Access to Education
Education should be accessible to all, regardless of socio-economic status, location, or background. To achieve this goal, it is essential to:

Invest in infrastructure and facilities to provide safe and conducive learning environments.
Offer scholarships and financial aid to disadvantaged students.
Promote inclusive education by accommodating students with diverse needs.
Bridge the digital divide by ensuring access to technology and internet connectivity for all students.

#Assess and Measure Progress
Effective education reform requires a robust system of assessment and accountability. To track progress and make informed decisions, it is crucial to:

Develop standardized assessments that measure essential skills and knowledge.
Establish a data-driven approach to monitor student performance and identify areas for improvement.
Encourage transparency by sharing assessment results with educators, parents, and the public.
Use assessment data to inform policy and curriculum changes.

##Promote Parental and Community Involvement
Education is a collaborative effort between schools, parents, and the community. To enhance the educational experience, it is important to:

Encourage parental involvement through regular communication, parent-teacher conferences, and volunteer opportunities.
Create partnerships with local businesses and organizations to provide resources, mentorship, and real-world experiences for students.
Foster a sense of community and support for education through outreach programs and initiatives.

##Embrace Innovation and Research
To stay ahead in the global knowledge economy, countries must embrace innovation and research in education. This includes:

Funding research projects to explore new teaching methods, technologies, and educational policies.
Encouraging educators to experiment with innovative approaches in the classroom.
Supporting entrepreneurship in education to develop and scale innovative solutions.
Collaborating with international partners to learn from global best practices.

##Conclusion

Improving education in a country is a multifaceted endeavor that requires dedication, collaboration, and a long-term vision. By investing in quality teachers, updating curriculum and pedagogy, ensuring equitable access, measuring progress, involving parents and communities, and embracing innovation and research, nations can transform their education systems and provide a brighter future for their citizens. Education is not only a key to personal success but also the foundation of a prosperous and inclusive society.
    

##References
Darling-Hammond, L. (2017). Teacher education around the world: What can we learn from international practice? European Journal of Teacher Education, 40(3), 291-309.

Ingersoll, R. M., & Strong, M. (2011). The impact of induction and mentoring programs for beginning teachers: A critical review of the research. Review of Educational Research, 81(2), 201-233.

Camilli, G., Vargas, S., Ryan, S., & Barnett, W. S. (2010). Meta-analysis of the effects of early education interventions on cognitive and social development. Teachers College Record, 112(3), 579-620.

PricewaterhouseCoopers. (2015). Global Top 100 companies by market capitalization: Global Top 100 companies by market capitalization.

UNESCO. (2017). Inclusive education: The way of the future.

Hanushek, E. A., & Woessmann, L. (2007). The role of education quality in economic growth. World Bank Policy Research Working Paper, (4122).

Epstein, J. L. (2001). School, family, and community partnerships: Preparing educators and improving schools. Westview Press.

The World Bank. (2009). The Road to Results: Designing and Conducting Effective Development Evaluations. World Bank Publications.

    `}]
                  }
                }
                console.log(response)
                const articleContent = response.data.choices[0].text.split('##References')[0];
                const refs = response.data.choices[0].text.split('##References')[1];


                // Format the article as HTML with div, img, and heading tags
                let formattedHTML = formatContentWithTagsAndImages(articleContent);
                const references = refs.split('\n\n');
                let listrefs = '';

                references.forEach((ref) => {
                  listrefs += `<li>${ref}</li>`
                })
                formattedHTML += `<di>
    <h2>References:</h2>
    <ol> ${listrefs}</ol></di>`

                res.send(formattedHTML);
                // res.status(422).send({...errorObj , message:'We sent the wrong message'})



              } catch (error) {
                res.status(500).send('Error generating article.' + error);
              }
            }
          })
        } else {
          res.status(402).send({ ...errorObj, message: result[0].first_name + "! Your wallet balace is insufficient" })
        }
      } else {
        res.status(401).send({ ...errorObj, message: "Invalid User Details" })
      }
    }
  })
});

// Function to format content with specific tags and images
function formatContentWithTagsAndImages(articleContent) {
  const lines = articleContent.split('\n');
  let formattedHTML = '';

  for (const line of lines) {
    if (line.startsWith('#')) {
      // If it's a heading, use the corresponding h1, h2, etc. tag
      const headingLevel = line.match(/#+/)[0].length;
      const headingText = line.replace(/#+/, '').trim();
      formattedHTML += `<h${headingLevel}>${headingText}</h${headingLevel}>`;
    } else if (line.startsWith('![image](')) {
      // If it's an image, use the img tag with a database URL
      const imageURL = line.match(/\((.*?)\)/)[1];
      // You can replace 'database-url/' with the actual URL to your database
      formattedHTML += `<img src="database-url/${imageURL}" alt="Image">`;
    }
    else {
      // Otherwise, use the div tag for paragraphs
      formattedHTML += `<div>${line}</div>`;
    }


  }



  return formattedHTML;
}






app.post('/lecture', uploadLecture.single('lecture'), function (req, res, next) {



  res.send({ ...responseObj, message: "Lecture Stream Initiated", success: true })
})





app.post('/lecture/:campus/:user/:course/:lecturer/:lid/:topic', uploadLecture.single('lecture'), function (req, res, next) {


  console.log('first')
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













app.get('/', (req, res) => {

  res.send({ ...responseObj, message: "Welcome", success: true })
});





app.get('/users', (req, res) => {
  pool.query("SELECT * FROM users", (error, result, row) => {
    if (error) {
      res.send({ ...responseObj, message: "Error Retrieving Users" })
    } else {
      res.send({ ...responseObj, data: result, success: true, message: "Users Retrieved Successfully" })
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
        if (result[0].verified > 0) {
          res.send({ ...responseObj, success: true, message: "Users Validity Retrieved Successfully" })
        } else {

          let code = Math.floor(Math.random() * 1000000);
          pool.query("UPDATE users SET verify_code=" + code + " WHERE email='" + req.params.email + "'", (error, result, row) => {
            if (error) { }
          })

          const mailOptions = {
            from: 'support@dropoud.com',
            to: req.params.email,
            subject: 'Account Verification OTP',
            html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dropoud Account Verification OTP</title>
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
        <p>Account Security</p>
    </div>
    <div class="content">
       
     Your One-Time Password (OTP) for account verification is: <h2>${code}</h2>.

<h4>Instructions:</h4>
<ol>
<li>
Do not share this OTP with anyone.

</li>

<li>
This code is valid for the next 10 minutes.

</li>

<li>

Use this OTP for account verification on our platform.
</li>

<li>
Ignore this message if you did not request an OTP.

</li>
<li>

No one from Dropoud will ask for your OTP.
</li>

</ol>
For support or inquiries, contact our customer service at 090609666606.

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

            } else {
              console.log('Email sent:', info.response);

            }
          });

          res.send({ ...responseObj, success: false, message: "Check your mailbox for a verification code " + req.params.email })
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
        pool.query("UPDATE users SET verified=1 WHERE email='" + req.params.email + "' && verify_code='" + code + "' ", (error, result, row) => {
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
          pool.query("INSERT INTO `users` (`id`, `first_name`, `surname`, `email`, `password`, `phone`, `matric`, `created_at`, `verified`, `verify_code`,  `campus`, `institution`,  `department`, `level`, `courses`, `image`, `coins`, `cgpa`, `privileges`, `intent`) VALUES (NULL, '" + first_name + "', '" + surname + "', '" + email + "', '" + password + "', '" + phone + "', '" + matric + "', '" + new Date() + "', 0, '', '',  '', '', '', '', '" + endpoint + "assets/pro.png',0, 0,0, '')", (error, result, row) => {
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





app.post('/postFile/:id', uploadDoc.single('file'), (req, res) => {

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

  const data = JSON.stringify(req.body);

  fs.writeFileSync(
    req.body.fileName,
    data
  );
  res.send('File Written')




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



app.get('/downloadFile/:fileName', (req, res) => {

  res.download(`./${req.params.fileName}`)
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
            JSON.stringify(result[0],)
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


      const mailOptions = {
        from: 'support@dropoud.com',
        to: req.params.email,
        subject: 'Password Reset OTP',
        html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dropoud Password Reset OTP</title>
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
        <p>Account Security</p>
    </div>
    <div class="content">
       
     Your One-Time Password (OTP) for account verification is: <h2>${code}</h2>.

<h4>Instructions:</h4>
<ol>
<li>
Do not share this OTP with anyone.

</li>

<li>
This code is valid for the next 10 minutes.

</li>

<li>

Use this OTP for account verification on our platform.
</li>

<li>
Ignore this message if you did not request an OTP.

</li>
<li>

No one from Dropoud will ask for your OTP.
</li>

</ol>
For support or inquiries, contact our customer service at 090609666606.

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

        } else {
          console.log('Email sent:', info.response);

        }
      });


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



app.get('/version', (req, res) => {
  pool.query("SELECT * FROM app WHERE app_name='Dropoud'", (err, result, row) => {
    console.log(result[0])
    res.send(result[0])
  })
})






app.listen(5000, () => console.log("Listening on 5000")); 