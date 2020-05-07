const path = require('path');
const express = require('express');
const nodemailer = require("nodemailer");
const { readFileSync, writeFileSync } = require('fs');
const router = express.Router();

/* Config File */
const smtpConfigPath = path.join(__dirname, '..', 'smtp.config.json'),
      mailConfigPath = path.join(__dirname, '..', 'mail.config.json');

/* JSONで設定ファイルを読み込む */
const config = JSON.parse(readFileSync(smtpConfigPath, {encoding: "utf-8"}));


async function main(config, message) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(config);

  transporter.verify((error) => {
    if (error)
        console.error(error);
  });

  // send mail with defined transport object
  let info = await transporter.sendMail(message);

  return {
    'id': info.messageId,
    'to': message.to,
    'url': nodemailer.getTestMessageUrl(info)
  };
}

/**
 * send 
 * @version: 0.0.1
 * @desc: 
 */
router.post('/send', (req, res, next) => {
  let message = req.body.message;
  if (message) {
    main(config, message)
      .then(val => res.send(val))
      .catch(val => res.send(val));
  } else {
    res.send({"error": "There is no message in the body."});
  }
});

router.post('/send_dev', (req, res, next) => {
  let message = req.body.message;
  if (message) {
    res.send(message);
  } else {
    res.send({"error": "There is no message in the body."});
  }
});

router.get('/addresses', (req, res, next) => {
  let data = JSON.parse(readFileSync(mailConfigPath, {encoding: "utf-8"}));
  res.send(data.addresses);
});


router.post('/addresses', (req, res, next) => {
  let addresses = req.body;
  let data = {};
  try {
    data = JSON.parse(readFileSync(mailConfigPath, {encoding: "utf-8"}));
  } catch {
    res.send({status: 'error'});
  }
  data.addresses = addresses;
  writeFileSync(mailConfigPath, JSON.stringify(data, null, '\t'), {encoding: "utf-8"});

  res.send({status: 'done'});
});

router
  .get('/message', (req, res, next) => {
    let data = JSON.parse(readFileSync(mailConfigPath, {encoding: "utf-8"}));
    res.send(data.message);
  })
  .post('/message', (req, res, next) => {
    let message = req.body;
    let data = {};

    if (message === undefined || message === null) {
      res.send({status: 'error', message: 'The sent message body is empty.'}); 
    }

    try {
      data = JSON.parse(readFileSync(mailConfigPath, {encoding: "utf-8"}));
    } catch {
      res.send({status: 'error'});
    }

    data.message = message;

    writeFileSync(mailConfigPath, JSON.stringify(data, null, '\t'), {encoding: "utf-8"});

    res.send({status: 'done'});
  });

  router
  .get('/smtp_conf', (req, res, next) => {
    let data = JSON.parse(readFileSync(smtpConfigPath, {encoding: 'utf-8'}));
    res.send(data);
  })
  .post('/smtp_conf', (req, res, next) => {
    let config = req.body;

    if (config === undefined || config === null) {
      res.send({status: 'error', message: 'The sent message body is empty.'}); 
    } else {
      let transporter = nodemailer.createTransport(config);
      transporter.verify((error) => {
        if (error) {
          res.send({status: 'error', content: error});
        } else {
          writeFileSync(smtpConfigPath, JSON.stringify(config, null, '\t'), {encoding: 'utf-8'});
          res.send({status: 'done'});
        }
      });
    }

  });

module.exports = router;
