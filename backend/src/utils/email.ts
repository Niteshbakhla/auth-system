import nodemailer from "nodemailer";
import { config } from "../config/env.js";



const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: Number(config.EMAIL_PORT),
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});


interface SendEmailOptions {
    to: string,
    subject: string,
    html: string
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
    console.log("Attempting to send email to:", options.to);
    await transporter.sendMail({
        from: config.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html
    });
    console.log("Email sent successfully");
}



