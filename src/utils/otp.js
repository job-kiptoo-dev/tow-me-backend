import nodemailer from 'nodemailer'
import twilio from 'twilio'
import crypto from 'crypto'

const smtp_user=process.env.EMAIL_USER
const smtp_pass=process.env.EMAIL_PASS
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: smtp_user,
        pass: smtp_pass,
    }
})

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export async function generateOTP(length=6) {
    const buffer = crypto.randomBytes(length);
    const otp = Array.from(buffer)
        .map(b => (b % 10).toString()) 
        .join('')
        .slice(0, length);

    return otp;
}

export async function sendEmailOTP(to, otp) {
    await transporter.sendMail({
        from: `"TowMe" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your OTP Code",
        text: `Your verification code is ${otp}.\n It will expire in 5 minutes.`
    })
}

export async function sendSMSOTP(to, otp) {
    await twilioClient.messages.create({
        body: `Your TowMe OTP is ${otp}`,
        to
    })
}