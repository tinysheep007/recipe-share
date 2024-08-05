'use client';

// components/DishList/DishList.js
import DishItem from '../DishItem/DishItem';
import { Stack } from '@mui/material';

export default function DishList({ dishes, onManageIngredients }) {
  return (
    <Stack spacing={2}>
      {dishes.map((dish) => (
        <DishItem key={dish.id} dish={dish} onManageIngredients={onManageIngredients} />
      ))}
    </Stack>
  );
}
