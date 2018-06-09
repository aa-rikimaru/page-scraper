var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var curl = require('curlrequest');
var router = express.Router();

const ROOT_URL = 'https://www.bodybuilding.com/exercises';

router.get('/scrape', function(req, res) {

  scrapeDirectoryPage(req, res);

  res.send('<h3>Bodybuilding</h3>');
});

function scrapeDirectoryPage(req, res) {
  var linkList = [];

  curl.request({
    url: ROOT_URL
  },
    (err, body) => {
      var $ = cheerio.load(body);

      $('.exercise-list-left').filter((i, el) => {
        $(el).find('a').each((i, el) => {
          console.log($(el).attr('href'));
          linkList.push($(el).attr('href'));
        });
      });

      $('exercise-list-right').filter(function() {
        var root = $(this);
        console.log(root);
      });

      return linkList;
    }
  );
}

module.exports = router;
