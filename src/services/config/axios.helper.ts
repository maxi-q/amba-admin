export const getContentType = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const errorCatchStatus = (error: any): number => {
	const status = error?.response?.status
	return status
}

export const errorCatch = (error: any): string => {
	const message = error?.response?.data?.message

	return message
		? typeof error.response.data.message === 'object'
			? message[0]
			: message
		: error.message
}

export const isValidationError = (error: any): boolean => {
	return error?.response?.status === 422 && 
		   error?.response?.data?.message && 
		   typeof error.response.data.message === 'object';
}

export const extractFieldErrors = (error: any): Record<string, string[]> => {
	if (!isValidationError(error)) {
		return {};
	}

	return error.response.data.message;
}

export const getFirstFieldError = (fieldErrors: Record<string, string[]>, fieldName: string): string => {
	return fieldErrors[fieldName]?.[0] || '';
}

export const hasFieldError = (fieldErrors: Record<string, string[]>, fieldName: string): boolean => {
	return Boolean(fieldErrors[fieldName]?.length);
}