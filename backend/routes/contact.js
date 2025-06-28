const express = require('express');
const Contact = require('../models/Contact');
const { validateContactForm } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Submit Contact Form
router.post('/submit', validateContactForm, async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    // Get client IP and user agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create contact submission
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      type: type || 'general',
      ipAddress,
      userAgent
    });

    await contact.save();

    // TODO: Send email notification to admin
    // This would integrate with nodemailer or email service
    try {
      await sendContactNotificationEmail(contact);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        submission: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          subject: contact.subject,
          message: contact.message,
          type: contact.type,
          status: contact.status,
          submittedAt: contact.submittedAt
        }
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(422).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid contact form data',
        details,
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to submit contact form',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Get Contact Submissions (Admin only)
router.get('/submissions', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [submissions, totalItems] = await Promise.all([
      Contact.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contact.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1
        }
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Get contact submissions error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch contact submissions',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Update Contact Submission Status (Admin only)
router.put('/submissions/:contactId/status', requireAdmin, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Invalid status value',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    const contact = await Contact.findOne({ id: contactId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'CONTACT_NOT_FOUND',
        message: 'Contact submission not found',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      });
    }

    contact.status = status;
    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact submission status updated successfully',
      data: {
        submission: contact.toJSON()
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update contact submission status',
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    });
  }
});

// Email notification function (placeholder)
async function sendContactNotificationEmail(contact) {
  // This would integrate with nodemailer or an email service like SendGrid
  console.log(`📧 New contact form submission from ${contact.email}`);
  console.log(`Subject: ${contact.subject}`);
  console.log(`Message: ${contact.message}`);
  
  // Example implementation with nodemailer:
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'admin@rgpublication.com',
    subject: `New Contact Form: ${contact.subject}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <p><strong>Type:</strong> ${contact.type}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
      <p><strong>Submitted At:</strong> ${contact.submittedAt}</p>
    `
  };

  await transporter.sendMail(mailOptions);
  */
}

module.exports = router;
