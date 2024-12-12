const nodemailer = require('nodemailer');

const sendFacilityBookingConfirmationEmail = async (userEmail, bookingDetails) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'chamindunipun77@gmail.com',
      pass: 'oeyj kfpf vynd pjgk',
    },
  });

  const formattedDate = new Date(bookingDetails.date).toLocaleDateString();

  const mailOptions = {
    from: 'chamindunipun77@gmail.com',
    to: userEmail,
    subject: 'Facility Booking Confirmation',
    html: `
      <h1>Facility Booking Confirmation</h1>
      <p>Dear ${bookingDetails.userName},</p>
      <p>Thank you for your booking. Here are your booking details:</p>
      <ul>
        <li>Booking ID: ${bookingDetails.bookingId}</li>
        <li>Sport Name: ${bookingDetails.sportName}</li>
        <li>Court Number: ${bookingDetails.courtNumber}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time Slots: ${bookingDetails.timeSlots.join(', ')}</li>
        <li>Total Hours: ${bookingDetails.totalHours}</li>
        <li>Total Payment: Rs. ${bookingDetails.totalPrice}/=</li>
      </ul>
      <p>Attached is QR code for the booking.</p>
      <p>Best regards,<br>Dream Sports Team</p>
    `,
    attachments: [
      // {
      //   filename: 'receipt.png',
      //   path: bookingDetails.receipt,
      // },
      {
        filename: 'qrcode.png',
        path: bookingDetails.qrCode,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendFacilityBookingConfirmationEmail;


