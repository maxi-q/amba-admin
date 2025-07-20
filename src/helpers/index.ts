export const getUrlParams = () => {
  const url = window.location.href;
  const params = new URLSearchParams(new URL(url).search);

  return {
    sign: params.get('sign') || '',
    senlerGroupId: params.get('group_id') || '',
    senlerUserId: params.get('user_id') || '',
    context: params.get('context') || '',
    senlerChannelTypeId: params.get('channel_type_id') || '',
  };
};
