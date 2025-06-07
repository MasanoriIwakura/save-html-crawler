# save-html-crawler

A simple web crawler to save HTML content from specified URLs.

## Features

- Fetch and save HTML content from web pages.
- Support for multiple URLs.
- Easy to configure and extend.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/iwakura/save-html-crawler.git
cd save-html-crawler
```

2. Install dependencies:

```bash
npm install
```

## Settings

Create `settings.csv` to repository root.
Add keyword and URLs to `settings.csv` (one keyword, url per line).

e.g

```
keyword, url
google, https://www.google.com
bing, https://www.bing.com
```

## Usage

1. Add keyword and URLs to `settings.csv` (one keyword, url per line).
2. Run the crawler:

```bash
npm start
```

3. Saved HTML files will be stored in the `pages` directory.

## License

This project is licensed under the [MIT License](LICENSE).
