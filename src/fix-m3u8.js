const { readFile, writeFile } = require('fs/promises');

(async () => {

  // get input file and ffmpeg log file name
  var fileM3U8 = process.argv[2];
  var ffmpegLog = process.argv[3];
  if (!fileM3U8 || !ffmpegLog) {
    console.log(`Usage: fix-m3u8 file.m3u8 ffmpeg.log`);
    return;
  }

  // get input file content
  try {
    var content = await readFile(fileM3U8, 'utf8');
  } catch (error) {
    console.error(`Read "${fileM3U8}" as m3u8 file failed.`);
    process.exit(1);
  }
  content = content.replace(/\r\n/g, '\n');

  // get ffmpeg log content
  try {
    var log = await readFile(ffmpegLog, 'utf8');
  } catch (error) {
    console.error(`Read "${ffmpegLog}" as ffmpeg log failed.`);
    process.exit(1);
  }
  log = log.replace(/\r\n/g, '\n');

  // find discontinuity segments from log
  var regex = /\n\[[^'\n]+'([^'\n]+)' for reading\n\[[^'\n]+'([^'\n]+)' for reading\n\[[^']+discontinuity/g;
  var segment = [], i = 1;
  while ((match = regex.exec(log)) !== null) {
    segment.push(match[1 + i % 2]);
    i++;
  }

  // no discontinuity found
  if (segment.length === 0) {
    console.log('No discontinuity found.');
    return;
  }

  // remove advertisement segments from m3u8 content
  console.log(`Found ${segment.length} 'discontinuity'.`);
  var strReg, reg;
  for (var i = 0; i < segment.length; i = i + 2) {
    // build reg string
    strReg = `\n${segment[i].replace(/\./g, '\\\.')}`;
    strReg += i + 1 < segment.length ? `\n(?:.*\n)*?${segment[i + 1].replace(/\./g, '\\\.')}\n` : '\n(?:.*\n)*';

    // create reg object
    reg = new RegExp(strReg);

    // remove segments
    content = content.replace(reg, (i + 1 < segment.length ? '\n' : '\n#EXT-X-ENDLIST\n'));

    // output removed segments regular expression
    console.log(`${1 + i / 2}: ${reg.source}`);
  }

  // save fixed content to file
  var fixedM3U8 = 'fixed.m3u8';
  try {
    await writeFile(fixedM3U8, content, 'utf8');
  } catch (error) {
    console.error(`Write "${fixedM3U8}" failed.`);
    process.exit(1);
  }

  console.log(`Write "${fixedM3U8}" file.`);

})();
