import nodemailer from 'nodemailer';

export const sendMail = (to: string, subject: string, text: string, attachments: any) => {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tnode2021@gmail.com',
            pass: `tnode-2021-dec26`
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: 'tnode2021@gmail.com',
        to,
        subject,
        text,
        attachments
    }

    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
            throw Error('Unable to send Mail');
        }
        return 'Mail Sent';
    })

}