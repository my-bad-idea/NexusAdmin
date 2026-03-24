import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'table' | 'card';

interface TableViewState {
  viewModes: Record<string, ViewMode>;
  setViewMode: (tableId: string, mode: ViewMode) => void;
  getViewMode: (tableId: string) => ViewMode;
}

export const useTableViewStore = create<TableViewState>()(
  persist(
    (set, get) => ({
      viewModes: {},
      setViewMode: (tableId, mode) =>
        set((s) => ({ viewModes: { ...s.viewModes, [tableId]: mode } })),
      getViewMode: (tableId) => get().viewModes[tableId] ?? 'table',
    }),
    { name: 'nexus-table-view' }
  )
);

export function useTableViewMode(tableId: string): [ViewMode, (mode: ViewMode) => void] {
  const viewMode = useTableViewStore((s) => s.viewModes[tableId] ?? 'table');
  const setViewMode = useTableViewStore((s) => s.setViewMode);
  return [viewMode, (mode) => setViewMode(tableId, mode)];
}
