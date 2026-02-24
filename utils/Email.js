import nodemailer from "nodemailer";

export const sendEmail = async (options) => {

    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,   
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log('Email transporter created successfully',process.env.EMAIL_HOST,  process.env.EMAIL_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASS);
    // 2) Define the email options
    const mailOptions = {
       from: `Doaa <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Send the email
    const info = await transporter.sendMail(mailOptions);
 
}

/*
1️⃣ اليوزر قال نسيت الباسورد
2️⃣ السيرفر عمل توكن
3️⃣ السيرفر بعت إيميل فيه لينك  (اللينك بيحتوي على التوكن) 
4️⃣ اليوزر ضغط اللينك
5️⃣ غيّر الباسورد
6️⃣ خلصنا ✅
*/

// It comes from the Express request object and represents the protocol used in the HTTP request (http or https).
//try this site 👉 https://mailtrap.io to test your email sending functionality without sending real emails to actual email addresses. Mailtrap provides a safe environment for testing email sending in development.