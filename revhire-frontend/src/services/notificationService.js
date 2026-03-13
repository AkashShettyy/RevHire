import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getNotifications = async (token) => {
  const response = await axios.get(`${API}/notifications`, getHeaders(token));
  return response.data;
};

export const markAllRead = async (token) => {
  const response = await axios.put(
    `${API}/notifications/read`,
    {},
    getHeaders(token),
  );
  return response.data;
};
