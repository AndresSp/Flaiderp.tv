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
}