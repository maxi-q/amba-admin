export const getUrlParams = () => {
  const url = window.location.href;
  const params = new URLSearchParams(new URL(url).search);

  const urlSign = params.get('sign');
  const urlSenlerGroupId = params.get('group_id');
  const urlSenlerUserId = params.get('user_id');
  const urlContext = params.get('context');
  const urlSenlerChannelTypeId = params.get('channel_type_id');

  const storedSign = localStorage.getItem('sign') || '';
  const storedSenlerGroupId = localStorage.getItem('senlerGroupId') || '';
  const storedSenlerUserId = localStorage.getItem('senlerUserId') || '';
  const storedContext = localStorage.getItem('context') || '';
  const storedSenlerChannelTypeId = localStorage.getItem('senlerChannelTypeId') || '';

  const sign = urlSign || storedSign;
  const senlerGroupId = urlSenlerGroupId || storedSenlerGroupId;
  const senlerUserId = urlSenlerUserId || storedSenlerUserId;
  const context = urlContext || storedContext;
  const senlerChannelTypeId = urlSenlerChannelTypeId || storedSenlerChannelTypeId;

  if (urlSign) localStorage.setItem('sign', urlSign);
  if (urlSenlerGroupId) localStorage.setItem('senlerGroupId', urlSenlerGroupId);
  if (urlSenlerUserId) localStorage.setItem('senlerUserId', urlSenlerUserId);
  if (urlContext) localStorage.setItem('context', urlContext);
  if (urlSenlerChannelTypeId) localStorage.setItem('senlerChannelTypeId', urlSenlerChannelTypeId);

  return {
    sign,
    senlerGroupId,
    senlerUserId,
    context,
    senlerChannelTypeId,
  };
};
