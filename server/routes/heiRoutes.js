const express = require('express');
const {
  getAllHeis,
  uploadSubmission,
  getSubmissions,
  deleteSubmission,
  getMasterPrograms,
  createMasterProgram,
  deleteMasterProgram,
  createProgramRequest,
  listProgramRequests,
  updateProgramRequestStatus,
  updateProgramRequest,
  deleteProgramRequest,
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createSubject,
  getSubjects,
  updateSubjectStatus,
  deleteSubject,
  downloadSubmissionPdf,
  downloadSubjectSyllabus,
  downloadProgramRequestFile
} = require('../controllers/heiController');

const router = express.Router();

router.get('/', getAllHeis);
router.post('/submissions', uploadSubmission);
router.get('/submissions', getSubmissions);
router.get('/submissions/:id/pdf', downloadSubmissionPdf);
router.delete('/submissions/:id', deleteSubmission);

router.get('/programs/master', getMasterPrograms);
router.post('/programs/master', createMasterProgram);
router.delete('/programs/master/:id', deleteMasterProgram);

router.post('/programs/requests', createProgramRequest);
router.get('/programs/requests', listProgramRequests);
router.get('/programs/requests/:id/file', downloadProgramRequestFile);
router.post('/programs/requests/:id/status', updateProgramRequestStatus);
router.put('/programs/requests/:id', updateProgramRequest);
router.delete('/programs/requests/:id', deleteProgramRequest);

router.get('/faculty', getFaculty);
router.post('/faculty', createFaculty);
router.put('/faculty/:id', updateFaculty);
router.delete('/faculty/:id', deleteFaculty);

router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.get('/subjects/:id/syllabus', downloadSubjectSyllabus);
router.post('/subjects/:id/status', updateSubjectStatus);
router.delete('/subjects/:id', deleteSubject);

module.exports = router;
