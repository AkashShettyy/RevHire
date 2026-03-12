import axios from "axios";

const API = "http://localhost:8000/api";

export const registerUser = async (data) => {
  const response = await axios.post(`${API}/auth/register`, data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axios.post(`${API}/auth/login`, data);
  return response.data;
};
