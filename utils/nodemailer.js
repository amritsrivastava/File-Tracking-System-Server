const nodemailer = require('nodemailer');

module.exports = async function sendEmail(data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amrits.test@gmail.com',
      pass: 'Amrit@test@password1'
    }
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'amrits.test@gmail.com', // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text // plain text body
  });

  return data;
};
