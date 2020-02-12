'use strict';

chrome.notifications.create({
    type:     'basic',
    iconUrl:  'streamers/adal.jpg',
    title:    'Adalokumura',
    message:  'Está en directo',
    // buttons: [
    //   {title: 'Keep it Flowing.'}
    // ],
    priority: 0});