
'use client';

import { Box, Typography, TextField, Button, Modal } from '@mui/material';
import { useState, useEffect } from 'react';
// get the db to access
import { firestore } from '@/firebase';
// all CRUD tools
import { doc, collection, getDocs, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ColorRing } from 'react-loader-spinner';

export default function IngredientsModal({ open, onClose, dishId }) {
  const [ingredients, setIngredients] = useState([]);
  const [ingredientToAdd, setIngredientToAdd] = useState("");
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [loading, setLoading] = useState(false);

  // if different dish is selected, re-render
  useEffect(() => {
    if (dishId) {
      setIngredients([])
      setLoading(true)
      fetchIngredients();
    }
  }, [dishId]);

  const fetchIngredients = async () => {
    const snapshot = collection(firestore, `dishes/${dishId}/ingredients`);
    const docs = await getDocs(snapshot);
    const ingredientsList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setIngredients(ingredientsList);
    setLoading(false);
  };

  const handleAddIngredient = async () => {
    // if requuired field are not empty 
    if (ingredientToAdd && quantityToAdd) {
      // create ref
      const ingredientRef = doc(collection(firestore, `dishes/${dishId}/ingredients`), ingredientToAdd);
      // add new doc
      await setDoc(ingredientRef, { quantity: quantityToAdd.toString() }, { merge: true });
      // re-render
      fetchIngredients(); 
      setIngredientToAdd("");
      setQuantityToAdd("");
    }
  };

  // handle updating quantity
  const updateQuantity = (quantity, delta) => {
    // change our quantity field input to string\
    // easier for further operations in case it does contains string
    const quantityString = quantity.toString();
    // parse the int part we need out
    const numericPart = parseInt(quantityString, 10);
    // save the string part by removing all numerical parts
    const stringPart = quantityString.replace(numericPart.toString(), '');
    // delta is the amount changed / in our case +1 or -1
    const newNumericPart = numericPart + delta;
    // reutrn final string format quantity
    return newNumericPart.toString() + stringPart;
  };

  // handle removing ingredient
  const handleRemoveIngredient = async (ingredientId) => {
    try {
      // get the singular ingredient from the ingredients collections
      const ingredientRef = doc(firestore, `dishes/${dishId}/ingredients/${ingredientId}`);
      const ingredientDoc = await getDoc(ingredientRef);

      // if the ingredient is found
      if (ingredientDoc.exists()) {
        // get the acutal data
        const ingredientData = ingredientDoc.data();
        // pass in the quantity and change of delta
        const newQuantity = updateQuantity(ingredientData.quantity, -1);
        
        // new Quantity is still string, so convert and parse
        if (parseInt(newQuantity, 10) <= 0) {
          // if quantity less or equal to 1, delete this ingredient
          await deleteDoc(ingredientRef);
        } else {
          // else just set new data
          await setDoc(ingredientRef, { quantity: newQuantity }, { merge: true });
        }

        // update ingredients
        fetchIngredients();
      }
    } catch (error) {
      console.error("Error removing ingredient:", error);
    }
  };

  // similar logic to delete
  const handleAddAmount = async (ingredientId) => {
    try {
      const ingredientRef = doc(firestore, `dishes/${dishId}/ingredients/${ingredientId}`);
      const ingredientDoc = await getDoc(ingredientRef);

      if (ingredientDoc.exists()) {
        const ingredientData = ingredientDoc.data();
        const newQuantity = updateQuantity(ingredientData.quantity, 1);

        await setDoc(ingredientRef, { quantity: newQuantity }, { merge: true });

        fetchIngredients(); 
      }
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
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
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Manage Ingredients</Typography>
        
        {
          loading  ? (<div>
            <h2>Loading...</h2>
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
              />
          </div>) : (<>
            {ingredients.map((ingredient) => (
              <Box key={ingredient.id} sx={{ marginBottom: 2 }}>
                <Typography variant="body1">{ingredient.id}</Typography>
                <Typography variant="body2">Quantity: {ingredient.quantity}</Typography>
                <Button variant="outlined" onClick={() => handleAddAmount(ingredient.id)}>Add</Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  sx={{ marginRight: 1, marginLeft: 2 }}
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
          </>)
        }
      </Box>
    </Modal>
  );
}
