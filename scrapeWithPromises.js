var axios = require('axios');
var cheerio = require('cheerio');

const ROOT_URL = 'https://www.bodybuilding.com';

let promise = axios.get(ROOT_URL + '/exercises');

let links = promise.then((fromResolve) => {
  return scrapeDirectoryPageForLinks(fromResolve.data);
})
.then((links) => {
  let exerciseTypePages = [];
  links.forEach((link) => {
    let result = axios.get(link);
    exerciseTypePages.push(result);
  });
  return Promise.all(exerciseTypePages);
})
.then((results) => {
  let exerciseLinks = [];
  results.forEach((res) => {
    exerciseLinks = exerciseLinks.concat(scrapeExerciseListPages(res.data));
  });
  return exerciseLinks;
});

links.then((results) => {
  let filteredResults = results.filter((url) => {
    let temp = url.substring(url.search("exercises/") + 10);
    return !(temp.search("/") >= 0 || temp.search("finder") >= 0);
  });

  return filteredResults;
})
.then((links) => {
  let exercisePages = [];
  links.forEach((link) => {
    let result = axios.get(link);
    exercisePages.push(result);
  });

  return Promise.all(exercisePages);
})
.then((pages) => {
  pages.forEach((page) => {
    let exercise = scrapePage(page.data);
    console.log(exercise.name);
  })
})

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
