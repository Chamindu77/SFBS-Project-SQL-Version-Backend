const nodemailer = require('nodemailer');

/**
 * Sends a registration confirmation email to the user.
 * @param {string} userEmail - The email address of the registered user.
 * @param {string} userName - The name of the registered user.
 */
const sendUserRegistrationEmail = async (userEmail, userName) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chamindunipun77@gmail.com',  // Change this to environment variables in production
      pass: 'oeyj kfpf vynd pjgk',        // Use environment variables for sensitive data
    },
  });

  const mailOptions = {
    from: 'chamindunipun77@gmail.com',
    to: userEmail,
    subject: 'Registration Successful - Welcome to Dream Sports',
    html: `
      <h1>Welcome, ${userName}!</h1>
      <p>Thank you for registering at Dream Sports. Your account has been created successfully.</p>
      <p>You can now book facilities, manage your bookings, and enjoy our services.</p>
      <p><a href="https://www.dreamsports.com/login">Login to your account</a></p>
      <p>Best regards,<br>Dream Sports Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendUserRegistrationEmail;
