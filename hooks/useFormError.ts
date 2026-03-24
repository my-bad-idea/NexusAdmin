import { FieldValues, UseFormSetError } from 'react-hook-form';

export function useFormError<T extends FieldValues>(setError: UseFormSetError<T>) {
  return function handleError(err: unknown): boolean {
    const apiErr = err as { code?: number; errors?: Record<string, string[]> };
    if (apiErr?.code === 1001 && apiErr.errors) {
      Object.entries(apiErr.errors).forEach(([field, msgs]) => {
        setError(field as Parameters<UseFormSetError<T>>[0], { message: msgs[0] });
      });
      return true;
    }
    return false;
  };
}
