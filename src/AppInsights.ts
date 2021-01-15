// From:  https://docs.microsoft.com/en-us/azure/azure-monitor/app/javascript-react-plugin
import { ApplicationInsights, DistributedTracingModes } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

const browserHistory = createBrowserHistory({ basename: '' });
const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
    config: {
        instrumentationKey: process.env.REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY,
        disableFetchTracking: false,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        correlationHeaderExcludedDomains: [],
        distributedTracingMode: DistributedTracingModes.W3C,
        isCookieUseDisabled: true,
        isStorageUseDisabled: true,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: { history: browserHistory }
        }
    }
});
appInsights.loadAppInsights();
export { reactPlugin, appInsights };