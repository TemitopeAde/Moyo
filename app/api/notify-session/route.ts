
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { userAgent, timestamp, path } = await req.json();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('[notify-session] Missing EMAIL_USER or EMAIL_PASS env vars');
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
    }

    if (!timestamp || !path) {
      console.warn('[notify-session] Invalid payload', { timestamp, path, userAgent });
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

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

    console.log('[notify-session] sending mail', { to: mailOptions.to, subject: mailOptions.subject, path });
    const info = await transporter.sendMail(mailOptions);
    console.log('[notify-session] mail sent', { messageId: info.messageId, response: info.response });

    return NextResponse.json({ message: 'Session logged' }, { status: 200 });
  } catch (error) {
    console.error('[notify-session] Error logging session:', error);
    return NextResponse.json({ error: 'Failed to log session' }, { status: 500 });
  }
}
