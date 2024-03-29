export function storeEventInSession (client, type) {
    client.context.set('fired_events.'+type, true, true);
    const firedEvents = sessionStorage.getItem('evolv:fe');
    let eventsList = {};
    if(firedEvents) {
      const firedEventsObj = JSON.parse(firedEvents);
      firedEventsObj[type] = true;
      eventsList= firedEventsObj;
    } else {
      eventsList[type] = true;
    }
    sessionStorage.setItem('evolv:fe', JSON.stringify(eventsList));
}

function reHydratingFiredEvents (client) {
    const firedEvents = sessionStorage.getItem('evolv:fe');
    if(firedEvents) {
        const firedEventsObj = JSON.parse(firedEvents);
        client.context.set('fired_events', firedEventsObj, true);
    }
}

/**
 * @param {EvolvClient} client
 */
function firedEventsInitialization (client) {
    reHydratingFiredEvents(client)
    client.on("event.emitted", function(topic, type) {
        storeEventInSession(client, type)
    })
}

export default firedEventsInitialization;
