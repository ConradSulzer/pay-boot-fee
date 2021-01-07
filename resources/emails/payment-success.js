const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendReceiptUser = (session) => {
  const data = {
    bootFee: session.fee,
    bootDeposit: session.deposit,
    bootTotal: session.total,
    adminEmail: process.env.ADMIN_EMAIL,
    unlock: session.boot.unlock,
    transactionId: session.charge.id,
    subject: 'PayMyBootFee.com Receipt'
  }

  try {
    sgMail.send({
      to: session.email,
      from: process.env.ADMIN_EMAIL,
      templateId: 'd-8c8b6c5eb05c4a5c91ce3db4aa920929',
      dynamic_template_data: data
    });
  }catch (err) {
    console.log(err);
  }
}

const sendPaymentRecord = (session) => {
  const data = {
    transactionId: session.charge.id,
    amount: session.total,
    name: session.charge.billing_details.name,
    addressLine1: session.charge.billing_details.address.line1,
    addressLine2: session.charge.billing_details.address.line2,
    city: session.charge.billing_details.address.city,
    state: session.charge.billing_details.address.state ,
    zip: session.charge.billing_details.address.postal_code,
    time: session.paidTime.toUTCString(),
    bootId: session.boot.bootId,
    unlock: session.boot.unlock,
    agent: session.boot.agent,
    location: session.boot.location,
    make: session.boot.make,
    model: session.boot.model,
    plate: session.boot.plate,
    reason: session.boot.reason,
    notes: session.boot.notes,
    subject: `Payment: Boot ID ${session.boot.bootId}`
  }

  if(session.boot.notes.length > 0) {
    session.boot.notes.forEach((note, index) => { 
      data[`note${index + 1}`] = note
    })
  }

  try {
    sgMail.send({
      to: process.env.ADMIN_EMAIL,
      from: process.env.ADMIN_EMAIL,
      templateId: 'd-68fa1a4c7ae04f38b344885c35154511',
      dynamic_template_data: data
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  sendReceiptUser,
  sendPaymentRecord
}