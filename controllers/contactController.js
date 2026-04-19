import sendEmail from "../utils/sendEmail.js";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Send email to company
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Contact Form Submission</h2>
        <hr style="border: none; border-top: 2px solid #e5e7eb;">
        
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        
        <h3 style="color: #374151; margin-top: 20px;">Message:</h3>
        <p style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; line-height: 1.6;">
          ${message.replace(/\n/g, '<br>')}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 20px;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent from your inventory management system's contact form.
        </p>
      </div>
    `;

    await sendEmail({
      email: process.env.CONTACT_EMAIL || process.env.FROM_EMAIL || "contact@inventorypro.com",
      subject: `New Contact Message from ${name}`,
      message: message,
      html: htmlTemplate,
    });

    // Send confirmation email to the user
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Thank You for Contacting Us</h2>
        <p style="color: #374151; line-height: 1.6;">
          Hi ${name},<br><br>
          We've received your message and appreciate you reaching out to AIDO Group Company Ltd.
          Our team will review your message and get back to you as soon as possible, typically within 24 hours on weekdays.
        </p>
        
        <div style="background-color: #dcfce7; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0; border-radius: 4px;">
          <p style="color: #166534; margin: 0;">
            <strong>Business Hours:</strong><br>
            Monday - Friday: 9:00 AM - 6:00 PM<br>
            Saturday: 10:00 AM - 4:00 PM<br>
            Sunday: Closed
          </p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          In the meantime, feel free to reach out via:<br>
          📞 +250 780 407 093 (WhatsApp available)<br>
          📧 contact@inventorypro.com
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          © 2026 AIDO Group Company Ltd. All rights reserved.
        </p>
      </div>
    `;

    await sendEmail({
      email: email,
      subject: "We've Received Your Message - AIDO Group Company Ltd",
      message: `Hi ${name},\n\nWe've received your message and appreciate you reaching out to AIDO Group Company Ltd. Our team will review your message and get back to you as soon as possible.\n\nBest regards,\nAIDO Group Team`,
      html: confirmationHtml,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully! We will get back to you soon.",
    });
  } catch (error) {
    console.error("[Contact Controller] Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
};
