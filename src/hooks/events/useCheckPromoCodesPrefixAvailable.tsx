import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { eventsControllerCheckPromoCodesPrefixAvailable } from '@/api/generated/events/events';
import { ApiError } from '@/types';

export function useCheckPromoCodesPrefixAvailable() {
  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof eventsControllerCheckPromoCodesPrefixAvailable>>,
    ApiError,
    string
  >({
    mutationFn: (prefix: string) =>
      eventsControllerCheckPromoCodesPrefixAvailable({ promoCodesPrefix: prefix }),
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
