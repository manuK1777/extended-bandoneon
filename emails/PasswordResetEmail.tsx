import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Preview,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ 
  resetUrl, 
  userName = 'there' 
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Extended Bandoneon password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            We received a request to reset your password for your Extended Bandoneon account.
          </Text>
          
          <Text style={text}>
            Please click the button below to reset your password:
          </Text>
          
          <Link href={resetUrl} style={button}>
            Reset Password
          </Link>
          
          <Text style={text}>
            This link will expire in 1 hour for security reasons.
          </Text>
          
          <Text style={text}>
            If you didn't make this request, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Extended Bandoneon. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20, 50, 70, 0.2)',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '20px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#6366F1',
  borderRadius: '5px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '30px auto',
  padding: '12px 20px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '220px',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  margin: '50px 0 0 0',
  textAlign: 'center' as const,
};

export default PasswordResetEmail;
