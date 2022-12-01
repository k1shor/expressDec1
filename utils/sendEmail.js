const nodemailer = require('nodemailer')

const sendEmail = async (mailOptions) => {
    var transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transport.sendMail({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html:mailOptions.html
      })

      console.log("Email send successfully")
}

module.exports = sendEmail