export const ENGAGED_EVENT = 'engaged';
export const ENGAGEMENT_SESSION_KEY = 'evolv:engagement-check';
const ENGAGEMENT_THRESHOLD = 10000;


export function addEngagementEmitter(client) {
    _addEngagedUserEventEmitter(client);
    _addTimerEmitter(client, ENGAGEMENT_THRESHOLD);
    _addWebUrlChangeEmitter(client);
    _addNewPageLoadEmitter(sessionStorage)
}


// Exporting for testing
export function _addNewPageLoadEmitter(client, sessionStorage) {
    if (sessionStorage.getItem(ENGAGEMENT_SESSION_KEY)) {
        client.emit(ENGAGED_EVENT);
        return;
    }

    sessionStorage.setItem(ENGAGEMENT_SESSION_KEY, true);
}

export function _addEngagedUserEventEmitter(client) {
    client.on('event.emitted', function(eventType, eventName, metadata) {
        if (metadata && metadata.engagedUser) {
            client.emit(ENGAGED_EVENT);
        }
    });
}

export function _addTimerEmitter(client, engagementThreshold) {
    setTimeout(function() {
        client.emit(ENGAGED_EVENT)
    }, engagementThreshold);
}

export function _addWebUrlChangeEmitter(client) {
    client.on('context.value.changed', function(eventType, key, value, before) {
        if (key === 'web.url' && value !== before) {
            client.emit(ENGAGED_EVENT)
        }
    });
}