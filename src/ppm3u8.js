const { readFile, writeFile } = require('fs/promises');
const crypto = require('crypto');

(async () => {

  // get input file and input url
  var inputM3u8File = process.argv[2];
  var inputUrl = process.argv[3];
  if (!inputM3u8File) {
    console.log(`Usage: ppm3u8 index.m3u8 [index-m3u8-url]`);
    return;
  }

  // get input file content
  try {
    var inputM3u8Content = await readFile(inputM3u8File, 'utf8');
  } catch (error) {
    console.error(`Failed to read "${inputM3u8File}".`);
    process.exit(1);
  }

  // display discontinuity info
  var matches = inputM3u8Content.match(/DISCONTINUITY/ig);
  if (matches) {
    console.log(`ppm3u8: Found ${matches.length} discontinuity in "${inputM3u8File}".`);
  } else {
    console.log(`ppm3u8: No discontinuity found in "${inputM3u8File}".`);
  }

  // modify m3u8 content, extract ts list
  var inputM3u8Lines = inputM3u8Content.split(/\r?\n/);
  var modM3u8Lines = [], tsList = [];
  var url, dir = 'ts', filename;
  for (var i = 0; i < inputM3u8Lines.length; i++) {
    if (inputM3u8Lines[i].trim().length > 0 && !inputM3u8Lines[i].startsWith('#')) {
      url = inputUrl ? new URL(inputM3u8Lines[i], inputUrl) : new URL(inputM3u8Lines[i]);

      // generate new ts file name
      filename = crypto.createHash('md5').update(url.href.split('?')[0]).digest('hex') + '.ts';

      // modify ts item in m3u8 content
      modM3u8Lines.push(`${dir}/${filename}`);

      // generate ts item in ts list
      tsList.push(url.href);
      tsList.push(`  dir=${dir}`);
      tsList.push(`  out=${filename}`);
    } else {
      // copy m3u8 comment
      modM3u8Lines.push(inputM3u8Lines[i]);
    }
  }

  // modify m3u8 content, extract key list
  var keyList = {};
  var modM3u8Content = modM3u8Lines.join('\n').replace(/(?:URI=")([^"]+)(?:")/g, function($0, $1) {
    var url = inputUrl ? new URL($1, inputUrl) : new URL($1);
    keyList[url.href] = null;
    return `URI="${url.pathname.split('/').pop()}"`;
  });
  keyList = Object.keys(keyList);

  // save key.txt file
  if (keyList.length) {
    var keyListFile = 'key.txt';
    try {
      await writeFile(keyListFile, keyList.join('\n'), 'utf8');
    } catch (error) {
      console.error(`Failed to write "${keyListFile}".`);
      process.exit(1);
    }
    console.log(`Wrote "${keyListFile}" file.`);
  }

  // save ts.txt file
  var tsListFile = 'ts.txt';
  try {
    await writeFile(tsListFile, tsList.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Failed to write "${tsListFile}".`);
    process.exit(1);
  }
  console.log(`Wrote "${tsListFile}" file.`);

  // save file.m3u8 file
  var modM3u8File = 'file.m3u8';
  try {
    await writeFile(modM3u8File, modM3u8Content, 'utf8');
  } catch (error) {
    console.error(`Failed to write "${modM3u8File}".`);
    process.exit(1);
  }
  console.log(`Wrote "${modM3u8File}" file.`);
})();
