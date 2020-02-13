'use strict';

chrome.alarms.create('checkStreamsStatus', { delayInMinutes: 1, periodInMinutes: 1 });

chrome.runtime.onInstalled.addListener(async function(){
    const data = await requestStreams([144360146, 171295429, 44445592])
    const streamData = checkStreamFromResponse(data, 144360146) //flaiveth
    if(streamData){
        chrome.browserAction.setBadgeText({text: 'ON'});
        showToast();
    } else {
        chrome.browserAction.setBadgeText({text: ''});
    }
})


let counter = 1
chrome.alarms.onAlarm.addListener(async function() {
    console.log('alarm', counter++)
    const data = await requestStreams([144360146, 171295429, 44445592])
    const streamOn = checkStreamFromResponse(data, 144360146) //flaiveth
    if(streamOn){
        chrome.browserAction.setBadgeText({text: 'ON'});
        showToast();
    } else {
        chrome.browserAction.setBadgeText({text: ''});
    }
  }
  );

chrome.history.onVisited.addListener(function(historyResult) {
    if(historyResult){
        if(historyResult.contains('twitch.tv') && historyResult.contains('flaiveth')){
            console.log('flai',historyResult) 
        }     
    }
console.log(historyResult)
})

async function twitchAPIRequest(userIds) {
    const url = new URL('https://api.twitch.tv/helix/streams');
    userIds.map((userId) => url.searchParams.append('user_id', userId))
    const response = await fetch(url, {
       headers: {
        'Content-Type': 'application/json',
        'Client-ID': '17v1noul6hr06tipzfaggsspuevmxt'
      }
   })
   return await response.json()
}

async function requestStreams(userIds) {
    try {
        const response = await twitchAPIRequest(userIds)
        const data = await response.data
        return data  
    } catch (error) {
        console.error(`An unexpected error:${'requestStreams'}`)
    }
}

function checkStreamFromResponse(data, userIdToCheck) {
    try {
        if(data.length > 0){
            const streamData = data.find((stream) => stream.user_id == userIdToCheck)
            if(streamData){
                const streamOn = streamData.viewer_count !== null
                return streamOn ? streamData : undefined
            }
         }
         return undefined
    } catch (error) {
        console.error(`An unexpected error(checkStreamFromResponse):${error}`)
    }
}

function showToast() {
    chrome.notifications.create({
        type:     'basic',
        iconUrl:  'streamers/flaiveth.jpg',
        title:    'Flaiveth',
        message:  'Está en directo',
        priority: 0});
}

//chrome.alarms.create(string name, object alarmInfo)
// chrome.browserAction.onClicked.addListener(function(tab) {
//   var opt = {
//     type: "basic",
//     title: "Primary Title",
//     message: "Primary message to display",
//     iconUrl: "streamers/adal.jpg"
//   }
//   chrome.notifications.create('1', opt, function() {});
// });