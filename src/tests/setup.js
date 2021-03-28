beforeEach(function() {
    global.performance = {
        timing: {
            domContentLoadedEventStart: (new Date()).getTime()
        }
    };
});
