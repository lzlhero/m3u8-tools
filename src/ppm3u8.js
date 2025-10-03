const { createHash } = require('crypto');
const { readFile, writeFile } = require('fs/promises');

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
    var m3u8Content = await readFile(inputM3u8File, 'utf8');
  } catch (error) {
    console.error(`Failed to read "${inputM3u8File}".`);
    process.exit(1);
  }

  // display discontinuity info
  var matches = m3u8Content.match(/DISCONTINUITY/ig);
  if (matches) {
    console.log(`ppm3u8: Found ${matches.length} "DISCONTINUITY" keyword in "${inputM3u8File}".`);
  } else {
    console.log(`ppm3u8: No "DISCONTINUITY" keyword in "${inputM3u8File}".`);
  }

  // define download dir
  const dir = 'cache';

  // define url file lines
  var urlFileLines = [];

  // extract crypto key url, modify m3u8 content
  var keys = {};
  var m3u8Content = m3u8Content.replace(/(?:URI=")([^"]+)(?:")/g, function($0, $1) {
    // get crypto key absolute url
    var url = inputUrl ? new URL($1, inputUrl) : new URL($1);

    if (!keys[url.href]) {
      // generate new crypto key file name
      keys[url.href] = createHash('md5').update(url.href.split('?')[0]).digest('hex') + '.key';
    }

    return `URI="${dir}/${keys[url.href]}"`;
  });

  // copy crypto key url to url file
  for (let href in keys) {
    urlFileLines.push(href);
    urlFileLines.push(`  dir=${dir}`);
    urlFileLines.push(`  out=${keys[href]}`);
  }

  // extract ts url, modify m3u8 content
  var m3u8Lines = m3u8Content.split(/\r?\n/);
  var m3u8Line, url, filename;
  for (var i = 0; i < m3u8Lines.length; i++) {
    m3u8Line = m3u8Lines[i].trim();

    // only scan ts line
    if (!m3u8Line.startsWith('#') && m3u8Line.length > 0) {
      // get ts absolute url
      url = inputUrl ? new URL(m3u8Line, inputUrl) : new URL(m3u8Line);

      // generate new ts file name
      filename = createHash('md5').update(url.href.split('?')[0]).digest('hex') + '.ts';

      // copy ts url to url file
      urlFileLines.push(url.href);
      urlFileLines.push(`  dir=${dir}`);
      urlFileLines.push(`  out=${filename}`);

      // modify ts line content
      m3u8Lines[i] = `${dir}/${filename}`;
    }
  }

  // save url.txt file
  var urlFile = 'url.txt';
  try {
    await writeFile(urlFile, urlFileLines.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Failed to write "${urlFile}".`);
    process.exit(1);
  }
  console.log(`Wrote "${urlFile}" file.`);

  // save file.m3u8 file
  var outputM3u8File = 'file.m3u8';
  try {
    await writeFile(outputM3u8File, m3u8Lines.join('\n'), 'utf8');
  } catch (error) {
    console.error(`Failed to write "${outputM3u8File}".`);
    process.exit(1);
  }
  console.log(`Wrote "${outputM3u8File}" file.`);
})();
