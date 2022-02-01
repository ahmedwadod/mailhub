require('dotenv').config()

const express = require('express')
const app = express()
const mailer = require('nodemailer')
const { body, validationResult } = require('express-validator');

app.use(express.json())

app.get('/', (req, res) => res.send('Hello'))

let transpoerter = mailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    tls: process.env.USE_SSL ? {
        rejectUnauthorized: false
    } : null,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
})

app.post('/',
    body('from').isEmail(),
    body('subject').isLength({ min: 1 }),
    body('query').isLength({ min: 1 })
    , (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let mail = {
            from: process.env.SENDER_EMAIL,
            to: process.env.DEFAULT_RECIEVER,
            replyTo: req.body["from"],
            subject: req.body["subject"],
            html: `<h6> Sent from Mailhub by Ahmed A. Elkhalifa </h6> <p>${req.body["query"]}</p>`
        }

        transpoerter.sendMail(mail).then((info) => {
            res.status(200).send('Sent!')
        }).catch((err) => {
            res.status(500).json(err)
        })

    }
)

let port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server started at port: ${port}`))