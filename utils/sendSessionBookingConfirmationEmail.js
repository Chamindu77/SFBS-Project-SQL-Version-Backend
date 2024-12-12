const nodemailer = require('nodemailer');

const sendSessionBookingConfirmationEmail = async (userEmail, bookingDetails) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'chamindunipun77@gmail.com',
      pass: 'oeyj kfpf vynd pjgk',
    },
  });

  // Format the date to DD/MM/YYYY and include the time slot
  const formattedTimeSlots = bookingDetails.bookedTimeSlots.map(slot => {
    const date = new Date(slot.date);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    return `${formattedDate} ${slot.timeSlot}`;
  }).join(', ');

  const mailOptions = {
    from: 'chamindunipun77@gmail.com',
    to: userEmail,
    subject: 'Session Booking Confirmation',
    html: `
      <h1>Session Booking Confirmation</h1>
      <p>Dear ${bookingDetails.userName},</p>
      <p>Thank you for booking a session. Here are your booking details:</p>
      <ul>
        <li>Booking ID: ${bookingDetails._id}</li>
        <li>Sport Name: ${bookingDetails.sportName}</li>
        <li>Session Type: ${bookingDetails.sessionType}</li>
        <li>Coach Name: ${bookingDetails.coachName}</li>
        <li>Session Fee: Rs. ${bookingDetails.sessionFee}/=</li>
        <li>Court No: ${bookingDetails.courtNo}</li>
        <li>Booked Time Slot: ${formattedTimeSlots}</li>
        
      </ul>
      <p>Attached is your QR code for the session.</p>
      <p>Best regards,<br>Dream Sports Team</p>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        path: bookingDetails.qrCodeUrl,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendSessionBookingConfirmationEmail;
