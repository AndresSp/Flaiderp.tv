'use strict';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', materializeInit);
} else {
    materializeInit();
}

function materializeInit() {
    const sidenavs = document.querySelectorAll('.sidenav');
    const instSidenavs = M.Sidenav.init(sidenavs, {});
}