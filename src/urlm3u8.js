const { readFile, writeFile } = require('fs/promises');

(async () => {

  // get input file and base url
  var indexM3U8 = process.argv[2];
  var baseUrl = process.argv[3];
  if (!indexM3U8) {
    console.log(`Usage: urlm3u8 index.m3u8 [index-m3u8-url]`);
    return;
  }

  // get input file content
  try {
    var content = await readFile(indexM3U8, 'utf8');
  } catch (error) {
    console.error(`Read "${indexM3U8}" as m3u8 failed.`);
    process.exit(1);
  }

  // parsing and transforming TS url
  var lines = content.split(/\r?\n/);
  var urlLines = [], fileLines = [], url;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0 && !lines[i].startsWith('#')) {
      url = baseUrl ? new URL(lines[i], baseUrl) : new URL(lines[i]);
      // get absolute url
      urlLines.push(url.href);
      // get local filename
      fileLines.push(url.pathname.split('/').pop());
    } else {
      urlLines.push(lines[i]);
      fileLines.push(lines[i]);
    }
  }

  // get key url
  var tsKeys = {};
  var fileContent = fileLines.join('\n').replace(/(?:URI=")([^"]+)(?:")/g, function($0, tsKey) {
    var url = baseUrl ? new URL(tsKey, baseUrl) : new URL(tsKey);
    tsKeys[url] = null;
    return `URI="${url.pathname.split('/').pop()}"`;
  });

  // save key.txt content.
  var keyFile = 'key.txt';
  try {
    await writeFile(keyFile, Object.keys(tsKeys).join('\n'), 'utf8');
  } catch (error) {
    console.error(`Write "${keyFile}" failed.`);
    process.exit(1);
  }
  console.log(`Write "${keyFile}" file.`);

  // save url.m3u8 content.
  var urlM3U8 = 'url.m3u8';
  try {
    await writeFile(urlM3U8, urlLines.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Write "${urlM3U8}" failed.`);
    process.exit(1);
  }
  console.log(`Write "${urlM3U8}" file.`);

  // save file.m3u8 content.
  var fileM3U8 = 'file.m3u8';
  try {
    await writeFile(fileM3U8, fileContent, 'utf8');
  } catch (error) {
    console.error(`Write "${fileM3U8}" failed.`);
    process.exit(1);
  }
  console.log(`Write "${fileM3U8}" file.`);
})();
