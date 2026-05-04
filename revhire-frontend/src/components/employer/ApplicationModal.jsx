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
    } catch {
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
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-surface-950/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white max-w-4xl w-full rounded-lg shadow-md overflow-hidden flex flex-col max-h-[90vh] border border-brand-100">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-surface-300 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-surface-900 font-display">{application.jobSeeker?.name}</h2>
            <p className="mt-0.5 text-[14px] font-medium text-surface-700">{application.jobSeeker?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={application.status}
              onChange={(e) => {
                onUpdateStatus(application._id, e.target.value);
                onClose();
              }}
              className="input-field w-auto min-w-[140px] px-3 py-1.5 text-sm font-bold border-surface-200"
            >
              {["applied", "shortlisted", "interviewing", "offered", "hired", "rejected"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button onClick={onClose} className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]">
              <span className="text-lg leading-none">✕</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-200 shrink-0 px-2 sm:px-6 overflow-x-auto hide-scrollbar">
          {["overview", "resume", "interviews", "notes"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`whitespace-nowrap border-b-2 px-4 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-colors ${activeTab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-surface-700 hover:bg-surface-100 hover:text-surface-900'}`}
            >
              {t}
              {t === "notes" && application.notes?.length > 0 && ` (${application.notes.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          {message && <div className="mb-6 text-[14px] font-bold text-emerald-700 bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-200 animate-fade-in">{message}</div>}
          
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {application.answers?.length > 0 && (
                <div className="premium-card p-6 border-surface-200 shadow-sm bg-white">
                  <h3 className="mb-4 text-[12px] font-bold uppercase tracking-normal text-surface-600">Screening Answers</h3>
                  <div className="space-y-4">
                    {application.answers.map((a, i) => (
                      <div key={i} className="rounded-lg border border-brand-100 bg-brand-50/40 p-4">
                        <p className="text-[14px] font-bold text-surface-800">{a.question}</p>
                        <p className="mt-2 flex items-start gap-2 text-[14px] font-medium text-surface-700">
                          <span className="text-brand-500 font-bold">Answer:</span> {a.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {application.coverLetter ? (
                <div className="premium-card p-6 border-surface-200 shadow-sm bg-white">
                  <h3 className="text-[12px] font-bold uppercase tracking-normal text-surface-400 mb-4">Cover Letter</h3>
                  <p className="text-[15px] font-medium text-surface-700 leading-relaxed whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              ) : (
                <p className="rounded-lg border border-brand-100 bg-brand-50/40 p-4 text-center text-[14px] font-medium italic text-surface-700">No cover letter provided.</p>
              )}
            </div>
          )}

          {activeTab === "resume" && (
            <div className="space-y-6 animate-fade-in">
              {application.resume ? (
                <>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => downloadResumePdf(application.jobSeeker, application.resume)} className="btn-primary py-2 text-[14px]">
                       Download PDF
                    </button>
                    {application.resume.uploadedFile?.dataUrl && (
                      <a
                        href={application.resume.uploadedFile.dataUrl}
                        download={application.resume.uploadedFile.fileName || "resume-file"}
                        className="btn-secondary py-2 text-[14px]"
                      >
                        Download Uploaded File
                      </a>
                    )}
                  </div>
                  <div className="premium-card p-1 shadow-sm border-surface-200 overflow-hidden bg-white">
                    <ResumePreview user={application.jobSeeker} resume={application.resume} />
                  </div>
                </>
              ) : (
                <p className="rounded-lg border border-brand-100 bg-brand-50/40 p-6 text-center text-[14px] font-medium text-surface-700">Applicant has not provided a resume builder profile.</p>
              )}
            </div>
          )}

          {activeTab === "interviews" && (
            <div className="space-y-6 animate-fade-in">
              <div className="premium-card p-6 border-surface-200 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-surface-900 font-display mb-5">{interview?.status === "scheduled" ? "Reschedule Interview" : "Schedule Interview"}</h3>
                <div className="grid gap-4 sm:grid-cols-[1fr,1fr] mb-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-normal text-surface-500 mb-2">Date & Time</label>
                    <input type="datetime-local" value={scheduleState.scheduledAt} onChange={(e) => setScheduleState(s => ({ ...s, scheduledAt: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-normal text-surface-500 mb-2">Format</label>
                    <select value={scheduleState.interviewType} onChange={(e) => setScheduleState(s => ({ ...s, interviewType: e.target.value, meetingLink: "", location: "" }))} className="input-field">
                      <option value="online">Online</option>
                      <option value="inperson">In person</option>
                    </select>
                  </div>
                </div>
                {scheduleState.interviewType === "online" ? (
                  <div className="mb-6">
                    <label className="block text-[11px] font-bold uppercase tracking-normal text-surface-500 mb-2">Meeting Link</label>
                    <input type="url" placeholder="https://zoom.us/..." value={scheduleState.meetingLink} onChange={(e) => setScheduleState(s => ({ ...s, meetingLink: e.target.value }))} className="input-field" />
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-[11px] font-bold uppercase tracking-normal text-surface-500 mb-2">Location / Address</label>
                    <input type="text" placeholder="Office Location" value={scheduleState.location} onChange={(e) => setScheduleState(s => ({ ...s, location: e.target.value }))} className="input-field" />
                  </div>
                )}
                <div className="flex gap-3 pt-2 border-t border-surface-100">
                  <button onClick={handleSchedule} className="btn-primary py-2 text-[14px]">
                    {interview?.status === "scheduled" ? "Confirm Reschedule" : "Confirm Schedule"}
                  </button>
                  {interview?.status === "scheduled" && (
                    <button onClick={handleCancelInterview} className="px-5 py-2 text-[14px] font-bold text-error-600 border border-error-200 bg-error-50 hover:bg-error-100 transition-colors rounded-lg shadow-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {interview?.status === "scheduled" && (
                <div className="premium-card p-5 border-brand-200 bg-brand-50/50 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>
                  <p className="text-[12px] font-bold uppercase tracking-normal text-brand-600 mb-2 ml-2">Current Interview</p>
                  <p className="text-[16px] font-bold text-surface-900 ml-2">{new Date(interview.scheduledAt).toLocaleString()}</p>
                  <p className="text-[14px] font-medium text-surface-600 mt-1 ml-2">{interview.interviewType === "online" ? interview.meetingLink : interview.location}</p>
                  {interview.responseStatus !== "pending" && (
                     <span className="inline-flex mt-4 ml-2 items-center px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider border border-brand-200 bg-white text-brand-700 shadow-sm">
                       Candidate {interview.responseStatus}
                     </span>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6 animate-fade-in">
              <form onSubmit={handleAddNote} className="premium-card p-6 shadow-sm border-surface-200 bg-white">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-normal text-surface-500 mb-2">Internal Note</label>
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Leave an internal note for your team..." className="input-field resize-none w-full" rows="3" />
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-surface-100">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold uppercase tracking-normal text-surface-400">Rating</span>
                    <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="input-field w-32 px-3 py-1.5 text-[14px] font-bold bg-surface-50 border-surface-200 rounded-lg">
                      <option value="0">No Star</option>
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Star{v>1?'s':''}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={!newNote.trim() && !newRating} className="btn-primary py-2 text-[14px]">
                    Add Note
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {application.notes?.length > 0 ? (
                  application.notes.slice().reverse().map((note, i) => (
                    <div key={i} className="premium-card p-5 bg-white border-surface-200 shadow-sm relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-200 transition-colors group-hover:bg-brand-400"></div>
                      <div className="flex justify-between items-start mb-3 ml-2">
                        <div>
                          <p className="text-[14px] font-bold text-surface-900">{note.author?.name || "Team Member"}</p>
                          <p className="text-[11px] font-bold uppercase tracking-normal text-surface-400 mt-0.5">{new Date(note.createdAt).toLocaleString()}</p>
                        </div>
                        {note.rating > 0 && (
                          <div className="flex gap-0.5 text-brand-500 text-lg">
                            {Array.from({length: note.rating}).map((_, j) => <span key={j}>★</span>)}
                          </div>
                        )}
                      </div>
                      <p className="text-[14px] font-medium text-surface-600 whitespace-pre-wrap ml-2 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                ) : (
                <p className="text-[14px] font-medium text-surface-500 italic text-center py-6 bg-brand-50/40 border border-brand-100 rounded-lg">No internal notes yet. Leave one to help your team.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
