'use client';

import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth'; // Import the useAuthState hook from Firebase
import { firestore } from '@/firebase'; // Import the Firestore instance
import { doc, deleteDoc } from 'firebase/firestore'; // Import Firestore methods for deleting documents
import { auth } from '@/firebase'; // Import the auth instance

export default function DishItem({ dish, onManageIngredients, updateDishes }) {
  const [user] = useAuthState(auth); // Get the current user
  const currentUserId = user ? user.uid : "browser"; // Set user.uid to "browser" if the user does not exist

  const handleDelete = async () => {
    try {
      const dishRef = doc(firestore, 'dishes', dish.id);
      await deleteDoc(dishRef);
      await updateDishes();
      // Optionally, update the dishes list or trigger a re-fetch
      
    } catch (error) {
      console.error("Error deleting dish:", error);
    }
  };

  return (
    <Box key={dish.id} sx={{
      display: 'flex',
      alignItems: 'center',
      padding: 2,
      border: '1px solid #ccc',
      borderRadius: 2,
      backgroundColor: '#f9f9f9',
      gap: 2, // Add space between image and text
    }}>
      <Image
        src={dish.pictureUrl || 'https://www.destenaire.com/noaccess/wp-content/uploads/2014/10/8-Oddest-Food-Items-Featured-Image1.png'}
        alt={dish.dishName}
        width={100} // Adjust the width as needed
        height={100} // Adjust the height as needed
        style={{ borderRadius: '4px' }} // Optional: add border radius to image
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          {dish.dishName}
        </Typography>
        <Typography variant="body2">
          Prep Time: {dish.prepTime}
        </Typography>
        <Typography variant="body2">
          Cost: {dish.cost}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onManageIngredients(dish.id)}
          sx={{ marginTop: 1 }}
        >
          Manage Ingredients
        </Button>
        {currentUserId === dish.userID && ( // Check if the current user ID matches the dish owner ID
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            sx={{ marginTop: 1, marginLeft: 1 }}
          >
            Delete
          </Button>
        )}
      </Box>
    </Box>
  );
}
