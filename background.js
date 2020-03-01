'use strict';

const flaivethId = 144360146; //flaiveth UserId

let notificationQueue = []
let notificationsFlags = []

chrome.alarms.create('checkStreamsStatus', { delayInMinutes: 1, periodInMinutes: 1 });
chrome.alarms.create('showNextNotification', { delayInMinutes: 1, periodInMinutes: 1 });

chrome.storage.onChanged.addListener(function(changes, areaName) {
    console.log(changes, areaName)
})

chrome.runtime.onInstalled.addListener(async function(){

    const configFile = await getConfig()
    const config = configFile.config;

    const otherStreamers = Object.values(config.streams)
    .filter((configArray) => configArray[1])
    .map((configArray) => configArray[0]);

    const streamers = [flaivethId].concat(otherStreamers);

    chrome.storage.sync.set({config : JSON.stringify(config)})
    await notifyFlow(streamers);
})

chrome.alarms.onAlarm.addListener(async function(alarm) {
    console.log('alarm', alarm.name)

    switch (alarm.name) {
        case 'checkStreamsStatus':
            chrome.storage.sync.get('config',async function(configFile) {
                const config = JSON.parse(configFile.config)

                const otherStreamers = Object.values(config.streams)
                .filter((configArray) => configArray[1])
                .map((configArray) => configArray[0]);
                
                const streamers = [flaivethId].concat(otherStreamers);
                await notifyFlow(streamers);
                });
            break;

        case 'showNextNotification':
            if(!notificationQueue.length){
                return
            }

            const nextOne = notificationQueue.shift()
            await showToast(nextOne.user_name, nextOne.title, nextOne.started_at,`streamers/${nextOne.user_id}.png`)
            break;
    }
  });

async function notifyFlow(streamers) {
    const data = await requestStreams(streamers)

    if(!data){
        return
    }
    const streamInfo = streamers.map((streamer) => checkStreamFromResponse(data, streamer)
    ).filter(streamOn => streamOn) //filter streams offlines
    
    console.log(streamInfo)

    if(!streamInfo || !streamInfo.length){
        setNotificationProperties(true, '')
        return
    }

    const flaivethStream = streamInfo.find((stream) => stream.user_id == flaivethId)

    streamInfo.map(async (stream) => {
        const notificationFound = notificationQueue.find((notifQ) => notifQ.user_id == stream.user_id)

        if(stream && !notificationFound){
            notificationQueue.push(stream) //Add stream info in the queue
        }
    })
    
    if(flaivethStream){
        setNotificationProperties(true, 'ON')
    } else {
        setNotificationProperties(true, `${streamInfo.length}`)
    }
}

async function getConfig() {
    const configUrl = new URL(chrome.runtime.getURL('config.json'));
    try {
        const response = await fetch(configUrl, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        return await response.json()
    } catch (error) {
        errorHandler(error, getConfig.name)
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

async function showToast(userName, streamTitle, started_at, icon) {
    chrome.notifications.create({
        type:     'basic',
        iconUrl:  icon,
        title:    `${userName}`,
        message:  `${streamTitle}`,
        contextMessage: `Está en directo - ${getStreamingTime(started_at)}`,
        priority: 0
    }, function(createdId) {
        const handler = function(id) {
          if(id == createdId) {
            openStream(userName)
            chrome.notifications.clear(id);
            chrome.notifications.onClicked.removeListener(handler);
          }
        };
        chrome.notifications.onClicked.addListener(handler);
        if(typeof createdCallback == "function") createdCallback();
      });
}

function setNotificationProperties(enable, badgeText) {
    if(enable){
        chrome.browserAction.enable()
    } else {
        chrome.browserAction.disable() 
    }

    chrome.browserAction.getBadgeText({}, function (currentBadgeText) {
        if(currentBadgeText !== badgeText){
            chrome.browserAction.setBadgeText({
                text: badgeText
            })
        }
    })
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

function getStreamingTime(started_at){
    const startedAt = new Date(started_at).getTime()
    const current = new Date().getTime()
    const diff = current - startedAt

    let msec = diff;
    const hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    const mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    const ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    return `${hh > 0 ? `${hh} h` : ''} ${mm > 0 ? `${mm} m` : ''} ${ss > 0 ? `${ss} s` : ''}`
}

function getThumbnailURL(thumbnail_url, width, height) {
    return thumbnail_url
    .replace('{width}', `${width}`)
    .replace('{height}', `${height}`)
}

async function thumbnailToBlob(thumbnail_url, width, height) {
    try {
        const tUrl = new URL(getThumbnailURL(thumbnail_url, width, height));
        const response = await fetch(tUrl)
        const blob = await response.blob()
        const blobURL = URL.createObjectURL(blob);
        return blobURL
    } catch (error) {
        errorHandler(error, thumbnailToBlob.name)
    }
}

const errorHandler = (error, functionName) => {
    if(!error.message){
        throw(`An unexpected error(${functionName}):${error}`)
    }
        switch (error.message) {
            case 'Failed to fetch':
                setNotificationProperties(false, '')
                console.debug('Internet Disconnected')
            break;
            default: throw(`An unexpected error(${functionName}):${error}`)
        }
}


