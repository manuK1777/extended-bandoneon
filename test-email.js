// Simple test script to verify email template rendering
const { render } = require('@react-email/render');
const React = require('react');

// Import the email component
const VerificationEmail = require('./emails/VerificationEmail').default;

async function testEmailRender() {
  try {
    console.log('Testing email template rendering...');
    
    const testProps = {
      verificationUrl: 'http://localhost:3000/verify-email?token=test123',
      userName: 'Test User'
    };
    
    console.log('Props:', testProps);
    
    const html = await render(
      React.createElement(VerificationEmail, testProps)
    );
    
    console.log('Rendered HTML length:', html.length);
    console.log('First 300 characters:', html.substring(0, 300));
    console.log('Contains verification URL:', html.includes(testProps.verificationUrl));
    console.log('Contains user name:', html.includes(testProps.userName));
    
  } catch (error) {
    console.error('Error rendering email:', error);
  }
}

testEmailRender();
