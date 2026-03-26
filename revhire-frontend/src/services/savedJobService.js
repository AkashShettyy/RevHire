import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getSavedJobs = async (token) => {
  const response = await axios.get(`${API}/saved-jobs`, getHeaders(token));
  return response.data;
};

export const getJobAlerts = async (token) => {
  const response = await axios.get(`${API}/saved-jobs/alerts`, getHeaders(token));
  return response.data;
};

export const saveJob = async (jobId, token) => {
  const response = await axios.post(`${API}/saved-jobs/${jobId}`, {}, getHeaders(token));
  return response.data;
};

export const removeSavedJob = async (jobId, token) => {
  const response = await axios.delete(`${API}/saved-jobs/${jobId}`, getHeaders(token));
  return response.data;
};
