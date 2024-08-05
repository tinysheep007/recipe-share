// components/Modal/ViewDishModal.js
'use client';

import { Box, Typography, Modal, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ViewDishModal({ open, onClose, dish }) {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    if (dish) {
      fetchIngredients();
    }
  }, [dish]);

  const fetchIngredients = async () => {
    const snapshot = collection(firestore, `dishes/${dish.id}/ingredients`);
    const docs = await getDocs(snapshot);
    const ingredientsList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setIngredients(ingredientsList);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        maxHeight: '90vh', // Set a maximum height
        overflowY: 'auto', // Enable vertical scrolling
      }}>
        <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>View Dish</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          {dish.dishName}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          Prep Time: {dish.prepTime}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          Cost: {dish.cost}
        </Typography>
        <Typography variant="h6" component="h3" sx={{ marginBottom: 1 }}>Ingredients</Typography>
        {ingredients.map((ingredient) => (
          <Typography key={ingredient.id} variant="body2">
            {ingredient.id}: {ingredient.quantity}
          </Typography>
        ))}
        <Typography variant="h6" component="h3" sx={{ marginTop: 2, marginBottom: 1 }}>Instructions</Typography>
        <Typography variant="body2">
          {dish.instructions || 'No instructions provided.'}
        </Typography>
      </Box>
    </Modal>
  );
}
