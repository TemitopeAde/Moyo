
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { userAgent, timestamp, path } = await req.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'moyoayaworan@gmail.com',
            subject: `New Active Session Detected`,
            text: `
                A new user session has been active.
                Time: ${new Date(timestamp).toLocaleString()}
                Path: ${path}
                User Agent: ${userAgent}
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Session logged' }, { status: 200 });
    } catch (error) {
        console.error('Error logging session:', error);
        return NextResponse.json({ error: 'Failed to log session' }, { status: 500 });
    }
}
