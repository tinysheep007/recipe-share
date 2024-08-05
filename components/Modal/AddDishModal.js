'use client';

import { Box, Typography, TextField, Button, Modal, Stack } from '@mui/material';
import { useState } from 'react';

export default function AddDishModal({ open, onClose, onSubmit }) {
  const [dishName, setDishName] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cost, setCost] = useState("");
  const [instructions, setIns] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [pictureUrl, setPictureUrl] = useState(""); // State for picture URL

  const handleSubmit = () => {
    // Use default image URL if pictureUrl is empty
    const url = pictureUrl;
    const finalPictureUrl = url || "https://www.destenaire.com/noaccess/wp-content/uploads/2014/10/8-Oddest-Food-Items-Featured-Image1.png";

    onSubmit({ dishName, prepTime, cost, ingredients, pictureUrl: finalPictureUrl, instructions });
    setDishName('');
    setPrepTime('');
    setCost('');
    setIns('');
    setIngredients([{ name: "", quantity: "" }]);
    setPictureUrl(''); // Clear picture URL state
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
        <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Add New Dish</Typography>
        <TextField
          label="Dish Name"
          variant="outlined"
          fullWidth
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Preparation Time"
          variant="outlined"
          fullWidth
          value={prepTime}
          onChange={(e) => setPrepTime(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Cost"
          variant="outlined"
          fullWidth
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Picture URL (Optional)"
          variant="outlined"
          fullWidth
          value={pictureUrl}
          onChange={(e) => setPictureUrl(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Instructions</Typography>
        <TextField
          label="Cooking Guide"
          variant="outlined"
          fullWidth
          value={instructions}
          onChange={(e) => setIns(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Typography variant="h6" component="h2" sx={{ marginTop: 2, marginBottom: 2 }}>Ingredients</Typography>
        {ingredients.map((ingredient, index) => (
          <Box key={index} sx={{ marginBottom: 2 }}>
            <TextField
              label="Ingredient Name"
              variant="outlined"
              fullWidth
              value={ingredient.name}
              onChange={(e) => {
                const newIngredients = [...ingredients];
                newIngredients[index].name = e.target.value;
                setIngredients(newIngredients);
              }}
              sx={{ marginBottom: 1 }}
            />
            <TextField
              label="Quantity"
              variant="outlined"
              fullWidth
              value={ingredient.quantity}
              onChange={(e) => {
                const newIngredients = [...ingredients];
                newIngredients[index].quantity = e.target.value;
                setIngredients(newIngredients);
              }}
            />
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={() => setIngredients([...ingredients, { name: "", quantity: "" }])}
          sx={{ marginBottom: 2 }}
        >
          Add Another Ingredient
        </Button>
        <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            SUBMIT
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
