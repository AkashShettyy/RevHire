import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getAllJobs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`${API}/jobs?${params}`);
  return response.data;
};

export const getJobById = async (id) => {
  const response = await axios.get(`${API}/jobs/${id}`);
  return response.data;
};

export const createJob = async (data, token) => {
  const response = await axios.post(`${API}/jobs`, data, getHeaders(token));
  return response.data;
};

export const updateJob = async (id, data, token) => {
  const response = await axios.put(
    `${API}/jobs/${id}`,
    data,
    getHeaders(token),
  );
  return response.data;
};

export const deleteJob = async (id, token) => {
  const response = await axios.delete(`${API}/jobs/${id}`, getHeaders(token));
  return response.data;
};

export const getEmployerJobs = async (token) => {
  const response = await axios.get(
    `${API}/jobs/employer/myjobs`,
    getHeaders(token),
  );
  return response.data;
};
