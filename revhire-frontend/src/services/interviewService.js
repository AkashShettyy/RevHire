import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const scheduleInterview = async (payload, token) => {
  const response = await axios.post(
    `${API}/interviews`,
    payload,
    getHeaders(token),
  );
  return response.data;
};

export const getMyInterviews = async (token) => {
  const response = await axios.get(`${API}/interviews/my`, getHeaders(token));
  return response.data;
};

export const getEmployerInterviews = async (token) => {
  const response = await axios.get(`${API}/interviews/employer`, getHeaders(token));
  return response.data;
};

export const getJobInterviews = async (jobId, token) => {
  const response = await axios.get(
    `${API}/interviews/job/${jobId}`,
    getHeaders(token),
  );
  return response.data;
};

export const cancelInterview = async (interviewId, token) => {
  const response = await axios.put(
    `${API}/interviews/${interviewId}/cancel`,
    {},
    getHeaders(token),
  );
  return response.data;
};

export const respondToInterview = async (interviewId, responseStatus, token) => {
  const response = await axios.put(
    `${API}/interviews/${interviewId}/respond`,
    { responseStatus },
    getHeaders(token),
  );
  return response.data;
};
