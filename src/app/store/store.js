import { create } from 'zustand';

export const useAssignmentStore = create((set) => ({
  assignmentCount: null, // Initialize as null to distinguish from 0
  setAssignmentCount: (count) => set({ assignmentCount: count }),
  incrementAssignmentCount: () => set((state) => ({
    assignmentCount: state.assignmentCount !== null ? state.assignmentCount + 1 : null
  })),
  decrementAssignmentCount: () => set((state) => ({
    assignmentCount: state.assignmentCount !== null ? state.assignmentCount - 1 : null
  })),
}));