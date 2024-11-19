// src/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const createTravailleur = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/travailleurs`, data);
  return response.data;
};

export const getTravailleur = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/travailleurs/${id}`);
  return response.data;
};

export const updateTravailleur = async (id, data) => {
  const response = await axios.put(`${API_BASE_URL}/travailleurs/${id}`, data);
  return response.data;
};

export const deleteTravailleur = async (id) => {
  await axios.delete(`${API_BASE_URL}/travailleurs/${id}`);
};
