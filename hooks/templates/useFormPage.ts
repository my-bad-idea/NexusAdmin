/**
 * Template hook for standard form pages (create/edit entity).
 * Combines data fetching, form state, and CRUD actions.
 *
 * Preferred for new entity form pages to avoid duplicating
 * the fetch-form-submit-invalidate pattern.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useForm, FieldValues } from 'react-hook-form';
import { useAction } from '@/hooks/useAction';
import { useFormError } from '@/hooks/useFormError';

interface UseFormPageOptions<TFormData extends FieldValues, TEntity> {
  resource: string;
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  fetchFn?: (id: string) => Promise<TEntity>;
  toFormValues?: (entity: TEntity) => TFormData;
  submitFn: (data: TFormData) => Promise<unknown>;
  invalidateKeys?: readonly unknown[][];
  onSuccess?: () => void;
}

export function useFormPage<TFormData extends FieldValues, TEntity = TFormData>({
  resource,
  id,
  schema,
  fetchFn,
  toFormValues,
  submitFn,
  invalidateKeys = [],
  onSuccess,
}: UseFormPageOptions<TFormData, TEntity>) {
  const isEdit = Boolean(id);

  const { data: entityData, isLoading } = useQuery({
    queryKey: [resource, id],
    queryFn: () => fetchFn!(id!),
    enabled: isEdit && Boolean(fetchFn),
  });

  const form = useForm<TFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: schema ? (async (values: TFormData, context: any, options: any) => {
      const { zodResolver } = await import('@hookform/resolvers/zod');
      return zodResolver(schema)(values, context, options);
    }) : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: (entityData && toFormValues ? toFormValues(entityData) : undefined) as any,
  });

  const handleFormError = useFormError(form.setError);

  const action = useAction<unknown, TFormData>({
    mutationFn: submitFn,
    invalidateKeys: [...invalidateKeys, [resource]],
    successMessage: isEdit ? `${resource} updated` : `${resource} created`,
    onSuccess,
  });

  const submit = form.handleSubmit(async (data) => {
    try {
      await action.mutateAsync(data);
    } catch (err) {
      handleFormError(err);
    }
  });

  return { form, isEdit, isLoading, isPending: action.isPending, submit };
}
