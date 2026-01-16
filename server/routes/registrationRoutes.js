const express = require('express');
const {
  createRegistration,
  listRegistrationsByRegion,
  listHeiCampusesByRegion,
  approveRegistration,
  deleteRegistration
} = require('../controllers/registrationController');

const router = express.Router();

router.post('/', createRegistration);
router.get('/', listRegistrationsByRegion);
router.get('/hei-directory', listHeiCampusesByRegion);
router.post('/:id/approve', approveRegistration);
router.post('/:id/delete', deleteRegistration);

module.exports = router;
