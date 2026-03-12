const express = require('express');
const router = express.Router();
const {
    getDocuments,
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all document routes

router.route('/')
    .get(getDocuments)
    .post(createDocument);

router.route('/:id')
    .get(getDocumentById)
    .put(updateDocument)
    .delete(deleteDocument);

module.exports = router;
