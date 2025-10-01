const { readFile, writeFile } = require('fs/promises');

(async () => {

  // get input file and ffmpeg log file name
  var inputM3u8File = process.argv[2];
  var logFile = process.argv[3];
  if (!inputM3u8File || !logFile) {
    console.log(`Usage: fixm3u8 file.m3u8 ffmpeg.log`);
    return;
  }

  // get input file content
  try {
    var m3u8Content = await readFile(inputM3u8File, 'utf8');
  } catch (error) {
    console.error(`Failed to read "${inputM3u8File}".`);
    process.exit(1);
  }
  m3u8Content = m3u8Content.replace(/\r\n/g, '\n');

  // get ffmpeg log content
  try {
    var logContent = await readFile(logFile, 'utf8');
  } catch (error) {
    console.error(`Failed to read "${logFile}".`);
    process.exit(1);
  }
  logContent = logContent.replace(/\r\n/g, '\n');

  // parse discontinuity segments from ffmpeg log
  var regex = /\n\[[^'\n]+'([^'\n]+)' for reading\n\[[^'\n]+'([^'\n]+)' for reading\n\[[^']+discontinuity/g;
  var result, segments = [], i = 1;
  while ((result = regex.exec(logContent)) !== null) {
    segments.push(result[1 + i % 2]);
    i++;
  }

  // display discontinuity info
  if (segments.length) {
    console.log(`fixm3u8: Found ${segments.length} discontinuity in "${logFile}".`);
  } else {
    console.log(`fixm3u8: No discontinuity found in "${logFile}".`);
    return;
  }

  // remove all discontinuity segments from m3u8 content
  var strReg, replaceText;
  for (var i = 0; i < segments.length; i = i + 2) {
    // build replacement reg string
    strReg = `\n${segments[i].replace(/\./g, '\\\.')}\n(?:.*\n)*`;
    if (i + 1 < segments.length) {
        strReg += `?${segments[i + 1].replace(/\./g, '\\\.')}\n`;
        replaceText = '\n';
    } else {
        replaceText = '\n#EXT-X-ENDLIST\n';
    }

    // remove discontinuity ts
    m3u8Content = m3u8Content.replace(new RegExp(strReg), replaceText);

    // display removed segments info
    console.log(`${1 + i / 2}: ${segments[i]} - ${i + 1 < segments.length ? segments[i + 1] : '#EXT-X-ENDLIST'}`);
  }

  // save fixed.m3u8 file
  var fixedM3u8File = 'fixed.m3u8';
  try {
    await writeFile(fixedM3u8File, m3u8Content, 'utf8');
  } catch (error) {
    console.error(`Failed to write "${fixedM3u8File}".`);
    process.exit(1);
  }
  console.log(`Wrote "${fixedM3u8File}" file.`);
})();
