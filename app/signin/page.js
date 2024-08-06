'use client'

import React, { useState } from 'react';
import { auth } from "@/firebase";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"; 
import { useRouter } from 'next/navigation';

const SignIn = () => {

    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const route = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await signInWithEmailAndPassword(formData.email, formData.password);
        console.log(res)
        const u = res.user
        console.log(u.email)
        route.push("/")

    }catch(e){ 
        console.log(e)
    }
    console.log('Form submitted:', formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <button
        onClick={() => route.push("/")}
        className="absolute top-4 left-4 bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go Back
      </button>
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
          <button type="button"  onClick={()=>route.push("/signup")} className='w-full mt-3 bg-green-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>Don't have an account? SignUp</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
