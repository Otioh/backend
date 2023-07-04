const axios = require('axios');

 async function sendEmail(name, email, subject, message) {
  const data = JSON.stringify({
    "Messages": [{
      "From": {"Email": "test@verifyme.com.ng", "Name": "Microskool"},
      "To": [{"Email": email, "Name": name}],
      "Subject": subject,
      "TextPart": message
    }]
  });

  const config = {
    method: 'post',
    url: 'https://api.mailjet.com/v3.1/send',
    data: data,
    headers: {'Content-Type': 'application/json'},
      auth: { username: 'e7aae8a7ad0541c339cb3bfb13ea71dc', password: '9d07094c891f0f47fd3e56b317f3a27c'},
  };

  return axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

}


module.exports=sendEmail