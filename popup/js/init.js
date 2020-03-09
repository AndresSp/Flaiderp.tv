import '../css/popup.css';
import '../css/theme.css';

'use strict';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', materializeInit);
} else {
    materializeInit();
}

function materializeInit() {
    const collapsibles = document.querySelectorAll('.collapsible');
    const instCollapsibles = M.Collapsible.init(collapsibles, {});
    
    const materialboxeds = document.querySelectorAll('.materialboxed');
    const instMaterialBoxeds = M.Materialbox.init(materialboxeds, {});

    const dropdowns = document.querySelectorAll('.dropdown-trigger');
    const instDropdowns = M.Dropdown.init(dropdowns, { 
        alignment: 'right'
    });
}