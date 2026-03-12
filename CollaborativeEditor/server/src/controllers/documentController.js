const Document = require('../models/Document');

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            $or: [
                { owner: req.user.id },
                { 'collaborators.user': req.user.id }
            ]
        }).sort({ updatedAt: -1 });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new document
// @route   POST /api/documents
// @access  Private
const createDocument = async (req, res) => {
    try {
        const { title } = req.body;

        const document = await Document.create({
            title: title || 'Untitled Document',
            owner: req.user.id,
            data: { ops: [{ insert: '\n' }] }
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single document
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check permissions
        const isOwner = document.owner.toString() === req.user.id;
        const isCollaborator = document.collaborators.some(
            (c) => c.user.toString() === req.user.id
        );

        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update document metadata (title, etc)
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res) => {
    try {
        let document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Only owner or editors can update metadata
        const isOwner = document.owner.toString() === req.user.id;
        const isEditor = document.collaborators.some(
            (c) => c.user.toString() === req.user.id && c.role === 'editor'
        );

        if (!isOwner && !isEditor) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        document = await Document.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Only owner can delete
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await document.deleteOne();

        res.json({ message: 'Document removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDocuments,
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument
};
