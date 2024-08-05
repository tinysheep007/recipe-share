// pages/index.js
'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { firestore } from '@/firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '@/firebase';
import { signOut } from "firebase/auth";
import DishItem from '@/components/DishItem/DishItem';
import { useRouter } from 'next/navigation';
import IngredientsModal from '@/components/Modal/IngredientsModal';
import AddDishModal from '@/components/Modal/AddDishModal'; // Import AddDishModal
import { query, doc, collection, getDocs, setDoc, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export default function Home() {
  const [user] = useAuthState(auth);
  const [dishes, setDishes] = useState([]);
  const [openAddDishModal, setOpenAddDishModal] = useState(false); // State for AddDishModal
  const [openIngredientsModal, setOpenIngredientsModal] = useState(false); // State for IngredientsModal
  const [selectedDishId, setSelectedDishId] = useState(null);
  const route = useRouter();

  const updateDishes = async () => {
    const snapshot = query(collection(firestore, 'dishes'));
    const docs = await getDocs(snapshot);
    const dishesList = [];
    docs.forEach((doc) => {
      dishesList.push({ id: doc.id, ...doc.data() });
    });
    setDishes(dishesList);
  };

  const handleManageIngredients = (dishId) => {
    setSelectedDishId(dishId);
    setOpenIngredientsModal(true); // Open IngredientsModal
  };


  const handleAddDishSubmit = async (dishData) => {
    const currentID = user ? user.uid : "browser"; // Set userID to "browser" if no user
  
    try {
      const { dishName, prepTime, cost, ingredients, pictureUrl } = dishData;
  
      // Generate a unique ID for the new dish
      const newDishRef = doc(collection(firestore, 'dishes'));
  
      // Set the dish data in Firestore
      await setDoc(newDishRef, {
        userID: currentID,
        dishName,
        prepTime,
        cost,
        pictureUrl, // Default image URL if none provided
      });
  
      // Add ingredients to the dish's subcollection
      const batch = writeBatch(firestore);
      ingredients.forEach(({ name, quantity }) => {
        if (name && quantity) {
          const ingredientRef = doc(collection(newDishRef, 'ingredients'), name);
          batch.set(ingredientRef, { quantity });
        }
      });
  
      // Commit the batch operation
      await batch.commit();
  
      // Update the dishes list
      await updateDishes();
  
      // Close the modal
      setOpenAddDishModal(false);
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  };
  
  

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      route.push("/signin");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  }

  useEffect(() => {
    updateDishes();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h1" sx={{ marginBottom: 2 }}>Dish Management</Typography>
      {user ? user.email : <></>}
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
        {
          user ? <Button onClick={handleSignOut}>
          Sign out
        </Button> : <></>
        }
        
        <Button
          variant="contained"
          onClick={() => setOpenAddDishModal(true)} // Open AddDishModal
          sx={{ marginBottom: 2 }}
        >
          Add Dish
        </Button>
      </Stack>
      <AddDishModal open={openAddDishModal} onClose={() => setOpenAddDishModal(false)} onSubmit={handleAddDishSubmit} />
      <IngredientsModal open={openIngredientsModal} onClose={() => setOpenIngredientsModal(false)} dishId={selectedDishId} />
      <Stack spacing={2}>
        {dishes.map(dish => (
          <DishItem
            key={dish.id}
            dish={dish}
            onManageIngredients={handleManageIngredients}
            updateDishes={updateDishes}
          />
        ))}
      </Stack>
    </Box>
  );
}
