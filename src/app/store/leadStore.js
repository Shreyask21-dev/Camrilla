// /store/leadStore.js
import { create } from 'zustand';

const useLeadStore = create((set) => ({
  leadCount: 0,
  setLeadCount: (count) => set({ leadCount: count }),
  incrementLeadCount: () => set((state) => ({ leadCount: state.leadCount + 1 })),
  decrementLeadCount: () => set((state) => ({ leadCount: Math.max(0, state.leadCount - 1) })),
}));

export default useLeadStore;
