'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseActionOptions<TData, TVar> {
  mutationFn: (variables: TVar) => Promise<TData>;
  invalidateKeys?: readonly unknown[][];
  successMessage?: string | ((data: TData) => string);
  onSuccess?: (data: TData) => void;
}

export function useAction<TData = void, TVar = void>({
  mutationFn,
  invalidateKeys = [],
  successMessage = 'Operation successful',
  onSuccess,
}: UseActionOptions<TData, TVar>) {
  const qc = useQueryClient();

  return useMutation<TData, Error, TVar>({
    mutationFn,
    onSuccess: (data) => {
      invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key as string[] }));
      const msg = typeof successMessage === 'function' ? successMessage(data) : successMessage;
      toast.success(msg);
      onSuccess?.(data);
    },
    onError: (err) => toast.error(err.message),
  });
}
