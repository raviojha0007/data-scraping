const nodemailer = require("nodemailer");
const google = require("@googleapis/gmail");
const OAuth2 = google.auth.OAuth2;
const dotenv = require("dotenv").config();
const path = require("path");

/**
 * Method to send email with attachment
  @param {} to
  @param {} subject
  @param {} htmlMessage
  @param {} attachments
 * @returns
 */

exports.sendMailTemplate = async function (to, subject, message, path) {
  console.log("smtp")
  const oauth2Client = new OAuth2(
    process.env.clientId, // ClientID
    process.env.clientSecret, // Client Secret
    process.env.redirectURL // Redirect URL
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.refreshToken,
  });
  const accessToken = oauth2Client.getAccessToken();

  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.email,
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      refreshToken: process.env.refreshToken,
      grantType: process.env.refreshToken,
      accessToken: accessToken,
    },
    secure: true,
    tls: {
      rejectUnauthorized: true,
    },
  });

  var mailOptions = {
    from: process.env.email,
    to: to,
    subject: subject,
    html: message,
    attachments: [
      {
        filename: "data.csv",
        path: path,
      },
    ],
  };
  return smtpTransport
    .sendMail(mailOptions)
    .then((response) => {
      smtpTransport.close();
      return Promise.resolve(response);
    })
    .catch((error) => {
      smtpTransport.close();
      return Promise.reject(error);
    });
};
