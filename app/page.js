'use client';

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Redox Mental Health Bot
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Welcome!
        </Typography>
        <Typography variant="h6" component="p" sx={{ mb: 3 }}>
          Please sign in or sign up to continue.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mb: 2,
            padding: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
          }}
          onClick={() => router.push('/Signin')}
        >
          Sign In
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{
            padding: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
          }}
          onClick={() => router.push('/Signup')}
        >
          Sign Up
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;