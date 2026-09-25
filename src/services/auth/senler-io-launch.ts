const params = new URLSearchParams(window.location.search);

// Bootstrap hints only select the login flow. The backend verifies launchCode
// before trusting its project ID; never restore another project's stored JWT.
export const senlerIoLaunch = {
  embedded: params.has('launch_code') || params.has('senler_context_version'),
  code: params.get('launch_code'),
};
