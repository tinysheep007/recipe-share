// components/Modal/IngredientsModal.js
'use client';

import { Box, Typography, TextField, Button, Modal } from '@mui/material';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { doc, collection, getDocs, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export default function IngredientsModal({ open, onClose, dishId }) {
  const [ingredients, setIngredients] = useState([]);
  const [ingredientToAdd, setIngredientToAdd] = useState("");
  const [quantityToAdd, setQuantityToAdd] = useState("");

  useEffect(() => {
    if (dishId) {
      fetchIngredients();
    }
  }, [dishId]);

  const fetchIngredients = async () => {
    const snapshot = collection(firestore, `dishes/${dishId}/ingredients`);
    const docs = await getDocs(snapshot);
    const ingredientsList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setIngredients(ingredientsList);
  };

  const handleAddIngredient = async () => {
    if (ingredientToAdd && quantityToAdd) {
      const ingredientRef = doc(collection(firestore, `dishes/${dishId}/ingredients`), ingredientToAdd);
      await setDoc(ingredientRef, { quantity: parseInt(quantityToAdd) }, { merge: true });
      fetchIngredients(); // Refresh the ingredient list
      setIngredientToAdd("");
      setQuantityToAdd("");
    }
  };

  const handleRemoveIngredient = async (ingredientId) => {
    try {
      const ingredientRef = doc(firestore, `dishes/${dishId}/ingredients/${ingredientId}`);
      const ingredientDoc = await getDoc(ingredientRef);
  
      if (ingredientDoc.exists()) {
        const ingredientData = ingredientDoc.data();
        const newQuantity = ingredientData.quantity - 1; // Decrease quantity by 1
  
        if (newQuantity <= 0) {
          // Optionally delete the ingredient document if quantity is 0 or less
          await deleteDoc(ingredientRef);
        } else {
          // Update the quantity in the document
          await setDoc(ingredientRef, { quantity: newQuantity }, { merge: true });
        }
  
        fetchIngredients(); // Refresh the ingredient list
      }
    } catch (error) {
      console.error("Error removing ingredient:", error);
    }
  };
  
  const handleAddAmount = async (ingredientId) => {
    try {
        const ingredientRef = doc(firestore, `dishes/${dishId}/ingredients/${ingredientId}`);
        const ingredientDoc = await getDoc(ingredientRef);
    
        if (ingredientDoc.exists()) {
            const ingredientData = ingredientDoc.data();
            const newQuantity = ingredientData.quantity + 1; 
    
            // Update the quantity in the document
            await setDoc(ingredientRef, { quantity: newQuantity }, { merge: true });
          
    
            fetchIngredients(); // Refresh the ingredient list
        }
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }
  }

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
      }}>
        <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Manage Ingredients</Typography>
        {ingredients.map((ingredient) => (
          <Box key={ingredient.id} sx={{ marginBottom: 2 }}>
            <Typography variant="body1">{ingredient.id}</Typography>
            <Typography variant="body2">Quantity: {ingredient.quantity}</Typography>
            <Button variant="outlined" onClick={()=>handleAddAmount(ingredient.id)}>Add</Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleRemoveIngredient(ingredient.id)}
              sx={{ marginRight: 1 }}
            >
              Remove
            </Button>
          </Box>
        ))}
        <TextField
          label="Ingredient Name"
          variant="outlined"
          fullWidth
          value={ingredientToAdd}
          onChange={(e) => setIngredientToAdd(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Quantity"
          variant="outlined"
          fullWidth
          type="number"
          value={quantityToAdd}
          onChange={(e) => setQuantityToAdd(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleAddIngredient}
        >
          Add Ingredient
        </Button>
      </Box>
    </Modal>
  );
}
