import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const registerUser = async (data) => {
  const response = await axios.post(`${API}/auth/register`, data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axios.post(`${API}/auth/login`, data);
  return response.data;
};

export const changePassword = async (data, token) => {
  const response = await axios.put(`${API}/auth/change-password`, data, getHeaders(token));
  return response.data;
};
