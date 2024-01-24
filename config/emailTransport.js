// Email Transport Configuration
const nodemailer = require("nodemailer");

const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

/* const sendEmail = async (options) => {
    // 1) Create a Transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
        }
    });
    
    // 2) Define the email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text
        // html:
    };
    
    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
} */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;
