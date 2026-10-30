/** Authorization mode mounts at the configured reference ID. */
export const WIDGET_EXAMPLE = `<div id="YOUR_REFERENCE_ID"></div>
<p id="auth-status" role="status"></p>
<script>
  const configuration = {
    referenceId: 'YOUR_REFERENCE_ID',
    type: 'authorization',
    theme: 'system',
    success: function (result) {
      // Hand off privately to your application's session flow.
      // Verify the result on your server before granting access.
      document.getElementById('auth-status').textContent =
        'Authentication completed. Continue in your application.';
    },
    failure: function () {
      document.getElementById('auth-status').textContent =
        'Authentication failed. Please try again.';
    }
  };
</script>
<script src="WIDGET_ORIGIN/assets/proxy-auth/proxy-auth.js"
        onload="window.initVerification(configuration)"></script>`;
