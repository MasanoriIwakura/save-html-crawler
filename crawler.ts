import fs from "fs";
import path from "path";
import csv from "csv-parser";
import puppeteer, { Browser } from "puppeteer";

type UrlEntry = {
  keyword: string;
  url: string;
};

const CSV_FILE = "settings.csv";
const OUTPUT_DIR = "pages";

async function readCsv(filePath: string): Promise<UrlEntry[]> {
  return new Promise((resolve, reject) => {
    const results: UrlEntry[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        if (data.keyword && data.url) {
          results.push({ keyword: data.keyword, url: data.url });
        }
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function saveCompletePage(
  keyword: string,
  url: string,
  browser: Browser
) {
  const page = await browser.newPage();
  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60 * 1000 });
        break;
      } catch (err) {
        if (attempt === 3) {
          throw err;
        }
      }
    }

    const savePath = path.join(OUTPUT_DIR, keyword);
    await fs.promises.mkdir(savePath, { recursive: true });

    const client = await page.createCDPSession();
    await client.send("Page.enable");
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: savePath,
    });

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data } = await client.send("Page.captureSnapshot", {
          format: "mhtml",
        });

        const mhtmlPath = path.join(savePath, `${keyword}.mhtml`);
        fs.writeFileSync(mhtmlPath, data);
        break;
      } catch (err) {
        if (attempt === 3) {
          throw err;
        }
      }
    }

    console.log(`✅ ${keyword}: 保存成功 (${url})`);
  } catch (err) {
    console.error(`❌ ${keyword}: 保存失敗 (${url})`, err);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("CSVファイルを読み込み中...");
  const entries = await readCsv(CSV_FILE);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }
  console.log(`読み込んだエントリ数: ${entries.length}`);

  const browser = await puppeteer.launch({ headless: true });

  console.log("ブラウザを起動しました。");
  for (const entry of entries) {
    await saveCompletePage(entry.keyword, entry.url, browser);
  }
  console.log("全てのページを保存しました。");

  await browser.close();
}

main().catch((err) => {
  console.error("実行エラー:", err);
  process.exit(1);
});
