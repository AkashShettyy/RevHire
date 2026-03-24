import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getJobApplicants, updateApplicationStatus } from "../../services/applicationService";
import { getJobInterviews } from "../../services/interviewService";
import ApplicationModal from "../../components/employer/ApplicationModal";
import { DndContext, closestCorners, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core';

const STATUSES = ["applied", "shortlisted", "interviewing", "offered", "hired", "rejected"];

function DroppableColumn({ id, title, applications, onCardClick, interviewMap }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="bg-stone-50 rounded-2xl p-4 flex flex-col min-w-[300px] w-[300px] border border-stone-200 shadow-sm">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-semibold text-stone-800 capitalize">{title}</h3>
        <span className="text-xs font-bold bg-white border text-stone-600 px-2.5 py-1 rounded-full shadow-sm">{applications.length}</span>
      </div>
      <div className="flex-1 space-y-3 min-h-[150px]">
        {applications.map(app => (
          <DraggableCard key={app._id} application={app} interview={interviewMap.get(app._id)} onClick={() => onCardClick(app, interviewMap.get(app._id))} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ application, interview, onClick, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application._id,
    data: { status: application.status }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white border border-stone-200 rounded-xl p-4 cursor-grab shadow-sm transition-all hover:shadow-md hover:border-blue-300 relative ${isDragging && !isOverlay ? 'opacity-40 scale-95' : ''} ${isOverlay ? 'scale-105 shadow-xl border-blue-400 rotate-1 cursor-grabbing z-50' : ''}`}
      onClick={(e) => {
        if (!isDragging) {
           e.stopPropagation();
           onClick();
        }
      }}
    >
      <div className="font-bold text-stone-900 line-clamp-1">{application.jobSeeker?.name}</div>
      <div className="text-xs text-stone-500 mt-1">{application.jobSeeker?.email}</div>
      
      {interview && interview.status === "scheduled" && (
        <div className="text-[10px] font-bold uppercase tracking-wide mt-3 text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded-md border border-blue-100">
          Interview Scheduled
        </div>
      )}
      
      <div className="mt-3 text-xs font-semibold text-blue-600 flex items-center gap-1 group">
        <span>View Details</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </div>
  );
}

export default function Applicants() {
  const { jobId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchApplicants(); }, [jobId]);

  async function fetchApplicants() {
    setIsLoading(true);
    try {
      const [appData, intData] = await Promise.all([
        getJobApplicants(jobId, token),
        getJobInterviews(jobId, token),
      ]);
      setApplications(appData.applications);
      setInterviews(intData.interviews);
      
      if (selectedApplication) {
         const updated = appData.applications.find(a => a._id === selectedApplication._id);
         if (updated) setSelectedApplication(updated);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }

  const interviewMap = new Map(interviews.map(i => [i.application?._id, i]));

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;
    const applicationId = active.id;
    const newStatus = over.id;
    
    const app = applications.find(a => a._id === applicationId);
    if (app && app.status !== newStatus) {
      // Optimistic update
      setApplications(apps => apps.map(a => a._id === applicationId ? {...a, status: newStatus} : a));
      
      try {
        await updateApplicationStatus(applicationId, newStatus, token);
        await fetchApplicants();
      } catch {
        // Revert on failure
        fetchApplicants();
      }
    }
  }

  function handleDragStart(event) {
    setActiveDragId(event.active.id);
  }

  const activeApp = activeDragId ? applications.find(a => a._id === activeDragId) : null;

  if (isLoading && applications.length === 0) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500 font-medium">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading Kanban Board...
        </div>
      </div>
    );
  }

  return (
    <div className="app-page flex flex-col h-screen overflow-hidden">
      <div className="app-hero shrink-0 border-b border-stone-200">
        <div className="app-shell max-w-none py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/employer/dashboard")} className="text-sm font-semibold text-stone-500 transition-colors hover:text-blue-700">← Back to Dashboard</button>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 border-l border-stone-300 pl-4">Applicants Board</h1>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="font-semibold text-stone-700 bg-white px-3 py-1.5 rounded-full border">{applications.length} Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto bg-stone-50/30">
        <div className="app-shell max-w-none py-8 h-full">
          {applications.length === 0 && !isLoading ? (
             <div className="app-empty mt-10 max-w-2xl mx-auto bg-white border shadow-sm rounded-2xl p-10 text-center flex flex-col items-center">
               <p className="mb-4 text-4xl">👥</p>
               <p className="font-bold text-stone-800 text-lg">No applicants yet</p>
               <p className="mt-1 text-sm text-stone-500">Wait for candidates to apply or share your job posting.</p>
             </div>
          ) : (
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
              <div className="flex gap-5 h-full items-start">
                {STATUSES.map(status => (
                  <DroppableColumn 
                    key={status} 
                    id={status} 
                    title={status} 
                    applications={applications.filter(a => a.status === status)}
                    interviewMap={interviewMap}
                    onCardClick={(app) => setSelectedApplication(app)}
                  />
                ))}
              </div>
              <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeApp ? <DraggableCard application={activeApp} interview={interviewMap.get(activeApp._id)} isOverlay /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          interview={interviewMap.get(selectedApplication._id)}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={async (id, status) => {
            await updateApplicationStatus(id, status, token);
            fetchApplicants();
          }}
          onRefresh={fetchApplicants}
        />
      )}
    </div>
  );
}
