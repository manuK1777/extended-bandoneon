import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  verificationUrl: string;
  userName?: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  verificationUrl,
  userName = 'there',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Confirm your email for Extended Bandoneon</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Email Verification</Heading>
          <Text style={text}>
            Hi {userName},
          </Text>
          <Text style={text}>
            Thanks for signing up for Extended Bandoneon! Just one more step to complete your registration.
          </Text>
          <Text style={text}>
            Please confirm your email address by clicking the button below:
          </Text>
          <Link href={verificationUrl} style={button}>
            Confirm your email
          </Link>
          <Text style={text}>
            If you didn't create an account with us, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Extended Bandoneon. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
