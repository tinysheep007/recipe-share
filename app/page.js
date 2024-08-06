'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Pagination } from '@mui/material';
// imported from our own ./firebase.js , not from npm module
import { firestore, auth } from '@/firebase';
// we can get current user from useAuthState
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
// import other components over
import DishItem from '@/components/DishItem/DishItem';
import IngredientsModal from '@/components/Modal/IngredientsModal';
import AddDishModal from '@/components/Modal/AddDishModal';
import SearchBar from '@/components/SearchBar';
// operations for CURD in firebase firestore
import { query, doc, collection, getDocs, setDoc, writeBatch, where } from 'firebase/firestore';
import { ColorRing } from 'react-loader-spinner';

export default function Home() {
  const [user] = useAuthState(auth);
  // all the dish list
  const [dishes, setDishes] = useState([]);
  // the displayed dishes after query
  const [filteredDishes, setFilteredDishes] = useState([]);
  // keep track of page numebr
  const [currentPage, setCurrentPage] = useState(1);
  const dishesPerPage = 5;
  // keep modal state to open or close
  const [openAddDishModal, setOpenAddDishModal] = useState(false);
  const [openIngredientsModal, setOpenIngredientsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDishId, setSelectedDishId] = useState(null);
  const route = useRouter();

  const updateDishes = async () => {
    // get snapshot from querying the dishes collection in firebase
    const snapshot = query(collection(firestore, 'dishes'));
    // get all the documents
    const docs = await getDocs(snapshot);
    const dishesList = [];
    // push everything inside each our documents to array
    docs.forEach((doc) => {
      dishesList.push({ id: doc.id, ...doc.data() });
    });
    setDishes(dishesList);
    setFilteredDishes(dishesList); 
  };

  // when search for dishes, properly update filtedlist
  const handleSearch = async (term, option) => {
    // if search term is empty, just display everything
    if (term.trim() === "") {
      setFilteredDishes(dishes);
      setCurrentPage(1);  
      return;
    }

    let querySnapshot;
    let filteredList = [];
    setLoading(true)

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
        // get all the ingredients within a single dish
        const ingredientsSnapshot = await getDocs(collection(firestore, `dishes/${dish.id}/ingredients`));
        // check if ingredient name contains our search term
        ingredientsSnapshot.forEach((ingredientDoc) => {
          // if we do have a match, add current dish to array
          if (ingredientDoc.id.toLowerCase().includes(term.toLowerCase())) {
            // if it is not a repeating dish, add to array
            if (!dishesWithIngredient.some(d => d.id === dish.id)) {
              dishesWithIngredient.push({ id: dish.id, ...dish.data() });
            }
          }
        });
      }
      // set temp variable to hold updated list
      filteredList = dishesWithIngredient;
    }

    // update our state, so page re-render
    setFilteredDishes(filteredList);
    setCurrentPage(1); 
  };

  // open the selected management modal for this dish
  const handleManageIngredients = (dishId) => {
    setSelectedDishId(dishId);
    setOpenIngredientsModal(true);
    // console.log(dishId);
  };

  // when submitting the dish
  // if we are log in our user.uid would be treated as "browser"
  const handleAddDishSubmit = async (dishData) => {
    const currentID = user ? user.uid : "browser";

    try {
      // get all variables inside dishData whhere store the user inputs
      const { dishName, prepTime, cost, ingredients, pictureUrl, instructions } = dishData;
      // add new doc in dishes collection we can edit this doc later
      const newDishRef = doc(collection(firestore, 'dishes'));
      // add new doc
      await setDoc(newDishRef, {
        userID: currentID,
        dishName,
        prepTime,
        cost,
        pictureUrl,
        instructions
      });

      // get ready to write more 
      const batch = writeBatch(firestore);
      ingredients.forEach(({ name, quantity }) => {
        // check if both required field is here
        if (name && quantity) {
          // create a new doc inside the ingredient collection inside the dish
          const ingredientRef = doc(collection(newDishRef, 'ingredients'), name);
          batch.set(ingredientRef, { quantity });
        }
      });
      // commit the addition wait for every edit is added to the commit batch
      await batch.commit();
      // update all list to rerender fetched dishes
      await updateDishes();
      // close modal
      setOpenAddDishModal(false);
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  };

  // logout using signout function in firebase
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      route.push("/signin");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  }

  // when page first started, we render our list
  useEffect(() => {
    setLoading(true)
    updateDishes();
  }, []);

  // when dishes changes, we need to update displayed dishes
  useEffect(() => {
    setFilteredDishes(dishes);
    setCurrentPage(1); 
  }, [dishes]);

  useEffect(()=>{
    setLoading(false)
  },[filteredDishes])

  // turn page operations
  // last element's index of current page
  const indexOfLastDish = currentPage * dishesPerPage;
  // first element's index  current page
  const indexOfFirstDish = indexOfLastDish - dishesPerPage;
  // take out the dished in the range that we just calculated and store them
  const currentDishes = filteredDishes.slice(indexOfFirstDish, indexOfLastDish);

  return (
    <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
      <Stack direction="column" spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ marginBottom: 2, flexWrap: 'wrap' }}
        >
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            Recipe Share
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Button variant="contained" color="success" onClick={() => route.push("/signin")} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Login 
            </Button>

            <Button variant="contained" color="info" onClick={() => route.push("/signup")} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Sign up
            </Button>

            {user && (
              <Button variant="contained" color="warning" onClick={handleSignOut} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Sign out
              </Button>
            )}
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenAddDishModal(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add Dish
            </Button>
          </Stack>
        </Stack>

        <SearchBar onSearch={handleSearch} />
        
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ minHeight: '200px' }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>Loading...</Typography>
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
            />
          </Box>
        )}
        
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
      </Stack>
    </Box>
  );
}
