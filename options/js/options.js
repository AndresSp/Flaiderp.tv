'use strict';



chrome.storage.sync.get('config',async function(configFile) {
    const config = JSON.parse(configFile.config)
    const enable = config.enable

    assignEnableSwitch(enable)
    enableSwitchListener(config)
});

chrome.storage.onChanged.addListener(function(changes, areaName) {
    const config = JSON.parse(changes.config.newValue)
    const enable = config.enable

    assignEnableSwitch(enable)
})


function assignEnableSwitch(enable) {
    const enableSwitch = document.querySelector('#enable-switch')

    if(enable){
        enableSwitch.setAttribute('checked','')
    } else {
        enableSwitch.removeAttribute('checked')
    }
}

function enableSwitchListener(configSaved) {
    const enableSwitch = document.querySelector('#enable-switch')

    enableSwitch.addEventListener('change', function () {
        const value = this.checked
        const config = Object.assign(configSaved, { enable: value })
        save(config)
    })
}

function save(config) {
    chrome.storage.sync.set({config : JSON.stringify(config)})
}