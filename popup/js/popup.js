'use strict';

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {});
  });

chrome.storage.sync.get('config',async function(configFile) {
    const config = JSON.parse(configFile.config)
    createCollapsibleItems(config.streams)
    //createSwitchs(config.streams)
});

function createCollapsibleItems(streams){
    const streamsElem = document.getElementById('streams')

    for (const key in streams) {
        if (streams.hasOwnProperty(key)) {
            const value = streams[key];

            const li = document.createElement('li')
            li.className = 'collection-item avatar'

            const avatar = document.createElement('img')
            avatar.src = '../assets/icons/144360146.png'

            const title = document.createElement('span')
            title.className = 'title'
            title.textContent = key

            const header = document.createElement('div')
            header.className = 'collapsible-header'

            const icon = document.createElement('i')
            icon.className = 'icon-144360146'

            const name = document.createElement('span')
            name.className = 'flai-darkgreen'
            name.textContent = key

            const badge = document.createElement('span')
            badge.className = 'new badge bg-light-accent pulse'
            badge.setAttribute('data-badge-caption', 'LIVE')

            const body = document.createElement('div')
            body.className = 'collapsible-body'
            body.innerText = '4'

            const p = document.createElement('p')
            p.innerText = 'Lorem ipsum dolor sit amet.'

            body.appendChild(p)

            header.appendChild(icon)
            header.appendChild(name)
            //const check = createSwitch(value[1])
            header.appendChild(badge)
            //header.appendChild(check)

            li.appendChild(header)
            li.appendChild(body)

            streamsElem.appendChild(li)
        }
    }

}

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

