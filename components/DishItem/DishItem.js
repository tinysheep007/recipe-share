
'use client';

import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firestore } from '@/firebase'; 
import { doc, deleteDoc } from 'firebase/firestore'; 
import { auth } from '@/firebase'; 
import ViewDishModal from '@/components/Modal/ViewDishModal'; 

export default function DishItem({ dish, onManageIngredients, updateDishes }) {
  const [user] = useAuthState(auth);
  // if current no user, use browser as user ID
  const currentUserId = user ? user.uid : "browser";
  // controls opening of the detailed view
  const [openViewModal, setOpenViewModal] = useState(false); 

  // handle deletion based on dish ID
  const handleDelete = async () => {
    try {
      const dishRef = doc(firestore, 'dishes', dish.id);
      // delete this dish document in dishes collection
      await deleteDoc(dishRef);

      // re-render main page
      // this function is passed down from the parent (Main page)
      await updateDishes();
     
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
      gap: 2, 
    }}>
      <Image
        src={dish.pictureUrl || 'https://www.destenaire.com/noaccess/wp-content/uploads/2014/10/8-Oddest-Food-Items-Featured-Image1.png'}
        alt={dish.dishName}
        width={100} 
        height={100} 
        style={{ borderRadius: '4px' }} 
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
        {/* only allow deletion when the current user is the creater of this dish */}
        {
          currentUserId === dish.userID && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => onManageIngredients(dish.id)}
              sx={{ marginTop: 1 }}
            >
              Manage Ingredients
            </Button>
          )
        }
        
        {currentUserId === dish.userID && ( 
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            sx={{ marginTop: 1, marginLeft: 1 }}
          >
            Delete
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpenViewModal(true)}
          sx={{ marginTop: 1, marginLeft: 1 }}
        >
          View
        </Button>
      </Box>
      <ViewDishModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        dish={dish}
      />
    </Box>
  );
}
