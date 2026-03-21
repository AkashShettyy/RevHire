import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const scheduleInterview = async (applicationId, scheduledAt, token) => {
  const response = await axios.post(
    `${API}/interviews`,
    { applicationId, scheduledAt },
    getHeaders(token),
  );
  return response.data;
};

export const getMyInterviews = async (token) => {
  const response = await axios.get(`${API}/interviews/my`, getHeaders(token));
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
