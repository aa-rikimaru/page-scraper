var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

app.get('/scrape', function(req, res){
  url = 'https://www.imdb.com/showtimes/title/tt4154756';

  request(url, function(error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);

      var title, release, rating;
      var json = {
        title: "",
        release: "",
        rating: ""
      };

      $('.header').filter(function() {
        var data = $(this);
        title = data.children().first().text();
        release = data.children().last().children().text();
        json.title = title;
        json.release = release;
      });

      $('.star-box-giga-star').filter(function() {
        var data = $(this);
        rating = data.text();
        json.rating = rating;
      });

      fs.writeFile('data/output.json', JSON.stringify(json, null, 4), function(err) {
        console.log('File successfully written!');
      });
    }
  });

  res.send('Check console');
});

app.listen('8085');

exports = module.exports = app;
