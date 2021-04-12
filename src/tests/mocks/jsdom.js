import JSDOM from 'jsdom-global';

export function jsdom(html = ``, options = {}) {
    return JSDOM(html, {
        ...options,
        pretendToBeVisual: true,
        beforeParse(window) {
            global.requestAnimationFrame = window.requestAnimationFrame;
            global.cancelAnimationFrame = window.cancelAnimationFrame;

            let readyState = 'loading';

            Object.defineProperty(window.document, 'readyState', {
                get() {
                    return readyState;
                }
            });

            global.advanceReadyState = (state) => {
                readyState = state;

                const event = new window.Event('readystatechange');
                document.dispatchEvent(event);
            }

            options?.beforeParse?.(window);
        }
    });
}

export default jsdom;
