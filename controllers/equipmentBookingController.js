const EquipmentBooking = require('../models/EquipmentBooking');
const QRCode = require('qrcode');
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const sendEquipmentBookingConfirmationEmail = require('../utils/equipmentEmailService');
const { Op } = require('sequelize');

const upload = multer({ storage: multer.memoryStorage() });

const twilio = require('twilio');
const { AccountSid, AuthToken } = process.env; // Ensure these are set in .env file

const client = new twilio(AccountSid, AuthToken);


const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto', folder }, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    }).end(buffer);
  });
};

/**
 * Create a new equipment booking with receipt and QR code, and send confirmation email.
 * @route POST /api/equipment-booking
 * @access Private
 */
exports.createEquipmentBooking = [
  upload.single('receipt'),
  async (req, res) => {
    const { userName, userEmail, equipmentName, equipmentPrice, quantity, sportName, dateTime, userPhoneNumber } = req.body;

    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'Receipt is required for booking' });
      }

      const bookingDateTime = new Date(dateTime);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (bookingDateTime < now) {
        return res.status(400).json({ msg: 'Booking date and time cannot be in the past' });
      }

      const totalPrice = equipmentPrice * quantity;

      const receiptResult = await uploadToCloudinary(req.file.buffer, 'equipment_receipts');
      const receiptUrl = receiptResult.secure_url;

      const equipmentBooking = await EquipmentBooking.create({
        userId: req.user.id,
        userName,
        userEmail,
        equipmentName,
        equipmentPrice,
        quantity,
        sportName,
        dateTime: bookingDateTime,
        userPhoneNumber,
        totalPrice,
        receipt: receiptUrl,
      });

      const formattedData = `
  Equipment Booking Confirmation:

  Name: ${equipmentBooking.userName}
  Sport: ${sportName}
  Equipment: ${equipmentBooking.equipmentName}
  Quantity: ${equipmentBooking.quantity}
  Price Per Unit: Rs.${equipmentPrice}/=
  Total Price: Rs.${totalPrice}/=
  Booking Date: ${new Date(equipmentBooking.dateTime).toLocaleDateString()}
  Booking ID: ${equipmentBooking.bookingId}
`;

      // Generate the QR code buffer
      const qrCodeBuffer = await QRCode.toBuffer(formattedData);

      // Upload the QR code image to Cloudinary
      const qrCodeResult = await uploadToCloudinary(qrCodeBuffer, 'equipment_qrcodes');
      const qrCodeUrl = qrCodeResult.secure_url;

      equipmentBooking.qrCode = qrCodeUrl;
      await equipmentBooking.save();

      // Send Confirmation Email
      await sendEquipmentBookingConfirmationEmail(userEmail, {
        bookingId: equipmentBooking.bookingId,
        userName,
        sportName,
        equipmentName,
        equipmentPrice,
        quantity,
        dateTime,
        totalPrice,
        receipt: equipmentBooking.receipt,
        qrCode: equipmentBooking.qrCode,
      });

      // Send WhatsApp Confirmation Message
      const messageBody = `
        Your equipment booking is confirmed!
        Name: ${userName}
        Sport: ${sportName}
        Equipment: ${equipmentName}
        Quantity: ${quantity}
        Price Per Unit: Rs.${equipmentPrice}/=
        Total Price: Rs.${totalPrice}/=
        Booking Date: ${new Date(equipmentBooking.dateTime).toLocaleDateString()}
        QR Code: ${qrCodeUrl}
      `;

      const formattedPhoneNumber = `+94${userPhoneNumber.slice(1)}`; // Format Sri Lankan numbers

      await client.messages.create({
        body: messageBody,
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        to: `whatsapp:${formattedPhoneNumber}`, // User's WhatsApp number
      });

      res.status(201).json({
        msg: 'Booking created successfully, and confirmation email and WhatsApp message sent',
        equipmentBooking,
      });
    } catch (err) {
      console.error('Error creating equipment booking:', err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  },
];


/**
 * Get all equipment bookings (admin only)
 */
exports.getAllEquipmentBookings = async (req, res) => {
  try {
    const bookings = await EquipmentBooking.findAll();

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching all equipment bookings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get all equipment bookings for a specific user
 */
exports.getUserEquipmentBookings = async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await EquipmentBooking.findAll({
      where: { userId },
    });

    if (!bookings.length) {
      return res.status(404).json({ msg: 'No bookings found for this user' });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user equipment bookings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Get a specific equipment booking by ID
 */
exports.getEquipmentBookingById = async (req, res) => {
  try {
    const booking = await EquipmentBooking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching equipment booking by ID:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Serve the QR code as a downloadable PNG file.
 * @route GET /api/equipment-booking/:id/download-qr
 * @access Private
 */
exports.downloadEquipmentQrCode = async (req, res) => {
  try {
    const booking = await EquipmentBooking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (!booking.qrCode) {
      return res.status(404).json({ msg: 'QR code not found' });
    }

    res.redirect(booking.qrCode);
  } catch (err) {
    console.error('Error downloading QR code:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};



//const EquipmentBooking = require('../models/EquipmentBooking');
//const { Op } = require('sequelize');

/**
 * Get future equipment bookings by user ID.
 * @route GET /api/equipment-booking/user/:userId/future
 * @access Private
 */
exports.getFutureEquipmentBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current date and time
    const currentDate = new Date();

    // Fetch future equipment bookings for the user (dateTime > current date)
    const futureBookings = await EquipmentBooking.findAll({
      where: {
        userId,
        dateTime: { // Ensure booking date and time is in the future
          [Op.gt]: currentDate,
        },
      },
    });

    if (!futureBookings || futureBookings.length === 0) {
      return res.status(404).json({ msg: 'No future bookings found for this user.' });
    }

    // Map the future bookings data
    const bookingsWithDetails = futureBookings.map((booking) => ({
      bookingId: booking.bookingId,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhoneNumber: booking.userPhoneNumber,
      equipmentName: booking.equipmentName,
      sportName: booking.sportName,
      equipmentPrice: booking.equipmentPrice,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
      dateTime: booking.dateTime,
      createdAt: booking.createdAt,
      receipt: booking.receipt,
      qrCode: booking.qrCode,
    }));

    res.json(bookingsWithDetails);
  } catch (err) {
    console.error('Error fetching future equipment bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Delete all future equipment bookings by user ID.
 * @route DELETE /api/equipment-booking/user/:userId/future
 * @access Private
 */
exports.deleteFutureEquipmentBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current date and time
    const currentDate = new Date();

    // Delete all future equipment bookings for the user (dateTime > current date)
    const deletedBookings = await EquipmentBooking.destroy({
      where: {
        userId,
        dateTime: {
          [Op.gt]: currentDate, // Only delete bookings where dateTime is in the future
        },
      },
    });

    if (deletedBookings === 0) {
      return res.status(404).json({ msg: 'No future bookings found for this user to delete.' });
    }

    res.json({ msg: `${deletedBookings} future bookings deleted successfully.` });
  } catch (err) {
    console.error('Error deleting future equipment bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
