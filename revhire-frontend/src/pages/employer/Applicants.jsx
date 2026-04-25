import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getJobApplicants, updateApplicationStatus } from "../../services/applicationService";
import { getJobInterviews } from "../../services/interviewService";
import ApplicationModal from "../../components/employer/ApplicationModal";
import { DndContext, closestCorners, useDroppable, useDraggable, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

const STATUSES = ["applied", "shortlisted", "interviewing", "offered", "hired", "rejected"];

function DroppableColumn({ id, title, applications, onCardClick, interviewMap }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex min-w-[320px] w-[320px] flex-col rounded-xl border border-surface-300 bg-white/95 p-4 shadow-sm ring-1 ring-white/70">
      <div className="flex justify-between items-center mb-5 px-1">
        <h3 className="font-bold text-surface-900 capitalize font-display">{title}</h3>
        <span className="rounded-full border border-surface-300 bg-surface-100 px-2.5 py-1 text-[11px] font-bold text-surface-700 shadow-sm">{applications.length}</span>
      </div>
      <div className="flex-1 space-y-4 min-h-[150px]">
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
      className={`premium-card bg-white p-5 cursor-grab shadow-sm transition-all hover:shadow-md hover:border-brand-300 relative ${isDragging && !isOverlay ? 'opacity-40 scale-95' : ''} ${isOverlay ? 'scale-105 shadow-md border-brand-400 rotate-1 cursor-grabbing z-50' : ''}`}
      onClick={(e) => {
        if (!isDragging) {
           e.stopPropagation();
           onClick();
        }
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 to-indigo-500 rounded-l-2xl"></div>
      <div className="font-bold text-[15px] text-surface-900 line-clamp-1 ml-1">{application.jobSeeker?.name}</div>
      <div className="mt-1 ml-1 text-[12px] font-medium text-surface-700">{application.jobSeeker?.email}</div>
      
      {interview && interview.status === "scheduled" && (
        <div className="mt-4 ml-1 inline-block rounded border border-brand-200 bg-brand-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-normal text-brand-700">
          Interview Scheduled
        </div>
      )}
      
      <div className="mt-4 text-[13px] font-bold text-brand-600 flex items-center gap-1.5 group ml-1 opacity-80 hover:opacity-100 transition-opacity">
        <span>View Details</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
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
  const [errorMessage, setErrorMessage] = useState("");

  const fetchApplicants = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [appResult, interviewResult] = await Promise.allSettled([
        getJobApplicants(jobId, token),
        getJobInterviews(jobId, token),
      ]);

      if (appResult.status === "fulfilled") {
        setApplications(appResult.value.applications);

        setSelectedApplication(prev => {
          if (!prev) return null;
          const updated = appResult.value.applications.find((a) => a._id === prev._id);
          if (!updated) return prev;
          // Avoid setting a new reference if the data is same, though removing selectedApplication from hook deps is the main fix
          return JSON.stringify(prev) === JSON.stringify(updated) ? prev : updated;
        });
      } else {
        setApplications([]);
        setErrorMessage(
          appResult.reason?.response?.data?.message || "Unable to load applicants right now.",
        );
      }

      if (interviewResult.status === "fulfilled") {
        setInterviews(interviewResult.value.interviews);
      } else {
        setInterviews([]);
      }
      
      if (appResult.status === "fulfilled" && interviewResult.status === "rejected") {
        setErrorMessage("Applicants loaded, but interview details are temporarily unavailable.");
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Unable to load applicants right now.");
    }
    setIsLoading(false);
  }, [jobId, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchApplicants();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchApplicants]);

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts, allows firing click events
      },
    })
  );

  if (isLoading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 text-surface-500 font-medium font-display">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Loading Kanban Board...
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell relative flex flex-col">
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-brand-300/20 blur-[110px] pointer-events-none"></div>

      <div className="relative z-10 shrink-0 border-b border-surface-200/60 bg-white/50 pb-6 pt-6 backdrop-blur-md">
        <div className="layout-container max-w-none px-6">
          <div className="page-hero flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/employer/dashboard")} className="flex items-center gap-1.5 text-sm font-bold text-surface-700 transition-colors hover:text-brand-700"><span>←</span> Back to Dashboard</button>
              <h1 className="border-l border-surface-300 pl-4 font-display text-2xl font-semibold tracking-tight text-surface-900">Applicants Board</h1>
            </div>
            <div className="flex gap-2 text-[14px]">
              <span className="rounded-full border border-surface-300 bg-white px-4 py-1.5 font-bold text-surface-800 shadow-sm">{applications.length} Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto relative z-10 custom-scrollbar">
        <div className="layout-container max-w-none px-6 py-10 h-full min-h-[calc(100vh-100px)]">
          {errorMessage && (
            <div className="mb-8 rounded-xl border border-warning-200 bg-warning-50 px-5 py-4 text-[14px] font-bold text-warning-800 shadow-sm animate-fade-in">
              {errorMessage}
            </div>
          )}
          {applications.length === 0 && !isLoading ? (
             <div className="premium-card mx-auto mt-10 flex max-w-2xl flex-col items-center rounded-2xl bg-white p-16 text-center shadow-sm">
               <div className="inline-flex w-24 h-24 rounded-full bg-surface-50 items-center justify-center mb-6">
                 <span className="text-4xl">👥</span>
               </div>
               <h3 className="font-bold text-surface-900 text-2xl font-display mb-2">No applicants yet</h3>
               <p className="mt-1 text-[15px] font-medium text-surface-700">Wait for candidates to apply or share your job posting.</p>
             </div>
          ) : (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
              <div className="flex gap-6 h-full items-start pb-8">
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
