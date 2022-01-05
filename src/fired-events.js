export function eventHandler (client, type) {
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

/**
 * @param {EvolvClient} client
 */
function firedEvents (client) {
    const firedEvents = sessionStorage.getItem('evolv:fe');
    if(firedEvents) {
        const firedEventsObj = JSON.parse(firedEvents);
        client.context.set('fired_events', firedEventsObj, true);
    }
    client.on("event.emitted", function(type) {
        eventHandler(client, type)
    })
}

export default firedEvents;