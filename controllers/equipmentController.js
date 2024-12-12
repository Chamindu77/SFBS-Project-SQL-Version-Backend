const Equipment = require('../models/Equipment');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

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

/**
 * Create a new piece of equipment.
 */
exports.createEquipment = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { equipmentName, sportName, rentPrice } = req.body;

      if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an image.' });
      }

      const imageResult = await uploadToCloudinary(req.file.buffer, 'equipment_images');
      const imageUrl = imageResult.secure_url;

      const equipment = await Equipment.create({
        equipmentName,
        sportName,
        rentPrice,
        image: imageUrl
      });

      res.status(201).json(equipment);
    } catch (err) {
      console.error('Server error while creating equipment:', err.message);
      res.status(500).json({ msg: 'Server error while creating equipment.' });
    }
  }
];

/**
 * Update an existing piece of equipment.
 */
exports.updateEquipment = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { equipmentName, sportName, rentPrice } = req.body;

      const equipment = await Equipment.findByPk(req.params.id);

      if (!equipment) {
        return res.status(404).json({ msg: 'Equipment not found.' });
      }

      equipment.equipmentName = equipmentName || equipment.equipmentName;
      equipment.sportName = sportName || equipment.sportName;
      equipment.rentPrice = rentPrice || equipment.rentPrice;
      equipment.updatedAt = Date.now();

      if (req.file) {
        const imageResult = await uploadToCloudinary(req.file.buffer, 'equipment_images');
        equipment.image = imageResult.secure_url;
      }

      await equipment.save();
      res.json(equipment);
    } catch (err) {
      console.error('Server error while updating equipment:', err.message);
      res.status(500).json({ msg: 'Server error while updating equipment.' });
    }
  }
];

/**
 * Delete an existing piece of equipment.
 */
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({ msg: 'Equipment not found.' });
    }

    await equipment.destroy();
    res.json({ msg: 'Equipment removed successfully.' });
  } catch (err) {
    console.error('Server error while deleting equipment:', err.message);
    res.status(500).json({ msg: 'Server error while deleting equipment.' });
  }
};

/**
 * Retrieve all equipment.
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (err) {
    console.error('Server error while retrieving all equipment:', err.message);
    res.status(500).json({ msg: 'Server error while retrieving all equipment.' });
  }
};

/**
 * Retrieve a single piece of equipment by ID.
 */
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({ msg: 'Equipment not found.' });
    }

    res.json(equipment);
  } catch (err) {
    console.error('Server error while retrieving equipment by ID:', err.message);
    res.status(500).json({ msg: 'Server error while retrieving equipment by ID.' });
  }
};

/**
 * Retrieve all available (active) equipment.
 */
exports.getAvailableEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll({ where: { isActive: true } });
    res.json(equipment);
  } catch (err) {
    console.error('Server error while retrieving available equipment:', err.message);
    res.status(500).json({ msg: 'Server error while retrieving available equipment.' });
  }
};

/**
 * Toggle the active status of a piece of equipment.
 */
exports.toggleEquipmentStatus = async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({ msg: 'Equipment not found.' });
    }

    if (equipment.isActive) {
      equipment.isActive = false;
      equipment.deactivationReason = req.body.deactivationReason; 
    } else {
      equipment.isActive = true;
      equipment.deactivationReason = null;
    }

    equipment.updatedAt = Date.now();
    await equipment.save();

    res.json(equipment);
  } catch (err) {
    console.error('Server error while toggling equipment status:', err.message);
    res.status(500).json({ msg: 'Server error while toggling equipment status.' });
  }
};
