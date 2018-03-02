const puppeteer = require('puppeteer');

let screenShotProcess = [];
let processing = "processing"; //custom process name
let _browser;
let _page;

let browser = () => {
    return new Promise(resolve => {
        if (_browser && screenShotProcess.length) {
            //resolve if we have active process
            resolve(_browser)
        } else {
            puppeteer.launch({
                ignoreHTTPSErrors: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            }).then(browser => {
                _browser = browser;
                resolve(_browser)
            });
        }

        //push new processing
        screenShotProcess.push(processing);
    });
};

let getScreenShot = () => {
    return new Promise((resolve, reject) => {
        browser().then(browser => browser.newPage()).then(page => {
            _page = page;
            //new page with custom html
            return _page.setContent('<h1>Hello World!<h1>', {waitUntil: 'networkidle2'})
        }).then(() => {
            return _page.setViewport({
                width: 800,
                height: 500
            })
        }).then(() => {
            return _page.screenshot();
        }).then(screenShot => {
            //remove processing from queue
            screenShotProcess.shift();

            _page.close();

            if (screenShotProcess.length === 0) {
                //close browser (need for clear memory etc.)
                _browser.close();
            }

            resolve(screenShot);
        }).catch(error => {
            //remove processing from queue
            screenShotProcess.shift();
            reject(error);
        });
    });
};

getScreenShot().then(buffer => {
    console.log(buffer)
});