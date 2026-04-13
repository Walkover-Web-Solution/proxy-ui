import { PROXY_DOM_ID, PublicScriptType } from '@proxy/constant';
import { environment } from '../../../../../../environments/environment';

const SCRIPT_URL = `${environment.proxyServer}/assets/proxy-auth/proxy-auth.js`;

export function buildCodeSnippet(referenceId: string, type: string): string {
    const isAuth = type === PublicScriptType.Authorization;

    const refId = isAuth ? (referenceId ?? '<reference_id>') : PROXY_DOM_ID;
    const referenceIdLine = isAuth ? `\n        referenceId: '${refId}',` : '';
    const authTokenLine = isAuth ? '' : `\n        authToken: 'ENCRYPTED_AUTH_TOKEN',`;

    return `<div id="${refId}"></div>

<script type="text/javascript">
    var configuration = {${referenceIdLine}
        type: '${type}',${authTokenLine}
        success: (data) => {
            console.log('success response', data);
        },
        failure: (error) => {
            console.log('failure reason', error);
        },
    };
</script>
<script
    type="text/javascript"
    onload="initVerification(configuration)"
    src="${SCRIPT_URL}"
></script>`;
}
