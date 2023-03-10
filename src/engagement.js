export const ENGAGEMENT_CONTEXT_KEY = 'engaged';
export const ENGAGEMENT_SESSION_KEY = 'evolv:engagement-check';
const ENGAGEMENT_THRESHOLD = 10000;

export function addEngagementEmitter(client) {
    _addEngagedUserEventEmitter(client);
    _addTimerEmitter(client, ENGAGEMENT_THRESHOLD);
    _addWebUrlChangeEmitter(client);
    _addNewPageLoadEmitter(client, sessionStorage)
}


function setEngagedContext(client) {
    if (client.context.get(ENGAGEMENT_CONTEXT_KEY)) return;

    client.context.set(ENGAGEMENT_CONTEXT_KEY, true);
}

// Exporting for testing
export function _addNewPageLoadEmitter(client, sessionStorage) {
    if (sessionStorage.getItem(ENGAGEMENT_SESSION_KEY)) {
        setEngagedContext(client)
        return;
    }

    sessionStorage.setItem(ENGAGEMENT_SESSION_KEY, true);
}

export function _addEngagedUserEventEmitter(client) {
    client.on('event.emitted', function(eventType, eventName, metadata) {
        if (metadata && metadata.engagedUser) {
            setEngagedContext(client)
        }
    });
}

export function _addTimerEmitter(client, engagementThreshold) {
    setTimeout(function() {
        setEngagedContext(client)
    }, engagementThreshold);
}

export function _addWebUrlChangeEmitter(client) {
    client.on('context.value.changed', function(eventType, key, value, before) {
        if (key === 'web.url' && value !== before) {
            setEngagedContext(client)
        }
    });
}