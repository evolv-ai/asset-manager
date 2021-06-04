import { generate } from '../guids.js';

let pollAttempt = 0;
const maxPollAttempts = 60;

function gaIntegration() {
    const existingUid = window.localStorage.getItem('evolv:uid');
    if (existingUid) {
        window.evolv.setUid(existingUid);
        return;
    }

    if (pollAttempt > maxPollAttempts) {
        console.warn('Evolv: GA clientId not found, using generated UID');
        const id = generate();

        window.localStorage.setItem('evolv:uid', id);
        window.evolv.setUid(id);
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
