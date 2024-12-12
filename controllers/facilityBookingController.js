const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');
const QRCode = require('qrcode');
const FacilityBooking = require('../models/FacilityBooking');
const Facility = require('../models/Facility');
const sendFacilityBookingConfirmationEmail = require('../utils/facilityEmailService');
const User = require('../models/User');
const fs = require('fs');
const { Sequelize } = require('sequelize');
//const twilio = require('twilio');


// Define allowed time slots
const ALL_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00",
];

// Multer upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary upload function
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    }).end(buffer);
  });
};

const twilio = require('twilio');
const { AccountSid, AuthToken } = process.env; // Ensure these values are set in your .env file

// Initialize Twilio client
const client = new twilio(AccountSid, AuthToken);

// CREATE FACILITY BOOKING
exports.createFacilityBooking = [
  upload.single('receipt'),
  async (req, res) => {
    const { userId, userName, userEmail, userPhoneNumber, sportName, courtNumber, courtPrice, date, timeSlots } = req.body;

    try {
      console.log(req.body);

      if (!req.file) {
        return res.status(400).json({ msg: 'Receipt is required for booking' });
      }

      const receiptResult = await uploadToCloudinary(req.file.buffer, 'facility_receipts');
      const receiptUrl = receiptResult.secure_url;

      let slotsArray = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
      if (!Array.isArray(slotsArray)) {
        return res.status(400).json({ msg: 'Invalid timeSlots format. Must be an array.' });
      }

      const invalidSlots = slotsArray.filter(slot => !ALL_SLOTS.includes(slot));
      if (invalidSlots.length > 0) {
        return res.status(400).json({ msg: 'Invalid time slots', invalidSlots });
      }

      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        return res.status(400).json({ msg: 'Booking date cannot be in the past' });
      }

      // Check for existing bookings
      const existingBookings = await FacilityBooking.findAll({
        where: {
          courtNumber,
          date: bookingDate,
          sportName,
          timeSlots: { [Op.overlap]: slotsArray }, 
        },
      });

      if (existingBookings.length > 0) {
        const unavailableSlots = existingBookings
          .flatMap(booking => booking.timeSlots)
          .filter(slot => slotsArray.includes(slot));
        return res.status(400).json({ msg: 'Some time slots are already booked', unavailableSlots });
      }

      const totalHours = slotsArray.length;
      const totalPrice = courtPrice * totalHours;

      const facilityBooking = await FacilityBooking.create({
        userId,
        userName,
        userEmail,
        userPhoneNumber,
        sportName,
        courtNumber,
        courtPrice,
        date: bookingDate,
        timeSlots: slotsArray,
        totalHours,
        totalPrice,
        receipt: receiptUrl,
      });

      const qrCodeData = {
        bookingId: facilityBooking.bookingId,
        userName: facilityBooking.userName,
        userEmail: facilityBooking.userEmail,
        userPhoneNumber: facilityBooking.userPhoneNumber,
        sportName: facilityBooking.sportName,
        courtNumber: facilityBooking.courtNumber,
        date: facilityBooking.date,
        timeSlots: facilityBooking.timeSlots,
        totalHours: facilityBooking.totalHours,
        totalPrice: facilityBooking.totalPrice,
        receipt: facilityBooking.receipt,
      };
      
      // Format the data into a user-friendly string
      const formattedData = `
        Booking Confirmation:
      
        Name: ${qrCodeData.userName}
        Sport: ${qrCodeData.sportName}
        Court Number: ${qrCodeData.courtNumber}
        Date: ${new Date(qrCodeData.date).toLocaleDateString()}
        Time Slots: ${qrCodeData.timeSlots.join(', ')}
        Total Hours: ${qrCodeData.totalHours} hour(s)
        Total Price: $${qrCodeData.totalPrice}
        Booking ID: ${qrCodeData.bookingId}
      `;
      
      const qrCodeBuffer = await QRCode.toBuffer(formattedData);
      

      // Upload the QR code image to Cloudinary
      const qrCodeResult = await uploadToCloudinary(qrCodeBuffer, 'facility_qrcodes');
      facilityBooking.qrCode = qrCodeResult.secure_url;

      await facilityBooking.save();

      // Send Confirmation Email
      await sendFacilityBookingConfirmationEmail(userEmail, {
        bookingId: facilityBooking.bookingId,
        userName,
        sportName,
        courtNumber,
        date: facilityBooking.date,
        timeSlots: slotsArray,
        totalHours,
        totalPrice,
        receipt: facilityBooking.receipt,
        qrCode: facilityBooking.qrCode,
      });

      // Send WhatsApp Confirmation Message
      const messageBody = `
        Your booking for the ${sportName} court is confirmed!
        Court: ${courtNumber}
        Date: ${new Date(date).toLocaleDateString()}
        Time: ${slotsArray.join(', ')}
        Total Hours: ${totalHours}
        Total Price: $${totalPrice}
        QR Code: ${facilityBooking.qrCode}
      `;

      const formattedPhoneNumber = `+94${userPhoneNumber.slice(1)}`;
      // Send WhatsApp message via Twilio
      await client.messages.create({
        body: messageBody,
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        to: `whatsapp:${formattedPhoneNumber}`, // User's WhatsApp number
      });

      res.status(201).json({
        msg: 'Booking created successfully, and confirmation email and WhatsApp message sent',
        facilityBooking,
      });
    } catch (err) {
      console.error('Error creating facility booking:', err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  },
];



// GET AVAILABLE TIME SLOTS
exports.getAvailableTimeSlots = async (req, res) => {
  const { courtNumber, date, sportName } = req.body;

  try {
    const bookings = await FacilityBooking.findAll({
      where: {
        courtNumber,
        sportName,
        date: new Date(date),
      },
    });

    const bookedSlots = bookings.flatMap(booking => booking.timeSlots);
    const availableSlots = ALL_SLOTS.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
  } catch (err) {
    console.error('Error fetching available time slots:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


/**
 * Get all facility bookings.
 * @route GET /api/facility-booking
 * @access Private (Admin only)
 */
exports.getAllFacilityBookings = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    // Fetch all facility bookings
    const facilityBookings = await FacilityBooking.findAll();

    if (!facilityBookings || facilityBookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found.' });
    }

    // Map bookings into the desired structure
    const bookingsWithDetails = facilityBookings.map((booking) => ({
      bookingId: booking.bookingId,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt,
      qrCode: booking.qrCode,
    }));

    res.json(bookingsWithDetails);
  } catch (err) {
    console.error('Error fetching facility bookings:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


/**
 * Get a specific facility booking by ID.
 * @route GET /api/facility-booking/:id
 * @access Private
 */
exports.getFacilityBookingById = async (req, res) => {
  try {
    // Fetch the booking by ID
    const booking = await FacilityBooking.findOne({
      where: { bookingId: req.params.id },
    });

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found.' });
    }

    // Prepare the booking details
    const bookingDetails = {
      bookingId: booking.bookingId,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt,
      qrCode: booking.qrCode,
    };

    res.json(bookingDetails);
  } catch (err) {
    console.error('Error fetching booking by ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};




/**
 * Get facility bookings by user ID with receipt URLs.
 * @route GET /api/facility-booking/user/:userId
 * @access Private
 */
exports.getFacilityBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch facility bookings by user ID
    const facilityBookings = await FacilityBooking.findAll({
      where: { userId }, 
    });

    if (!facilityBookings || facilityBookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found for this user.' });
    }

    // Map the bookings data
    const bookingsWithDetails = facilityBookings.map((booking) => ({
      bookingId: booking.bookingId,
      userId: booking.userId,
      userName: booking.userName, 
      userEmail: booking.userEmail, 
      userPhoneNumber: booking.userPhoneNumber, 
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt,
      qrCode: booking.qrCode,
    }));

    res.json(bookingsWithDetails);
  } catch (err) {
    console.error('Error fetching bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};



/**
 * Serve the QR code as a downloadable PNG file.
 * @route GET /api/facility-booking/:id/download-qr
 * @access Private
 */
exports.downloadQrCode = async (req, res) => {
  try {
    const booking = await FacilityBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (!booking.qrCode || !fs.existsSync(booking.qrCode)) {
      return res.status(404).json({ msg: 'QR code not found' });
    }

    res.download(booking.qrCode, `Booking-${booking._id}-QRCode.png`, (err) => {
      if (err) {
        console.error('Error downloading QR code:', err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    });
  } catch (err) {
    console.error('Error downloading QR code:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


// exports.getAvailableFacilities = async (req, res) => {
//   const { sportName, date, timeSlot } = req.body;

//   try {
//     if (!sportName || !date || !timeSlot) {
//       return res.status(400).json({ msg: 'Please provide sport name, date, and time slot' });
//     }

//     const startOfDay = new Date(date);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     const endOfDay = new Date(date);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     const bookings = await FacilityBooking.find({
//       sportName,
//       date: { $gte: startOfDay, $lte: endOfDay },
//       timeSlots: timeSlot, 
//     });

//     const bookedCourts = bookings.map(booking => booking.courtNumber);

//     const availableFacilities = await Facility.find({
//       sportName,
//       courtNumber: { $nin: bookedCourts }  
//     });

//     if (availableFacilities.length === 0) {
//       return res.status(404).json({ msg: 'No available facilities for the selected time slot' });
//     }

//     res.json({ availableFacilities });
//   } catch (err) {
//     console.error('Error fetching available facilities:', err.message);
//     res.status(500).json({ msg: 'Server error' });
//   }
// };

exports.getAvailableFacilities = async (req, res) => {
  const { sportName, date, timeSlot } = req.body;

  try {
    if (!sportName || !date || !timeSlot) {
      return res.status(400).json({ msg: 'Please provide sport name, date, and time slot' });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Fetch bookings for the given date and time slot
    const bookings = await FacilityBooking.findAll({
      where: {
        sportName,
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      // Use a raw query to filter JSON column with Sequelize.literal
      having: Sequelize.literal(`JSON_CONTAINS(timeSlots, '"${timeSlot}"')`),
    });

    // Extract booked court numbers
    const bookedCourts = bookings.map(booking => booking.courtNumber);

    // Fetch available facilities excluding booked courts
    const availableFacilities = await Facility.findAll({
      where: {
        sportName,
        courtNumber: {
          [Op.notIn]: bookedCourts, // Exclude already booked courts
        },
      },
    });

    if (availableFacilities.length === 0) {
      return res.status(404).json({ msg: 'No available facilities for the selected time slot' });
    }

    res.json({ availableFacilities });
  } catch (err) {
    console.error('Error fetching available facilities:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};



/**
 * Get future facility bookings by user ID.
 * @route GET /api/facility-booking/user/:userId/future
 * @access Private
 */
exports.getFutureFacilityBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current date and time
    const currentDate = new Date();

    // Fetch future facility bookings for the user (date > current date)
    const futureBookings = await FacilityBooking.findAll({
      where: {
        userId,
        date: { // Ensure booking date is in the future
          [Sequelize.Op.gt]: currentDate,
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
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt,
      qrCode: booking.qrCode,
    }));

    res.json(bookingsWithDetails);
  } catch (err) {
    console.error('Error fetching future bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};



/**
 * Delete all future facility bookings by user ID.
 * @route DELETE /api/facility-booking/user/:userId/future
 * @access Private
 */
exports.deleteFutureFacilityBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current date
    const currentDate = new Date();

    // Delete all future bookings for the user (date > current date)
    const deletedBookings = await FacilityBooking.destroy({
      where: {
        userId,
        date: {
          [Sequelize.Op.gt]: currentDate, // Only delete bookings where date is in the future
        },
      },
    });

    if (deletedBookings === 0) {
      return res.status(404).json({ msg: 'No future bookings found for this user to delete.' });
    }

    res.json({ msg: `${deletedBookings} future bookings deleted successfully.` });
  } catch (err) {
    console.error('Error deleting future bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};