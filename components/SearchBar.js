'use client';

import { Box, TextField, MenuItem, Select, InputLabel, FormControl, Button, Stack } from '@mui/material';
import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOption, setSearchOption] = useState("dishName");

  const handleSearch = () => {
    onSearch(searchTerm, searchOption);
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl fullWidth sx={{ flexGrow: 1 }}>
          <InputLabel id="search-option-label">Search By</InputLabel>
          <Select
            labelId="search-option-label"
            value={searchOption}
            onChange={(e) => setSearchOption(e.target.value)}
            fullWidth
          >
            <MenuItem value="dishName">Dish Name</MenuItem>
            <MenuItem value="ingredientName">Ingredient Name</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Stack>
    </Box>
  );
}
