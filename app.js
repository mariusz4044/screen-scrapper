const nut = require("@nut-tree/nut-js");
const vision = require('@google-cloud/vision');
const readline = require('readline');

readline.emitKeypressEvents(process.stdin);

if (process.stdin.setRawMode != null) {
    process.stdin.setRawMode(true);
}

const client = new vision.ImageAnnotatorClient({
    keyFilename: './key.json'
});

class Bot  {
    constructor() {
        this.page = null;
        this.handleSize = [200,60];
        this.typeHandle = "center";
        this.options = {
            cookies: ""
        }
    }

    async init(){
        console.time("initialize: ")
        const {x,y} = await nut.mouse.getPosition();
        await this.getScreenShot(x,y)
        console.timeEnd("initialize: ")
        const text = await this.getTextFromImage()
        await this.useText(text)
    }

    async useText(text) {
        //Do something with the text
    }

    async getScreenShot(x,y) {
        const xs = this.handleSize[0]
        const ys = this.handleSize[1]
        let region = null;

        if(this.typeHandle == "center") {
            //Handle center position relative to the mouse
           region =  new nut.Region(x - (xs * 0.5), y - (ys *0.5), xs,ys);
        }else {
            //Handle position top-left
            region =  new nut.Region(x - 3,y - 3,xs,ys); 
        }

        //nut.screen.highlight(region);
        return await nut.screen.captureRegion('image.png',region);
    }

    async getTextFromImage() {
        console.time("APi Call: ")
        const [result] = await client.textDetection('./image.png');
        const detections = result.fullTextAnnotation?.text;
        console.timeEnd("APi Call: ")
        return detections;
    }
}


process.stdin.on('keypress', (str, key) => {
    if(key.name == "x") {
        new Bot().init();
    }else if(key.name==='escape' || key.name==='q') {
        process.exit();
    }
})