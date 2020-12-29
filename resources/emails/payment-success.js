const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendReceiptUser = (boot, session) => {
  sgMail.send({
    to: session.email,
    from: process.env.ADMIN_EMAIL,
    subject: 'PayMyBootFee.com Receipt',
    text:``
  })
}

const sendPaymentDetails = (boot, session) => {
  to: process.env.ADMIN_EMAIL,
  from: process.env.ADMIN_EMAIL,
  subject: `Boot ${boot.bootID}: Payment Received`
  text: ``
}

module.exports = {
  sendReceiptUser,
  sendPaymentDetails
}
