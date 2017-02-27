import * as jsdom from 'jsdom';

declare var global: any;

// A super simple DOM ready for React to render into
// Store this DOM and the window in global scope ready for React to access
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.parentWindow;
