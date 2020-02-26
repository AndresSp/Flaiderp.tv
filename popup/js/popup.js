'use strict';

chrome.runtime.sendMessage({ origin:'popUpOpened' });

document.addEventListener('DOMContentLoaded', function() {
    const collapsibles = document.querySelectorAll('.collapsible');
    const instCollapsibles = M.Collapsible.init(collapsibles, {});

    var materialboxeds = document.querySelectorAll('.materialboxed');
    var instMaterialBoxeds = M.Materialbox.init(materialboxeds, {});

  });

chrome.runtime.onMessage.addListener(function(resp,sender,sendResponse){
    if(chrome.runtime.id !== sender.id || !resp){
        return
    }

    if(!resp.hasOwnProperty('config') || !resp.hasOwnProperty('streamInfo')){
        return
    }

    const streamers = resp.config.streams
    const flaivethStream = resp.flaivethStream
    const streamsLiveInfo = resp.streamInfo

    manipulateDOM(flaivethStream, streamers, streamsLiveInfo)
});



function createSwitch(status) {
    const check = document.createElement('div')
    check.className = 'switch'

    const label = document.createElement('label')

    const inputCheckbox = document.createElement('input')
    inputCheckbox.type = 'checkbox'
    inputCheckbox.checked = status

    const lever = document.createElement('span')
    lever.className = 'lever z-depth-2'

    label.appendChild(inputCheckbox)
    label.appendChild(lever)

    check.appendChild(label)

    return check
}

function getThumbnailURL(thumbnail_url, width, height) {
    return thumbnail_url
    .replace('{width}', `${width}`)
    .replace('{height}', `${height}`)
}


function manipulateDOM(flaivethStream, streamers, streamsLiveInfo) {
    if(flaivethStream){
        const elmPreview = document.querySelector('#preview')
        flaivethStreamPreview(elmPreview, flaivethStream)

        const elmTitle = document.querySelector('.streamer-title')
        elmTitle.setAttribute('status', 'LIVE')

        const elmBadge = document.querySelector('#status')
        elmBadge.setAttribute('data-badge-caption', 'LIVE')

        const elmFlaiContent = document.querySelector('#flaiveth-card > .card-content')
        flaivethStreamContent(elmFlaiContent, flaivethStream)
    } else {
        const elmTitle = document.querySelector('.streamer-title')
        elmTitle.setAttribute('status', 'OFF')

        const elmBadge = document.querySelector('#status')
        elmBadge.setAttribute('data-badge-caption', 'OFF')

        const elmFlaiContent = document.querySelector('#flaiveth-card > .card-content')
        elmFlaiContent.parentNode.removeChild(elmFlaiContent)
    }

    const elmStreams = document.getElementById('streams');
    createCollapsibleItems(elmStreams, streamers, streamsLiveInfo)

    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(function(collapsible) {
        collapsible.addEventListener('click',  function(event) {
            if(collapsible.hasAttribute('disabled')){
                event.stopPropagation()
            }
          })
      });
}

function flaivethStreamPreview(elmFlai, stream) {
    elmFlai.src = getThumbnailURL(stream.thumbnail_url, 698, 393)
}

function flaivethStreamContent(elmFlai, stream) {
    const parragraph = document.createElement('p')
    const text = document.createTextNode(stream.title)
    parragraph.appendChild(text)
    elmFlai.appendChild(parragraph)
}

function createCollapsibleItems(streamsElement, streamers, streamsLiveInfo){
    for (const key in streamers) {
        if (streamers.hasOwnProperty(key)) {
            const value = streamers[key];

            const li = document.createElement('li')

            const header = document.createElement('div')
            header.className = 'collapsible-header'

            const avatar = document.createElement('img')
            avatar.className = 'circle'
            avatar.width = '25'
            avatar.height = '25'
            avatar.src = `../streamers/${value[0]}.png`

            const name = document.createElement('span')
            name.className = 'streamer-name flai-darkgreen'
            name.textContent = key

            const badge = document.createElement('span')
            badge.className = 'new badge pulse'

            const body = document.createElement('div')
            body.className = 'collapsible-body'

            const bodyContent = document.createElement('div')
            bodyContent.className = 'content'

            const preview = document.createElement('img')

            const p = document.createElement('p')
            p.className = 'truncate'

            const streamOn = streamsLiveInfo
            .find((streamLive) => streamLive.user_id == value[0])
            
            if(streamOn){
                badge.setAttribute('data-badge-caption', 'LIVE')
                const text = document.createTextNode(streamOn.title)
                p.appendChild(text)

                preview.width = '70'
                preview.height = '40'
                preview.src = getThumbnailURL(streamOn.thumbnail_url, 70, 40)
            } else {
                badge.setAttribute('data-badge-caption', 'OFF')

                header.setAttribute('disabled', 'true')
            }

            bodyContent.appendChild(preview)
            bodyContent.appendChild(p)

            body.appendChild(bodyContent)

            header.appendChild(avatar)
            header.appendChild(name)
            //const check = createSwitch(value[1])
            header.appendChild(badge)
            //header.appendChild(check)

            li.appendChild(header)
            li.appendChild(body)

            streamsElement.appendChild(li)
        }
    }

}

function getThumbnailURL(thumbnail_url, width, height) {
    return thumbnail_url
    .replace('{width}', `${width}`)
    .replace('{height}', `${height}`)
}
