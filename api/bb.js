var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var curl = require('curlrequest');
var router = express.Router();

const ROOT_URL = 'https://www.bodybuilding.com';
const dirLinkList = [];
const exerciseLinkList = [];

router.get('/scrape', function(req, res) {
  scrapeDatabase(req, res);

});

//scrapeDatabase();
scrapeExercisePage('https://www.bodybuilding.com/exercises/rocky-pull-upspulldowns');

function scrapeDatabase() {
  curl.request({
    url: ROOT_URL + '/exercises'
  },
    (err, body) => {
      if (!err) {
        var $ = cheerio.load(body);
        // Different syntax to show how you can do it differently
        $('.exercise-list-left').filter((i, el) => {
          $(el).find('a').each((i, el) => {
            dirLinkList.push(ROOT_URL + $(el).attr('href'));
          });
        });
        // () => {} Can't be use here because $(this) needs a reference
        $('.exercise-list-right').filter(function() {
          var root = $(this);
          root.find('a').each(function() {
            dirLinkList.push(ROOT_URL + $(this).attr('href'));
          });
        });
        dirLinkList.map((link) => scrapeForExerciseLinks(link));
      } else {
        console.log('Error', err);
      }
    }
  );
}

function scrapeForExerciseLinks(url) {
  console.log('Scraping:', url);

  curl.request({
    url: url
  },
    (err, body) => {
      if (!err) {
        var $ = cheerio.load(body);

        $('.ExCategory-results').filter((i , el) => {
          $(el).find('a').each((i, el) => {
            exerciseLinkList.push(ROOT_URL + $(el).attr('href'));
          });
        });
        exerciseLinkList.map((link) => scrapeExercisePage(link));
      } else {
        console.log('Error', err);
      }
    }
  );
}

function scrapeExercisePage(url) {
  console.log('Scraping Exercise:', url);
  var result = url.search('/equipment/');
  result += url.search('/muscle/');
  result += url.search('/finder');
  if (result > 0) {
    console.log('Skipping: ', url);
    return;
  }
  curl.request({
    url: url
  },
    (err, body) => {
      if (!err) {
        var $ = cheerio.load(body);

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
        saveExerciseAsJSFile(exercise);
      }
    }
  );
}

function saveExerciseAsJSFile(exercise) {
  exercise.name = exercise.name.replace("/", '-');
  try {
    fs.writeFileSync('../data/' + exercise.name + '.json', JSON.stringify(exercise, null, 4), (err) => {
      if (!err) {
        console.log(exercise.name, 'added to list!');
      }
    });
  } catch (err) {
    console.log(err, exercise.name);
  }
}

module.exports = router;
