import React, { useState } from "react";
import ResumePreview from "../ResumePreview";
import { downloadResumePdf } from "../../utils/resumeDocument";
import { addApplicationNote } from "../../services/applicationService";
import { useAuth } from "../../context/AuthContext";
import { cancelInterview, scheduleInterview } from "../../services/interviewService";

export default function ApplicationModal({
  application,
  interview,
  onClose,
  onUpdateStatus, // (id, status) => void
  onRefresh, // () => void
}) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [message, setMessage] = useState("");
  
  // Schedule state
  const [scheduleState, setScheduleState] = useState({
    scheduledAt: interview?.scheduledAt ? new Date(interview.scheduledAt).toISOString().slice(0, 16) : "",
    interviewType: interview?.interviewType || "online",
    meetingLink: interview?.meetingLink || "",
    location: interview?.location || "",
  });

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim() && !newRating) return;
    try {
      await addApplicationNote(application._id, { text: newNote, rating: newRating }, token);
      setNewNote("");
      setNewRating(0);
      onRefresh(); // Refresh parent to get new notes
      setMessage("Note added");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to add note");
    }
  }

  async function handleSchedule() {
    if (!scheduleState.scheduledAt || !scheduleState.interviewType) return;
    try {
      await scheduleInterview({
        applicationId: application._id,
        scheduledAt: new Date(scheduleState.scheduledAt).toISOString(),
        interviewType: scheduleState.interviewType,
        meetingLink: scheduleState.meetingLink || "",
        location: scheduleState.location || "",
      }, token);
      setMessage(interview?.status === "scheduled" ? "Rescheduled" : "Interview scheduled");
      setTimeout(() => setMessage(""), 3000);
      onRefresh();
    } catch {
      setMessage("Failed to schedule");
    }
  }

  async function handleCancelInterview() {
    if (!interview?._id) return;
    try {
      await cancelInterview(interview._id, token);
      setMessage("Interview cancelled");
      setTimeout(() => setMessage(""), 3000);
      onRefresh();
    } catch {
      setMessage("Failed to cancel");
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-50 border-b px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-stone-900">{application.jobSeeker?.name}</h2>
            <p className="text-sm text-stone-500">{application.jobSeeker?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={application.status}
              onChange={(e) => {
                onUpdateStatus(application._id, e.target.value);
                onClose();
              }}
              className="app-input w-auto p-2 py-1 text-sm bg-stone-100"
            >
              {["applied", "shortlisted", "interviewing", "offered", "hired", "rejected"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button onClick={onClose} className="p-2 bg-stone-200 rounded-full hover:bg-stone-300">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 px-6">
          {["overview", "resume", "interviews", "notes"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-3 px-4 font-semibold text-sm border-b-2 ${activeTab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "notes" && application.notes?.length > 0 && ` (${application.notes.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {message && <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">{message}</div>}
          
          {activeTab === "overview" && (
            <div className="space-y-6">
              {application.answers?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-3">Screening Answers</h3>
                  <div className="space-y-3">
                    {application.answers.map((a, i) => (
                      <div key={i} className="bg-stone-50 p-3 rounded-xl border">
                        <p className="text-sm font-medium text-stone-800">{a.question}</p>
                        <p className="text-sm text-stone-600 mt-1 flex items-center gap-2">
                          <span className="text-stone-400">↳</span> {a.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {application.coverLetter ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-3">Cover Letter</h3>
                  <p className="text-sm text-stone-600 whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              ) : (
                <p className="text-sm text-stone-500 italic">No Cover letter provided.</p>
              )}
            </div>
          )}

          {activeTab === "resume" && (
            <div className="space-y-4">
              {application.resume ? (
                <>
                  <button onClick={() => downloadResumePdf(application.jobSeeker, application.resume)} className="app-button px-4 py-2 text-sm text-white">Download PDF</button>
                  <ResumePreview user={application.jobSeeker} resume={application.resume} />
                </>
              ) : (
                <p className="text-sm text-stone-500">Applicant has not provided a resume builder profile.</p>
              )}
            </div>
          )}

          {activeTab === "interviews" && (
            <div className="space-y-6">
              <div className="bg-stone-50 border p-5 rounded-2xl">
                <h3 className="font-semibold text-stone-800 mb-4">{interview?.status === "scheduled" ? "Reschedule Interview" : "Schedule Interview"}</h3>
                <div className="grid gap-3 sm:grid-cols-[1fr,1fr] mb-4">
                  <input type="datetime-local" value={scheduleState.scheduledAt} onChange={(e) => setScheduleState(s => ({ ...s, scheduledAt: e.target.value }))} className="app-input" />
                  <select value={scheduleState.interviewType} onChange={(e) => setScheduleState(s => ({ ...s, interviewType: e.target.value, meetingLink: "", location: "" }))} className="app-input">
                    <option value="online">Online</option>
                    <option value="inperson">In person</option>
                  </select>
                </div>
                {scheduleState.interviewType === "online" ? (
                  <input type="url" placeholder="Meeting Link" value={scheduleState.meetingLink} onChange={(e) => setScheduleState(s => ({ ...s, meetingLink: e.target.value }))} className="app-input mb-4" />
                ) : (
                  <input type="text" placeholder="Location/Address" value={scheduleState.location} onChange={(e) => setScheduleState(s => ({ ...s, location: e.target.value }))} className="app-input mb-4" />
                )}
                <div className="flex gap-3">
                  <button onClick={handleSchedule} className="app-button px-4 py-2 text-sm">{interview?.status === "scheduled" ? "Reschedule" : "Schedule"}</button>
                  {interview?.status === "scheduled" && <button onClick={handleCancelInterview} className="app-button-secondary px-4 py-2 text-sm !text-red-600 border-red-200">Cancel</button>}
                </div>
              </div>

              {interview?.status === "scheduled" && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Current Interview</p>
                  <p className="text-sm text-blue-700">{new Date(interview.scheduledAt).toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">{interview.interviewType === "online" ? interview.meetingLink : interview.location}</p>
                  {interview.responseStatus !== "pending" && (
                    <span className="inline-block mt-2 px-2 py-1 bg-white text-xs font-semibold rounded-md uppercase border border-blue-100">
                      Candidate {interview.responseStatus}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              <form onSubmit={handleAddNote} className="space-y-3 border-b pb-6">
                <div>
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Leave an internal note for your team..." className="app-input resize-none w-full" rows="3" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-500 text-medium">Rating: </span>
                    <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="app-input w-24 px-2 py-1 text-sm bg-stone-50">
                      <option value="0">No Star</option>
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Star{v>1?'s':''}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={!newNote.trim() && !newRating} className="app-button px-4 py-2 text-sm">Add Note</button>
                </div>
              </form>

              <div className="space-y-4">
                {application.notes?.length > 0 ? (
                  application.notes.slice().reverse().map((note, i) => (
                    <div key={i} className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-stone-800">{note.author?.name || "Team Member"}</p>
                          <p className="text-xs text-stone-400">{new Date(note.createdAt).toLocaleString()}</p>
                        </div>
                        {note.rating > 0 && (
                          <div className="flex gap-0.5 text-amber-500 text-sm">
                            {Array.from({length: note.rating}).map((_, j) => <span key={j}>★</span>)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500 italic text-center py-4">No internal notes yet. Leave one to help your team!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
