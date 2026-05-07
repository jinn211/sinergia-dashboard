import { useState, useCallback } from 'react';
import type { Process, PieceStatus } from '../types';
import { MOCK_PROCESSES } from '../mockData';

let processesData: Process[] = [...MOCK_PROCESSES];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(l => l());
}

export function getProcesses() {
  return processesData;
}

export function getProcess(id: string) {
  return processesData.find(p => p.id === id);
}

export function addProcess(process: Process) {
  processesData = [process, ...processesData];
  notify();
}

export function updateImageStatus(processId: string, imageId: string, status: PieceStatus, feedback?: string) {
  processesData = processesData.map(p => {
    if (p.id !== processId) return p;
    return {
      ...p,
      images: p.images.map(img =>
        img.id === imageId ? { ...img, status, feedback } : img
      ),
    };
  });
  notify();
}

export function updateCopyStatus(processId: string, copyId: string, status: PieceStatus, feedback?: string) {
  processesData = processesData.map(p => {
    if (p.id !== processId) return p;
    return {
      ...p,
      copies: p.copies.map(c =>
        c.id === copyId ? { ...c, status, feedback } : c
      ),
    };
  });
  notify();
}

export function useProcessStore() {
  const [, setVersion] = useState(0);

  const subscribe = useCallback(() => {
    const forceUpdate = () => setVersion(v => v + 1);
    listeners.push(forceUpdate);
    return () => { listeners = listeners.filter(l => l !== forceUpdate); };
  }, []);

  return { subscribe, getProcesses, getProcess, addProcess, updateImageStatus, updateCopyStatus };
}
