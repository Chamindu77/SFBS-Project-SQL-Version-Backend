const express = require('express');
const router = express.Router();
const {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getAllEquipment,
  getAvailableEquipment,
  getEquipmentById,
  toggleEquipmentStatus
} = require('../controllers/equipmentController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Route for creating new equipment. Admin access required.
router.post('/', auth, admin, createEquipment);

// Route for updating existing equipment by ID. Admin access required.
router.put('/:id', auth, admin, updateEquipment);

// Route for deleting existing equipment by ID. Admin access required.
router.delete('/:id', auth, admin, deleteEquipment);

// Route for retrieving all equipment. Admin access required.
router.get('/', auth, admin, getAllEquipment);

// Route for retrieving all available (active) equipment.
router.get('/available', auth, getAvailableEquipment);

// Route for retrieving a single piece of equipment by ID.
router.get('/:id', auth, getEquipmentById);

// Route for toggling the active status of equipment by ID. Admin access required.
router.put('/toggle/:id', auth, admin, toggleEquipmentStatus);

module.exports = router;
