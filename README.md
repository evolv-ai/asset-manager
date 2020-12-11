# Evolv Experience Accelerator

Tool used for managing Evolv created variants.

## Setup 

### Web

Drop the following snippet in the head of your webpage(s). Preferrably as high as possible. 

*Note: You can find your "environment_id" in the Evolv manager or by contacting support.*

```html
<head>
    <!-- evolv asset manager -->
    <script
        src="https://media.evolv.ai/asset-manager/releases/latest/webloader.min.js"
        data-evolv-environment="<environment_id>"
    ></script>
</head>
```

If you would like to only render css assets place `data-evolv-js="false"` into the script tag. If you would like to only render js assets place `data-evolv-css="false"` into the script tag.

This snippet handles the bulk of the work needed to run an experiment. It confirms or contaminates users and activates dormant variants when the current context matches the parameters of the experiment. The context is evaluated on things like page, demographics and more.

Once the snippet has loaded, firing an event can be done through the globally accessible client with:

```javascript
evolv.client.emit('my-event');
```

The global object `evolv` has other methods and properties that are now accessible within the context of your webpage. For a manually activated experiment you can access `evolv.context` and change the current context to match the requirements of your experiment. For more info on the accessible client methods and their uses see: [javascript-sdk](https://github.com/evolv-ai/javascript-sdk)

There are 3 patterns of use that we foresee. 

1. First is the one described above (simplest implementation). Place the asset manager web loader snippet onto the page, and it will append the css or js assets to the page's `<head>` for you and will create a unique user and store the uid in local storage.

2. The second is a small alteration of the first. Follow the same steps but pass in a uid using the `data-evolv-uid` parameter on the script tag. With this approach no ids or information is stored on the client.

```html
<head>
    <script
        src="https://media.evolv.ai/asset-manager/releases/latest/webloader.min.js"
        data-evolv-environment="<environment_id>"
        data-evolv-uid="<uid>"
    ></script>
</head>
```

However since it is unlikely that a uid will be entered statically, it is more likely to add this attribute in dynamically via a tag manager:

```javascript
var evolvScript = document.createElement('script');

evolvScript.setAttribute('src', 'https://media.evolv.ai/asset-manager/releases/latest/webloader.min.js');
evolvScript.setAttribute('data-evolv-environment', '<environment_id>');
evolvScript.setAttribute('data-evolv-uid', '<uid>');

document.head.appendChild(evolvScript);
```

3. Third is a server side rendering approach. The two options above automatically append the needed css and / or js assets on the page for you. In this approach the implementer would render these assets serverside. Placing them on the page along with the asset manager webloader. This approach reduces the round trip calls needed for variant rendering and leads to a faster implementation.

```html
<head>
    <link rel="stylesheet" type="text/css" href="https://participants.evolv.ai/v1/<environment_id>/<uid>/assets.css">
    <script type="text/javascript" src="https://participants.evolv.ai/v1/<environment_id>/<uid>/assets.js"></script>
    <script
        src="https://media.evolv.ai/asset-manager/releases/latest/webloader.min.js"
        data-evolv-environment="<environment_id>"
        data-evolv-uid="<uid>"
        data-evolv-css="false"
        data-evolv-js="false"
    ></script>
</head>
```

### Additional data parameters
#### data-evolv-timeout 
can be passed in to contaminate participants where we try to render the javascript changes great this time in ms after domContentLoadedEventStart time.

Default is 60000ms

#### data-evolv-use-cookies
Evolv uses local storage by default - this method can only look up data stored in the same subdomain. If the user id is required to be used cross subdomain, this setting can be used.

true - will set the cookie on the current domain
*.example.com (e.g.) can be used to set the cookie on the apex domain

```html
<head>
    <script type="text/javascript" src="https://participants.evolv.ai/v1/<environment_id>/<uid>/assets.js"></script>
    <script
        src="https://media.evolv.ai/asset-manager/releases/latest/webloader.min.js"
        data-evolv-environment="<environment_id>"
        data-evolv-timeout="<timeout-length-in-ms>"
        data-evolv-use-cookies="<target domain or true>"
    ></script>
</head>
```

### Rerunning all variants
To reapply all active keys, call
```
evolv.rerun();
```

To reapply a subset of active keys, pass in the prefix to apply the keys within
```
evolv.rerun('a1b2c3d4.e5f6g7h8');
```

### Handling SPA Pushstate
A only popstate events are defined by browsers, not pushstate. This means Evolv cannot detect forward navigation events that do not change the URL. This is common in SPAs and can prevent Evolv from detecting the change and applying changes.
Setting Evolv data-evolv-pushstate to true will apply a patch to the history.pushState that will dispatch a pushstate event


For more about Evolv and what we do, please visit [here](https://www.evolv.ai).
