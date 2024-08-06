'use client';

import { Stack, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { signOut } from "firebase/auth";
import { auth } from '@/firebase';

export default function Header({ user }) {
  const route = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      route.push("/signin");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ marginTop: 2 }}
    >
      <Button variant="contained" color="primary" onClick={() => route.push("/signup")}>
        Login / Sign up
      </Button>
      {user && (
        <Button onClick={handleSignOut}>
          Sign out
        </Button>
      )}
    </Stack>
  );
}
