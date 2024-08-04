'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import Image from "next/image";

export default function Home() {

  const [inventory, setInventory] = useState([])
  const [openModal, setOpenModal] = useState(true)
  const [itemName, setItemName] = useState("")

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  
  useEffect(() => {
    updateInventory()
  }, [])

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h1" sx={{ marginBottom: 2 }}>Inventory Management</Typography>
      <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ marginBottom: 2 }}>Add Items</Button>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Add New Item</Typography>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName);
              setItemName('');
              setOpenModal(false);
            }}
          >
            SUBMIT
          </Button>
        </Box>
      </Modal>
      <Stack spacing={2}>
        {inventory.map(({ name, quantity }) => (
          <Box key={name} sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 2,
            border: '1px solid #ccc',
            borderRadius: 2
          }}>
            <Typography>{name}</Typography>
            <Typography>{quantity}</Typography>
            <Button variant="contained" color="secondary" onClick={() => addItem(name)}>Add</Button>
            <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>Remove</Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
