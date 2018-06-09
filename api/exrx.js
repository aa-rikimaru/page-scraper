var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var curl = require('curlrequest');
var router = express.Router();

router.get('/scrape', function(req, res) {
  let url = 'https://www.bodybuilding.com/exercises/';

  curl.request({
    url: url,
  }, function(err, body) {
    var $ = cheerio.load(body);

    $('.exercise-list-left').filter(function() {
      var data = $(this);
      data.find('a').each(() => {
        console.log($(this).attr('href'));
      });
    });

    $('.exercise-list-right').filter(function() {
      var data = $(this);
      data.find('a'.each(() => {

      }))

    })

    res.send(body);
  });
});

module.exports = router;
