'use strict';

const flaivethId = 144360146; //flaiveth UserId

dropdownListeners()

chrome.storage.sync.get('config',async function(configFile) {
    const config = JSON.parse(configFile.config)

    const otherStreamers = Object.values(config.streams)
    .filter((configArray) => configArray[1])
    .map((configArray) => configArray[0]);
    
    const streamers = [flaivethId].concat(otherStreamers);
    const data = await requestStreams(streamers)

    if(!data){
        return
    }

    const streamInfo = streamers.map((streamer) => checkStreamFromResponse(data, streamer)
    ).filter(streamOn => streamOn) //filter streams offlines

    const flaivethStream = streamInfo.find((stream) => stream.user_id == flaivethId)

    manipulateFlaivethInfo(flaivethStream)
    manipulateOtherStreams(config.streams, streamInfo)
});

async function requestStreams(userIds) {
    try {
        const response = await twitchAPIRequest(userIds)
        if(!response){
            return
        } 
        const data = await response.data
        return data 
    } catch (error) {
        errorHandler(error, requestStreams.name)
    }
}

async function twitchAPIRequest(userIds) {
    const url = new URL('https://api.twitch.tv/helix/streams');
    try {
        userIds.map((userId) => url.searchParams.append('user_id', userId))
        const response = await fetch(url, {
       headers: {
        'Content-Type': 'application/json',
        'Client-ID': '17v1noul6hr06tipzfaggsspuevmxt'
        }
    })
        return await response.json()
    } catch (error) {
        errorHandler(error, twitchAPIRequest.name)
    }
}

function checkStreamFromResponse(data, userIdToCheck) {
    try {
        if(data.length > 0){
            const streamData = data.find((stream) => stream.user_id == userIdToCheck)
            if(!streamData){
                return
            }
            const streamOn = streamData.viewer_count !== null
            return streamOn ? streamData : undefined
         }
         return 
    } catch (error) {
        errorHandler(error, checkStreamFromResponse.name)
    }
}

const errorHandler = (error, functionName) => {
    if(!error.message){
        throw(`An unexpected error(${functionName}):${error}`)
    }
        switch (error.message) {
            case 'Failed to fetch':
                console.debug('Internet Disconnected')
            break;
            default: throw(`An unexpected error(${functionName}):${error}`)
        }
}

//==========DOM=========//

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

function manipulateLoading(enable){
    const loading = document.querySelector('#loading-overlay')
    if(enable){
        loading.classList.remove('d-none')
        loading.classList.add('d-block')
    } else {
        loading.classList.remove('d-block')
        loading.classList.add('d-none') 
    }
}

function manipulateOtherStreams(streamers, streamsLiveInfo) {
    console.log(streamers, streamsLiveInfo)
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

function manipulateFlaivethInfo(flaivethStream) {
    if(flaivethStream){
        const elmPreview = document.querySelector('#preview')
        flaivethStreamPreview(elmPreview, flaivethStream)

        const elmTitle = document.querySelector('.streamer-title')
        elmTitle.setAttribute('status', 'LIVE')

        const elmBadge = document.querySelector('#status')
        elmBadge.className = 'new badge flaiveth pulse'
        elmBadge.setAttribute('data-badge-caption', 'LIVE')

        const elmFlaiContent = document.querySelector('#flaiveth-card > .card-content')
        
        flaivethStreamContent(elmFlaiContent, flaivethStream)
    } else {
        //const elmPreview = document.querySelector('#preview')

        const elmTitle = document.querySelector('.streamer-title')
        elmTitle.setAttribute('status', 'OFF')

        const elmBadge = document.querySelector('#status')
        elmBadge.className = 'new badge flaiveth pulse'
        elmBadge.setAttribute('data-badge-caption', 'OFF')

        const elmFlaiContent = document.querySelector('#flaiveth-card > .card-content')
    }

    manipulateLoading(false)
}

function flaivethStreamPreview(elmFlai, stream) {
    elmFlai.src = getThumbnailURL(stream.thumbnail_url, 698, 393)
}

function flaivethStreamContent(elmFlai, stream) {
    elmFlai.classList.remove('d-none');
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
            name.className = 'streamer-name'
            name.textContent = key

            const badge = document.createElement('span')
            badge.className = 'new badge pulse'

            const body = document.createElement('div')
            body.className = 'collapsible-body'

            const bodyContent = document.createElement('div')
            bodyContent.className = 'content'

            const preview = document.createElement('img')
            const p = document.createElement('p')
            const urlIcon = document.createElement('i')

            const streamOn = streamsLiveInfo
            .find((streamLive) => streamLive.user_id == value[0])
            
            if(streamOn){
                badge.setAttribute('data-badge-caption', 'LIVE')
                const text = document.createTextNode(truncateString(streamOn.title, 50))
                p.appendChild(text)

                //preview.className = 'materialboxed'
                preview.width = '70'
                preview.height = '40'
                preview.src = getThumbnailURL(streamOn.thumbnail_url, 700, 400)

                urlIcon.className = 'material-icons url-icon clickable'
                urlIcon.textContent = 'open_in_new'

                urlIcon.addEventListener('click', function () {
                    openStream(streamOn.user_name)
                })

                header.classList.add('clickable')
            } else {
                badge.setAttribute('data-badge-caption', 'OFF')

                header.setAttribute('disabled', 'true')
            }

            bodyContent.appendChild(preview)
            bodyContent.appendChild(p)
            bodyContent.appendChild(urlIcon)

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

function truncateString(text, num) {
    if(text.length <= num){
        return text
    }

    return text.slice(0, num) + '...'
}

function getThumbnailURL(thumbnail_url, width, height) {
    return thumbnail_url
    .replace('{width}', `${width}`)
    .replace('{height}', `${height}`)
}

function openStream(userName) {
    const userNameUrl = userName.toLowerCase()
    chrome.tabs.query({url: `https://www.twitch.tv/${userNameUrl}`}, 
    function (tabs) {
        if(!tabs || !tabs.length){
            chrome.tabs.create({url: `https://www.twitch.tv/${userNameUrl}`})
            return
        }

        const tab = tabs[0]
        chrome.tabs.highlight({
            windowId: tab.windowId,
            tabs: tab.index
        })
    })
}

function dropdownListeners() {
    const optionsEl = document.querySelector('#dropdown-options')
    const reloadEl = document.querySelector('#dropdown-reload')
    const aboutEl = document.querySelector('#dropdown-about')

    optionsEl.addEventListener('click', function () {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
          } else {
            window.open(chrome.runtime.getURL('../../options/options.html'));
          }
    })

    reloadEl.addEventListener('click', function () {
        chrome.runtime.reload();
    })

    aboutEl.addEventListener('click', function () {
        const manifest = chrome.runtime.getManifest()
        const name =  manifest.name
        const version = manifest.version
        const author = manifest.author
        alert(`
        Name: ${name}
        Version: ${version}
        Author: ${author}
        `)
    })
}
