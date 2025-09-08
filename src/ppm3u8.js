const { readFile, writeFile } = require('fs/promises');

(async () => {

  // get input file and base url
  var indexM3U8 = process.argv[2];
  var baseUrl = process.argv[3];
  if (!indexM3U8) {
    console.log(`Usage: ppm3u8 index.m3u8 [index-m3u8-url]`);
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
  var urlObject, urlSections, urlFilename, urlPathname, referPathname;
  var urlLines = [], fileLines = [];
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0 && !lines[i].startsWith('#')) {
      urlObject = baseUrl ? new URL(lines[i], baseUrl) : new URL(lines[i]);
      urlSections = urlObject.href.split('/');
      urlFilename = urlSections.pop();
      urlPathname = urlSections.join('/');

      // ignore TS file which is not in the same path
      if (!referPathname) {
        // set the first TS file path to refer path
        referPathname = urlPathname;
      }

      // save useful url and filename
      if (referPathname === urlPathname) {
        urlLines.push(urlObject.href);
        fileLines.push(urlFilename);
      }
    } else {
      // save comments
      urlLines.push(lines[i]);
      fileLines.push(lines[i]);
    }
  }

  // parsing and transforming KEY url
  var keyLines = {};
  var fileContent = fileLines.join('\n').replace(/(?:URI=")([^"]+)(?:")/g, function($0, $1) {
    var urlObject = baseUrl ? new URL($1, baseUrl) : new URL($1);
    keyLines[urlObject.href] = null;
    return `URI="${urlObject.pathname.split('/').pop()}"`;
  });
  keyLines = Object.keys(keyLines);

  // save key.txt content
  if (keyLines.length) {
    var keyFile = 'key.txt';
    try {
      await writeFile(keyFile, keyLines.join('\n'), 'utf8');
    } catch (error) {
      console.error(`Write "${keyFile}" failed.`);
      process.exit(1);
    }
    console.log(`Write "${keyFile}" file.`);
  }

  // save url.m3u8 content
  var urlM3U8 = 'url.m3u8';
  try {
    await writeFile(urlM3U8, urlLines.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Write "${urlM3U8}" failed.`);
    process.exit(1);
  }
  console.log(`Write "${urlM3U8}" file.`);

  // save file.m3u8 content
  var fileM3U8 = 'file.m3u8';
  try {
    await writeFile(fileM3U8, fileContent, 'utf8');
  } catch (error) {
    console.error(`Write "${fileM3U8}" failed.`);
    process.exit(1);
  }
  console.log(`Write "${fileM3U8}" file.`);
})();
