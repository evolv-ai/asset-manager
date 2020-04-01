# Evolv Asset Manager

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

If you would like to only render css assets place `data-evolv-js="false"` into the script tag. If you would like to only render js assets place `data-evolv-css="false"` in the script tag.

This snippet handles the bulk of the work needed to run an experiment. It confirms or contaminates users and activates impotent variants when the current context matches the parameters of the experiment. The context is evaluated on things like page, demographics and more.

Once the snippet has loaded, firing an event can be done through the globally excessable client with:

```javascript
evolv.client.emit('my-event');
```

The global object `evolv` has other methods and objects that are now accessable within the context of your webpage. For a manaually activated experiment you can acess `evolv.context` and change the current context to match the requirements of your experiment. For more info on the accessable client methods and their uses see: [javascript-sdk](https://github.com/evolv-ai/javascript-sdk)

There are 3 patterns of use that we forsee. 

1. First is the one described above (simplest implementation). Take the asset manager web loader snippet, place it on the page and it will append the css or js assets to the page's head for you. Creating a unique user and storing the uid in local storage.

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

For more about Evolv and what we do, go [here](https://www.evolv.ai).
