import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import eventsService from '@/services/events/events.service';
import { ApiError } from '@/types';

export function useCheckPromoCodesPrefixAvailable() {
  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof eventsService.checkPromoCodesPrefixAvailable>>,
    ApiError,
    string
  >({
    mutationFn: (prefix: string) => eventsService.checkPromoCodesPrefixAvailable(prefix),
  });

  const isValidationError = useMemo(() =>
    error instanceof ApiError && error.statusCode === 422,
    [error]
  );

  const validationErrors = useMemo(() =>
    error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
    [error]
  );

  const generalError = useMemo(() =>
    error instanceof ApiError && error.statusCode !== 422 ? error.message : '',
    [error]
  );

  return {
    mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
