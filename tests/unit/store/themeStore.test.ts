import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '@/store/themeStore';

beforeEach(() => {
  useThemeStore.setState({ mode: 'system' });
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
  // Mock document.documentElement.setAttribute
  vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(() => {});
});

describe('themeStore', () => {
  it('starts with system mode', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('setMode updates the mode', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('setMode to light sets data-theme="light"', () => {
    useThemeStore.getState().setMode('light');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
  });

  it('setMode to dark sets data-theme="dark"', () => {
    useThemeStore.getState().setMode('dark');
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('can cycle through all modes', () => {
    const { setMode } = useThemeStore.getState();
    (['light', 'dark', 'system'] as const).forEach((m) => {
      setMode(m);
      expect(useThemeStore.getState().mode).toBe(m);
    });
  });
});
