require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const mailer = require('nodemailer')
const { body, validationResult } = require('express-validator');

var corsOptions = {
    origin: 'https://elkhalifa.dev',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))

app.use(express.json())

let transpoerter = mailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.USE_SSL == "true",
    auth: {
        user: process.env.SENDER_USER,
        pass: process.env.SENDER_PASSWORD
    }
})

app.get('/', (req, res) => {
    transpoerter.verify(function (error, success) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.send("Server is ready to take our messages");
        }
    });
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
            res.status(200).send('Sent!').end()
        }).catch((err) => {
            res.status(500).json(err)
        })

    }
)

let port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server started at port: ${port}`))
