const { Op } = require('sequelize');
const SessionRequest = require('../models/SessionRequest');
const CoachProfile = require('../models/CoachProfile');
const Review = require('../models/Review');
const {User} = require('../models/User');

exports.createSessionRequest = async (req, res) => {
  try {
    const { userName, userEmail, userPhone, sportName, sessionType, coachProfileId, requestedTimeSlots } = req.body;

    const coachProfile = await CoachProfile.findByPk(coachProfileId);
    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    const user = await User.findByPk(coachProfile.userId, {
      attributes: ['email'], 
    });

    if (!user) {
      return res.status(404).json({ msg: 'User associated with the coach profile not found' });
    }

    const coachEmail = user.email;

    const validTimeSlots = requestedTimeSlots.every(slot =>
      coachProfile.availableTimeSlots.some(coachSlot =>
        new Date(coachSlot.date).toDateString() === new Date(slot.date).toDateString() && coachSlot.timeSlot === slot.timeSlot
      )
    );

    if (!validTimeSlots) {
      return res.status(400).json({ msg: 'Requested time slots are not available.' });
    }

    const { individualSessionPrice, groupSessionPrice } = coachProfile.coachPrice;
    const sessionFee = sessionType === 'Individual Session' ? individualSessionPrice : groupSessionPrice;

    const newSessionRequest = await SessionRequest.create({
      userId: req.user.id,
      userName,
      userEmail,
      userPhone,
      coachProfileId,
      coachId: coachProfile.userId,
      coachName: coachProfile.coachName,
      coachEmail : coachEmail, 
      coachLevel: coachProfile.coachLevel, 
      image: coachProfile.image,
      sportName,
      sessionType,
      sessionFee,
      requestedTimeSlots,
    });

    res.json(newSessionRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.respondToSessionRequest = async (req, res) => {
  try {
    const { status, courtNo } = req.body;
    const sessionRequest = await SessionRequest.findByPk(req.params.id);

    if (!sessionRequest) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    sessionRequest.status = status;
    sessionRequest.updatedAt = new Date();

    if (status === 'Accepted' && courtNo) {
      sessionRequest.courtNo = courtNo;
    }

    await sessionRequest.save();
    res.json(sessionRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUserSessionRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ msg: 'Access denied. You can only view your own session requests.' });
    }

    const sessionRequests = await SessionRequest.findAll({
      where: { userId },
      attributes: [
        'sessionRequestId',
        'userId',
        'userName',
        'userEmail',
        'userPhone',
        'sportName',
        'sessionType',
        'sessionFee',
        'coachProfileId',
        'coachName',
        'coachEmail',
        'coachLevel',
        'image',
        'requestedTimeSlots',
        'courtNo',
        'status',
        'createdAt',
        'updatedAt'
      ],
    });

    const response = await Promise.all(sessionRequests.map(async request => {
      const reviews = await Review.findAll({
        where: { coachProfileId: request.coachProfileId },
      });

      const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(2)
        : 'No reviews yet';

      return {
        id: request.sessionRequestId,
        userId: request.userId,
        userName: request.userName,
        userEmail: request.userEmail,
        userPhone: request.userPhone,
        sportName: request.sportName,
        sessionType: request.sessionType,
        sessionFee: request.sessionFee,
        coachProfileId: request.coachProfileId,
        coachName: request.coachName,
        coachEmail: request.coachEmail,
        coachLevel: request.coachLevel,
        coachImage: request.image,
        requestedTimeSlots: request.requestedTimeSlots,
        courtNo: request.courtNo,
        avgRating,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      };
    }));

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getCoachSessionRequests = async (req, res) => {
  try {
    if (req.user.role !== 'Coach') {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const sessionRequests = await SessionRequest.findAll({
      where: { coachId: req.user.id },
    });

    res.json(sessionRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getSessionRequestById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const sessionRequest = await SessionRequest.findByPk(sessionId);

    if (!sessionRequest) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    const tokenUserId = req.user.id;
    const requestUserId = sessionRequest.userId;
    const requestCoachId = sessionRequest.coachId;

    if (tokenUserId !== requestUserId && tokenUserId !== requestCoachId) {
      return res.status(403).json({ msg: 'Access denied. You can only view your own session requests.' });
    }

    const response = {
      id: sessionRequest.sessionRequestId,
      userId: sessionRequest.userId,
      userName: sessionRequest.userName,
      userEmail: sessionRequest.userEmail,
      userPhone: sessionRequest.userPhone,
      sportName: sessionRequest.sportName,
      sessionType: sessionRequest.sessionType,
      coachProfileId: sessionRequest.coachProfileId,
      coachName: sessionRequest.coachName, 
      coachLevel: sessionRequest.coachLevel,
      image: sessionRequest.image,
      requestedTimeSlots: sessionRequest.requestedTimeSlots,
      status: sessionRequest.status,
      createdAt: sessionRequest.createdAt,
      updatedAt: sessionRequest.updatedAt,
    };

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



const fs = require('fs');

const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinaryConfig');
const multerCloudinary = require('multer');
const sendSessionBookingConfirmationEmail = require('../utils/sendSessionBookingConfirmationEmail');
const SessionBooking = require('../models/SessionBooking');

const uploadReceipt = multerCloudinary({ storage: multerCloudinary.memoryStorage() });

const uploadQRCode = multerCloudinary({ storage: multerCloudinary.memoryStorage() });

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


exports.bookSession = async (req, res) => {
  try {
    const { sessionRequestId } = req.body;

    const sessionRequest = await SessionRequest.findByPk(sessionRequestId);

    if (!sessionRequest) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    if (sessionRequest.status !== 'Accepted') {
      return res.status(400).json({ msg: 'Session request has not been accepted yet' });
    }

    if (!sessionRequest.receipt) {
      return res.status(400).json({ msg: 'Receipt is required before booking a session' });
    }

    const newBooking = await SessionBooking.create({
      sessionRequestId: sessionRequest.sessionRequestId,
      userId: sessionRequest.userId,
      userName: sessionRequest.userName,
      userEmail: sessionRequest.userEmail, 
      userPhone: sessionRequest.userPhone,
      coachId: sessionRequest.coachId,
      coachName: sessionRequest.coachName, 
      coachEmail: sessionRequest.coachEmail, 
      coachLevel: sessionRequest.coachLevel, 
      sportName: sessionRequest.sportName,
      sessionType: sessionRequest.sessionType,
      bookedTimeSlots: sessionRequest.requestedTimeSlots,
      sessionFee: sessionRequest.sessionFee,
      courtNo: sessionRequest.courtNo,
      receipt: sessionRequest.receipt,
    });

    const qrData = `Booking ID: ${newBooking.id}\nUser: ${newBooking.userName}\nSport: ${newBooking.sportName}\nSession Type: ${newBooking.sessionType}\nCoach: ${newBooking.coachName}\nFee: Rs. ${newBooking.sessionFee}\nDate & Time: ${newBooking.bookedTimeSlots.map(slot => `${slot.date} ${slot.timeSlot}`).join(', ')}`;

    const qrCodeBuffer = await QRCode.toBuffer(qrData);
    const qrCodeResult = await uploadToCloudinary(qrCodeBuffer, 'session_qrcodes');
    const qrCodeUrl = qrCodeResult.secure_url;

    newBooking.qrCodeUrl = qrCodeUrl;
    await newBooking.save();

    await sendSessionBookingConfirmationEmail(newBooking.userEmail, newBooking);

    const response = {
      sessionRequestId: newBooking.sessionRequestId,
      userId: newBooking.userId,
      userName: newBooking.userName,
      userEmail: newBooking.userEmail,
      userPhone: newBooking.userPhone,
      sportName: newBooking.sportName,
      sessionType: newBooking.sessionType,
      coachId: newBooking.coachId,
      coachName: newBooking.coachName,
      coachEmail: newBooking.coachEmail,
      coachLevel: newBooking.coachLevel,
      sessionFee: newBooking.sessionFee,
      courtNo: newBooking.courtNo,
      receipt: newBooking.receipt,
      qrCodeUrl: newBooking.qrCodeUrl,
      _id: newBooking.id,
      createdAt: newBooking.createdAt,
      updatedAt: newBooking.updatedAt,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



exports.uploadReceipt = (req, res) => {
  uploadReceipt.single('receipt')(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ msg: err });
      }

      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      const sessionRequest = await SessionRequest.findByPk(req.params.id);

      if (!sessionRequest) {
        return res.status(404).json({ msg: 'Session request not found' });
      }

      const receiptResult = await uploadToCloudinary(req.file.buffer, 'session_receipts');
      const receiptUrl = receiptResult.secure_url;

      await sessionRequest.update({ receipt: receiptUrl });

      res.json(sessionRequest);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
};


// Get User's Booking History
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await SessionBooking.findAll({
      where: { userId },
    });

    if (!bookings.length) {
      return res.status(404).json({ msg: 'No booking history found for this user.' });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Coach's Booking History
exports.getCoachBookings = async (req, res) => {
  try {
    const { coachId } = req.params;

    const bookings = await SessionBooking.findAll({
      where: { coachId },
    });

    if (!bookings.length) {
      return res.status(404).json({ msg: 'No booking history found for this coach.' });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Session Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await SessionBooking.findAll();

    if (!bookings.length) {
      return res.status(404).json({ msg: 'No bookings found.' });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/receipts',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('receipt');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs Only!');
  }
}


exports.getQrCodeById = async (req, res) => {
  try {
    const booking = await SessionBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json({
      qrCodeUrl: booking.qrCodeUrl
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



// /**
//  * Get future session bookings by user ID.
//  * @route GET /api/session-booking/user/:userId/future
//  * @access Private
//  */
// exports.getFutureSessionBookingsByUserId = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     // Get the current date and time
//     const currentDate = new Date();

//     // Fetch future session bookings for the user
//     const futureBookings = await SessionBooking.findAll({
//       where: {
//         userId,
//         bookedTimeSlots: {
//           [Sequelize.Op.contains]: [{ date: { [Sequelize.Op.gt]: currentDate.toISOString().split('T')[0] } }],
//         },
//       },
//     });

//     if (!futureBookings || futureBookings.length === 0) {
//       return res.status(404).json({ msg: 'No future session bookings found for this user.' });
//     }

//     res.json(futureBookings);
//   } catch (err) {
//     console.error('Error fetching future session bookings by user ID:', err.message);
//     res.status(500).json({ msg: 'Server error' });
//   }
// };


const { Sequelize } = require('sequelize'); // Import Sequelize and Op
//const { SessionBooking } = require('../models'); // Adjust path as needed

/**
 * Get future session bookings by user ID.
 * @route GET /api/session-booking/user/:userId/future
 * @access Private
 */
exports.getFutureSessionBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch future session bookings for the user
    const futureBookings = await SessionBooking.findAll({
      where: {
        userId,
        [Sequelize.Op.and]: Sequelize.literal(`
          JSON_UNQUOTE(JSON_EXTRACT(bookedTimeSlots, '$[0].date')) > '${currentDate}'
        `),
      },
    });

    if (!futureBookings || futureBookings.length === 0) {
      return res.status(404).json({ msg: 'No future session bookings found for this user.' });
    }

    res.json(futureBookings);
  } catch (err) {
    console.error('Error fetching future session bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};



/**
 * Delete all future session bookings by user ID.
 * @route DELETE /api/session-booking/user/:userId/future
 * @access Private
 */
exports.deleteFutureSessionBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Delete all future session bookings for the user
    const deletedBookings = await SessionBooking.destroy({
      where: {
        userId,
        [Sequelize.Op.and]: Sequelize.literal(`
          JSON_UNQUOTE(JSON_EXTRACT(bookedTimeSlots, '$[0].date')) > '${currentDate}'
        `),
      },
    });

    if (deletedBookings === 0) {
      return res.status(404).json({ msg: 'No future session bookings found for this user to delete.' });
    }

    res.json({ msg: `${deletedBookings} future session booking(s) deleted successfully.` });
  } catch (err) {
    console.error('Error deleting future session bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
