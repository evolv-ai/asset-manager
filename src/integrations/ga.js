let pollAttempt = 0;
const maxPollAttempts = 60;

function gaIntegration() {
    if (pollAttempt > maxPollAttempts) {
        console.warn('Evolv: GA clientId not found, using generated UID');

        window.evolv.generateUid();
        window.evolv.client.emit('evolv-uid.generated');
        return;
    }

    if (typeof window.ga === 'function' ) {
        setUidFromGaCid();
    } else {
        retry();
    }
}

function retry() {
    pollAttempt++;
    setTimeout(gaIntegration, 0);
}

function setUidFromGaCid() {
    window.ga(function () {
        var trackers = window.ga.getAll();
        if (trackers.length === 0) {
            retry();
        } else {
            window.evolv.setUid(trackers[0].get('clientId'));
        }
    });
}

function isValidGaClientId(cid) {
    return /^\d+[.|_]\d+$/.test(cid);
}

export { gaIntegration, isValidGaClientId };
