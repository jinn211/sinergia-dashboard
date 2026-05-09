import { useState, useEffect } from 'react';
import type { Process, PieceStatus } from '../types';
import { MOCK_PROCESSES } from '../mockData';

let processesData: Process[] = [...MOCK_PROCESSES];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(l => l());
}

export function getProcesses() { return processesData; }
export function getProcess(id: string) { return processesData.find(p => p.id === id); }

function computeProcessStatus(process: Process): { status: Process['status']; progress: number } {
  const all = [...process.images, ...process.copies];
  const total = all.length;
  if (total === 0) return { status: 'processing', progress: 0 };

  const approved    = all.filter(p => p.status === 'approved').length;
  const generating  = all.filter(p => p.status === 'generating' || p.status === 'regenerating').length;
  const waiting     = all.filter(p => p.status === 'waiting-review').length;

  const progress = Math.round((approved / total) * 100);

  if (approved === total)           return { status: 'completed', progress: 100 };
  if (waiting > 0 && generating === 0) return { status: 'waiting', progress };
  return { status: 'processing', progress };
}

export function addProcess(process: Process) {
  processesData = [process, ...processesData];
  notify();
}

export function updateImageStatus(processId: string, imageId: string, status: PieceStatus, feedback?: string) {
  processesData = processesData.map(p => {
    if (p.id !== processId) return p;
    const updated = { ...p, images: p.images.map(img => img.id === imageId ? { ...img, status, feedback } : img) };
    const computed = computeProcessStatus(updated);
    return { ...updated, status: computed.status, progress: computed.progress };
  });
  notify();
}

export function updateCopyStatus(processId: string, copyId: string, status: PieceStatus, feedback?: string) {
  processesData = processesData.map(p => {
    if (p.id !== processId) return p;
    const updated = { ...p, copies: p.copies.map(c => c.id === copyId ? { ...c, status, feedback } : c) };
    const computed = computeProcessStatus(updated);
    return { ...updated, status: computed.status, progress: computed.progress };
  });
  notify();
}

// Clean hook — subscribes once, updates only when store changes
export function useProcessStore() {
  const [processes, setProcesses] = useState<Process[]>(getProcesses());
  const [currentProcess, setCurrentProcess] = useState<Process | undefined>(undefined);

  useEffect(() => {
    const update = () => setProcesses([...getProcesses()]);
    listeners.push(update);
    return () => { listeners = listeners.filter(l => l !== update); };
  }, []);

  const refreshProcess = (id: string) => {
    setCurrentProcess(getProcess(id));
  };

  return { processes, getProcess, refreshProcess, currentProcess, addProcess, updateImageStatus, updateCopyStatus };
}
