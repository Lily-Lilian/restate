const sdk = require('node-appwrite');

module.exports = async function(req, res) {
    try {
        const { userEmail, propertyName, checkIn, checkOut, guests, totalPrice } = JSON.parse(req.payload);

        // Initialize Appwrite SDK
        const client = new sdk.Client();
        const users = new sdk.Users(client);

        client
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        // Send email using Appwrite's built-in email service
        await users.createEmail(
            'booking@restate.com', // From email
            userEmail, // To email
            'Your Booking Confirmation', // Subject
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #006FFD;">Booking Confirmation</h1>
                <p>Thank you for your booking with RE State!</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #333;">Booking Details</h2>
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 8px 0;">Property:</td>
                            <td style="font-weight: bold;">${propertyName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;">Check-in:</td>
                            <td style="font-weight: bold;">${checkIn}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;">Check-out:</td>
                            <td style="font-weight: bold;">${checkOut}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;">Guests:</td>
                            <td style="font-weight: bold;">${guests}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;">Total Price:</td>
                            <td style="font-weight: bold; color: #006FFD;">$${totalPrice}</td>
                        </tr>
                    </table>
                </div>
                
                <p>If you have any questions about your booking, please don't hesitate to contact us.</p>
            </div>`,
            [], // BCC recipients (optional)
            [], // CC recipients (optional)
            'replyto@restate.com', // Reply-to email
            'RE State Bookings' // Sender name
        );

        console.log('Email sent successfully to:', userEmail);
        return res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        return res.json({
            success: false,
            message: error.message
        });
    }
}; 