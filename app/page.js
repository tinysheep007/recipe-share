'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Pagination } from '@mui/material';
import { firestore } from '@/firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '@/firebase';
import { signOut } from "firebase/auth";
import DishItem from '@/components/DishItem/DishItem';
import { useRouter } from 'next/navigation';
import IngredientsModal from '@/components/Modal/IngredientsModal';
import AddDishModal from '@/components/Modal/AddDishModal';
import SearchBar from '@/components/SearchBar';
import { query, doc, collection, getDocs, setDoc, writeBatch, where } from 'firebase/firestore';

export default function Home() {
  const [user] = useAuthState(auth);
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const dishesPerPage = 5;
  const [openAddDishModal, setOpenAddDishModal] = useState(false);
  const [openIngredientsModal, setOpenIngredientsModal] = useState(false);
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
    setFilteredDishes(dishesList); // Set filtered dishes initially
  };

  const handleSearch = async (term, option) => {

    if (term.trim() === "") {
      setFilteredDishes(dishes);
      setCurrentPage(1); // Reset to first page when search term is empty
      return;
    }

    let querySnapshot;
    let filteredList = [];
    

    if (option === "dishName") {
      const dishQuery = query(
        collection(firestore, 'dishes'),
        where('dishName', '>=', term),
        where('dishName', '<=', term + '\uf8ff')
      );
      querySnapshot = await getDocs(dishQuery);
      filteredList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (option === "ingredientName") {
      const dishesWithIngredient = [];
      const dishesSnapshot = await getDocs(collection(firestore, 'dishes'));
      for (const dish of dishesSnapshot.docs) {
        const ingredientsSnapshot = await getDocs(collection(firestore, `dishes/${dish.id}/ingredients`));
        ingredientsSnapshot.forEach((ingredientDoc) => {
          if (ingredientDoc.id.toLowerCase().includes(term.toLowerCase())) {
            dishesWithIngredient.push(dish.data());
          }
        });
      }
      filteredList = dishesWithIngredient;
    }

    setFilteredDishes(filteredList);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleManageIngredients = (dishId) => {
    setSelectedDishId(dishId);
    setOpenIngredientsModal(true);
  };

  const handleAddDishSubmit = async (dishData) => {
    const currentID = user ? user.uid : "browser";

    try {
      const { dishName, prepTime, cost, ingredients, pictureUrl, instructions } = dishData;
      const newDishRef = doc(collection(firestore, 'dishes'));

      await setDoc(newDishRef, {
        userID: currentID,
        dishName,
        prepTime,
        cost,
        pictureUrl,
        instructions
      });

      const batch = writeBatch(firestore);
      ingredients.forEach(({ name, quantity }) => {
        if (name && quantity) {
          const ingredientRef = doc(collection(newDishRef, 'ingredients'), name);
          batch.set(ingredientRef, { quantity });
        }
      });

      await batch.commit();
      await updateDishes();
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

  useEffect(() => {
    setFilteredDishes(dishes);
    setCurrentPage(1); 
  }, [dishes]);

  const indexOfLastDish = currentPage * dishesPerPage;
  const indexOfFirstDish = indexOfLastDish - dishesPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstDish, indexOfLastDish);

  return (
    <Box sx={{ padding: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ marginBottom: 2 }}>
        <Typography variant="h1">Recipe Share</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" onClick={() => route.push("/signin")}>
            Login 
          </Button>

          <Button variant="contained" color="info" onClick={() => route.push("/signup")}>
            Sign up
          </Button>

          {user && (
            <Button variant="contained" color="warning" onClick={handleSignOut}>
              Sign out
            </Button>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddDishModal(true)}
          >
            Add Dish
          </Button>
        </Stack>
      </Stack>
      
      <SearchBar onSearch={handleSearch} />
      
      <AddDishModal open={openAddDishModal} onClose={() => setOpenAddDishModal(false)} onSubmit={handleAddDishSubmit} />
      <IngredientsModal open={openIngredientsModal} onClose={() => setOpenIngredientsModal(false)} dishId={selectedDishId} />

      <Stack spacing={2}>
        {currentDishes.map(dish => (
          <DishItem
            key={dish.id}
            dish={dish}
            onManageIngredients={handleManageIngredients}
            updateDishes={updateDishes}
          />
        ))}
      </Stack>
      
      <Pagination
        count={Math.ceil(filteredDishes.length / dishesPerPage)}
        page={currentPage}
        onChange={(e, page) => setCurrentPage(page)}
        color="primary"
        sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
      />
    </Box>
  );
}
