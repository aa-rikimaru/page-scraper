const fs = require('fs');

const dirname = './data/';

let exerciseList = [];

fs.readdir(dirname, (err, filenames) => {
  if (err) {
    onError(err);
    return;
  }
  filenames.forEach(file => {
    fs.readFile(dirname + file, 'utf-8', (err, content) => {
      let exercise = JSON.parse(content.trim());
      exercise = postProcessExeciseData(exercise);
      exerciseList.push(exercise);
    });
  });
});

function postProcessExeciseData(e) {
  e.type = trimWord(e.type);
  e.muscleGroup = trimWord(e.muscleGroup);
  e.equipment = trimWord(e.equipment);
  e.level = trimWord(e.level);

  if (e.instructions) {
    e.instructions = e.instructions.filter((item) => {
      item = trimWord(item);
      return item != "";
    });
    e.instructions = e.instructions.map((item) => trimWord(item));
  }

  if (e.note) {
    e.note = e.note.filter((item) => {
      return item != "";
    });
    e.note = e.note.map((item) => trimWord(item));
  }

  console.log('Writing...', e.name);
  fs.appendFile('./exerciseList.json',  ',\n' + JSON.stringify(e, null, 4), (err) => {
    if (err) console.log(err);
  });
}

function trimWord(word) {
  return word.replace(/\n/g, " ").trim();
}

// function readFiles(dirname, onFileContent, onError) {
//   fs.readdir(dirname, function(err, filenames) {
//     if (err) {
//       onError(err);
//       return;
//     }
//     filenames.forEach(function(filename) {
//       fs.readFile(dirname + filename, 'utf-8', function(err, content) {
//         if (err) {
//           onError(err);
//           return;
//         }
//         onFileContent(filename, content);
//       });
//     });
//   });
// }
