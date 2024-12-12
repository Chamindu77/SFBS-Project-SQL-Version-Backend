const nodemailer = require('nodemailer');

const sendEquipmentBookingConfirmationEmail = async (userEmail, bookingDetails) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'chamindunipun77@gmail.com',
      pass: 'oeyj kfpf vynd pjgk',
    },
  });

  const formattedDate = new Date(bookingDetails.dateTime).toLocaleDateString();

  const mailOptions = {
    from: 'chamindunipun77@gmail.com',
    to: userEmail,
    subject: 'Equipment Booking Confirmation',
    html: `
      <h1>Equipment Booking Confirmation</h1>
      <p>Dear ${bookingDetails.userName},</p>
      <p>Thank you for your equipment booking. Here are your booking details:</p>
      <ul>
        <li>Booking ID: ${bookingDetails.bookingId}</li>
        <li>Sport Name: ${bookingDetails.sportName}</li>
        <li>Equipment Name: ${bookingDetails.equipmentName}</li>
        <li>Equipment Price: Rs. ${bookingDetails.equipmentPrice}/=</li>
        <li>Quantity: ${bookingDetails.quantity}</li>
        <li>Date: ${formattedDate}</li>
        <li>Total Payment: Rs. ${bookingDetails.totalPrice}/=</li>
      </ul>
      <p>Attached is your QR code for the booking.</p>
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

module.exports = sendEquipmentBookingConfirmationEmail;
