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
    console.error(`Failed to read "${indexM3U8}".`);
    process.exit(1);
  }

  // discontinuity info
  var discontinuity = content.match(/DISCONTINUITY/ig);
  if (discontinuity) {
    console.log(`ppm3u8: Found ${discontinuity.length} discontinuity in "${indexM3U8}".`);
  } else {
    console.log(`ppm3u8: No discontinuity found in "${indexM3U8}".`);
  }

  // extracting and modifying TS url
  var lines = content.split(/\r?\n/), tsLines = [], m3u8Lines = [];
  var urlObject, tsFilename, urlSections, urlPathname, referPathname;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0 && !lines[i].startsWith('#')) {
      urlObject = baseUrl ? new URL(lines[i], baseUrl) : new URL(lines[i]);
      tsFilename = urlObject.pathname.split('/').pop();
      urlSections = urlObject.href.split('/'), urlSections.pop();
      urlPathname = urlSections.join('/');

      // set the first TS file path to refer path
      if (!referPathname) {
        referPathname = urlPathname;
      }

      // ignore TS file which is not in the same path
      if (referPathname === urlPathname) {
        tsLines.push(urlObject.href);
        m3u8Lines.push(tsFilename);
      }
    } else {
      // save comments
      m3u8Lines.push(lines[i]);
    }
  }

  // extracting and modifying KEY url
  var keyLines = {};
  var m3u8Content = m3u8Lines.join('\n').replace(/(?:URI=")([^"]+)(?:")/g, function($0, $1) {
    var urlObject = baseUrl ? new URL($1, baseUrl) : new URL($1);
    keyLines[urlObject.href] = null;
    return `URI="${urlObject.pathname.split('/').pop()}"`;
  });
  keyLines = Object.keys(keyLines);

  // save key.txt file
  if (keyLines.length) {
    var keyFile = 'key.txt';
    try {
      await writeFile(keyFile, keyLines.join('\n'), 'utf8');
    } catch (error) {
      console.error(`Failed to write "${keyFile}".`);
      process.exit(1);
    }
    console.log(`Wrote "${keyFile}" file.`);
  }

  // save ts.txt file
  var tsFile = 'ts.txt';
  try {
    await writeFile(tsFile, tsLines.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Failed to write "${tsFile}".`);
    process.exit(1);
  }
  console.log(`Wrote "${tsFile}" file.`);

  // save file.m3u8 file
  var m3u8File = 'file.m3u8';
  try {
    await writeFile(m3u8File, m3u8Content, 'utf8');
  } catch (error) {
    console.error(`Failed to write "${m3u8File}".`);
    process.exit(1);
  }
  console.log(`Wrote "${m3u8File}" file.`);
})();
