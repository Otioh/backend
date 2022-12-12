const nodemailer=require('nodemailer');


 function mailer(mailConfig={recipients:'', subject:'', message:''}){

const transport=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'bryonerim@gmail.com',
        pass:'cumvnpsdpadyirmt'
    }
})


transport.sendMail({
    from:'no-reply@microskool.com',
    to:mailConfig.recipients,
    subject:mailConfig.subject,
    text:mailConfig.message

})


}

module.exports=mailer