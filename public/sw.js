self.options = {
    "domain": "5gvci.com",
    "zoneId": 11566473
}
self.lary = ""
try {
    importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
} catch (err) {
    console.warn('Service worker script import ignored:', err);
}

