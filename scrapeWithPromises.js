var axios = require('axios');
var cheerio = require('cheerio');
var fs = require('fs');

const ROOT_URL = 'https://www.bodybuilding.com';

let promise = axios.get(ROOT_URL + '/exercises');

promise.then((fromResolve) => {
  console.log('Reached 1');
  return scrapeDirectoryPageForLinks(fromResolve.data);
})
.then((links) => {
  console.log('Reached 2');

  let exerciseTypePages = [];
  links.forEach((link) => {
    let result = axios.get(link);
    exerciseTypePages.push(result);
  });
  return Promise.all(exerciseTypePages);
})
.then((results) => {
  console.log('Reached 3');
  let exerciseLinks = [];
  results.forEach((res) => {
    exerciseLinks = exerciseLinks.concat(scrapeExerciseListPages(res.data));
  });
  return exerciseLinks;
})
.then((results) => {
  console.log('Reached 4');
  let filteredResults = results.filter((url) => {
    let temp = url.substring(url.search("exercises/") + 10);
    return !(temp.search("/") >= 0 || temp.search("finder") >= 0);
  });

  return filteredResults;
})
.then((links) => {
  console.log('Reached 5');
  let exercisePages = [];
  links.forEach((link) => {
    let result = axios.get(link);
    exercisePages.push(result);
  });

  return Promise.all(exercisePages);
})
.then((pages) => {
  console.log('Reached 6');
  pages.forEach((page) => {
    let exercise = scrapePage(page.data);
    saveExerciseAsJSFile(exercise);
  })
});

function saveExerciseAsJSFile(exercise) {
  console.log('Writing', exercise.name);

  try {
    fs.writeFileSync('./data/' + exercise.name + '.json', JSON.stringify(exercise, null, 4));
  } catch (err) {

  }

  // try {
  //   console.log('Writing', exercise.name);
  //   fs.writeFileSync('./data/' + exercise.name + '.json', 'HELLO', (err) => {
  //     if (!err) {
  //       console.log(exercise.name, 'added to list!');
  //     }
  //   });
  // } catch (err) {
  //   console.log(err, exercise.name);
  // }
}

function scrapePage(html) {
  var $ = cheerio.load(html);

  var exercise = new Object();

  $('.ExHeading--h2').filter((i, el) => {
    exercise.name = $(el).text().trim();
  });

  $('.bb-list--plain').filter((i, el) => {
    var elList = $(el).find('li').each((i, el) => {
      // '/' indicates start and end of regex pattern
      // g after '/' indicates global search
      var text = $(el).text();
      text = text.substring(text.search(':') + 1).replace('/\\n/g', '');
      if (i == 0) exercise.type = text;
      if (i == 1) exercise.muscleGroup = text;
      if (i == 2) exercise.equipment = text;
      if (i == 3) exercise.level = text;
    });
  });

  $('.ExDetail-descriptionSteps').filter((i ,el) => {
    exercise.instructions = [];
    $(el).find('li').each((i, el) => {
      exercise.instructions.push($(el).text().trim());
    });
  });

  exercise.note = [];
  $('p').each((i , el) => {
    exercise.note.push($(el).text());
  });

  exercise.author = ROOT_URL;

  return exercise;
}


function scrapeExerciseListPages(html) {
  var $ = cheerio.load(html);
  let links = [];

  $('.ExCategory-results').filter((i , el) => {
    $(el).find('a').each((i, el) => {
      links.push(ROOT_URL + $(el).attr('href'));
    });
  });

  return links;
}

function scrapeDirectoryPageForLinks(html) {
  var $ = cheerio.load(html);
  var links = [];
  // Different syntax to show how you can do it differently
  $('.exercise-list-left').filter((i, el) => {
    $(el).find('a').each((i, el) => {
      links.push(ROOT_URL + $(el).attr('href'));
    });
  });
  // () => {} Can't be use here because $(this) needs a reference
  $('.exercise-list-right').filter(function() {
    var root = $(this);
    root.find('a').each(function() {
      links.push(ROOT_URL + $(this).attr('href'));
    });
  });

  return links;
}
