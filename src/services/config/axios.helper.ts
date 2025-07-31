export const getContentType = () => {
  const token = localStorage.getItem('token');
  console.log(token);
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
