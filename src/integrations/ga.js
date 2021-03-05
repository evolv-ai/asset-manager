let pollAttempt = 0;
const maxPollAttempts = 60;

function gaIntegration() {
    if (pollAttempt > maxPollAttempts) {
        console.log('Evolv: unable to set uid');
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

export { gaIntegration };
