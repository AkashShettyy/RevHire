import axios from "axios";

const API = "http://localhost:8000/api";

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getResume = async (token) => {
  const response = await axios.get(`${API}/resume`, getHeaders(token));
  return response.data;
};

export const saveResume = async (data, token) => {
  const response = await axios.post(`${API}/resume`, data, getHeaders(token));
  return response.data;
};
