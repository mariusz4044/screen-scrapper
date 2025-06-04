import * as nut from "@nut-tree/nut-js";
import vision from "@google-cloud/vision";
import readline from "readline";

readline.emitKeypressEvents(process.stdin);

if (process.stdin.setRawMode != null) {
  process.stdin.setRawMode(true);
}

const client = new vision.ImageAnnotatorClient({
  keyFilename: "./key.json",
});

class ScreenScrapper {
  private page: unknown = null;
  private handleSize: [number, number] = [200, 60];
  private typeHandle: "center" | "top-left" = "center";
  private options = {
    cookies: "",
  };

  async init(): Promise<void> {
    console.time("initialize: ");
    const { x, y } = await nut.mouse.getPosition();
    await this.getScreenShot(x, y);
    console.timeEnd("initialize: ");
    const text = await this.getTextFromImage();
    await this.useText(text);
  }

  async useText(text: string | undefined): Promise<void> {
    // Do something with the text
    console.log("Detected text:", text);
  }

  async getScreenShot(x: number, y: number): Promise<void> {
    const xs = this.handleSize[0];
    const ys = this.handleSize[1];
    let region: nut.Region;

    if (this.typeHandle === "center") {
      // Handle center position relative to the mouse
      region = new nut.Region(x - xs * 0.5, y - ys * 0.5, xs, ys);
    } else {
      // Handle position top-left
      region = new nut.Region(x - 3, y - 3, xs, ys);
    }

    // you can use highlight, 
    // its really slow 200/300ms slowdown
    // nut.screen.highlight(region);
    await nut.screen.captureRegion("image.png", region);
  }

  async getTextFromImage(): Promise<string | undefined> {
    console.time("API Call: ");
    const [result] = await client.textDetection("./image.png");
    const detections = result.fullTextAnnotation?.text;
    console.timeEnd("API Call: ");
    return detections;
  }
}

process.stdin.on("keypress", (str, key) => {
  if (key?.name === "x") {
    new ScreenScrapper().init();
  } else if (key?.name === "escape" || key?.name === "q") {
    process.exit();
  }
});
