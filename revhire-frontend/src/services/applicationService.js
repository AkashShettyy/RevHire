import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const applyForJob = async (jobId, data, token) => {
  const response = await axios.post(
    `${API}/applications/${jobId}/apply`,
    data,
    getHeaders(token),
  );
  return response.data;
};

export const getUserApplications = async (token) => {
  const response = await axios.get(`${API}/applications/my`, getHeaders(token));
  return response.data;
};

export const withdrawApplication = async (id, token) => {
  const response = await axios.put(
    `${API}/applications/${id}/withdraw`,
    {},
    getHeaders(token),
  );
  return response.data;
};

export const getJobApplicants = async (jobId, token) => {
  const response = await axios.get(
    `${API}/applications/${jobId}/applicants`,
    getHeaders(token),
  );
  return response.data;
};

export const updateApplicationStatus = async (id, status, token) => {
  const response = await axios.put(
    `${API}/applications/${id}/status`,
    { status },
    getHeaders(token),
  );
  return response.data;
};

export const addApplicationNote = async (id, data, token) => {
  const response = await axios.post(
    `${API}/applications/${id}/notes`,
    data,
    getHeaders(token),
  );
  return response.data;
};
