const cheerio = require('cheerio');
const fetch = require("node-fetch")
var rp = require('request-promise');
rp = rp.defaults({ jar: true });

const username = "Your Username"
const pass = "Your Password"
// if you don't have username and password, register in https://www.zerochan.net/register

function parseInput(keyword) {
  const query = keyword.split(' ');
  return query.join('+');
}

module.exports = {
  /**
   * Returns a list of results based on query
   * @param {string} keyword
   * @param page - Page must be an integer, defaults to page 1
   */

  // creating a clean jar



  getSearch: async function(keyword, page = 1, options) {
    await rp(`https://www.zerochan.net/login?ref=kamisato+ayaka?p=2&name=${username}&password=${pass}&login=Login`)

    if (isNaN(page)) page = 1;

    const obj = {
      uri: `https://www.zerochan.net/${parseInput(keyword)}?p=${page}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };


    if (obj.uri.includes('zerochan')) {
      return await rp(obj, options) /* eslint no-return-await: 0 */
        .then($ => {
          const results = [];
         $('#thumbs2').children('li').children('div').each(function () { 
            results.push({
              url: `https://www.zerochan.net${$(this).children('a').first()
                .attr('href')}`,
              nama: $(this).children('p').children('a').children('img')
                .last()
                .attr('alt'),
              image: $(this).children('p').children('a')
                .last()
                .attr('href')
            });
            if (!$(this).children('p').children('a') // If the result is a registration link, remove it from the array
              .last()
              .attr('href')) results.pop();
          });
          return results;
        })
        .catch(err => console.error(err));
    }
    return console.error(`Error: "${keyword}" is an invalid search term.`);
  },
  getSearch2: async function(keyword, page = 1, options) {
    await rp(`https://www.zerochan.net/login?ref=kamisato+ayaka?p=2&name=${username}&password=${pass}&login=Login`)

    if (isNaN(page)) page = 1;

    const obj = {
      uri: `https://www.zerochan.net/${parseInput(keyword)}&p=${page}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };


    if (obj.uri.includes('zerochan')) {
      return await rp(obj, options) /* eslint no-return-await: 0 */
        .then($ => {
          const results = [];
          $('#thumbs2').children('li').children('div').each(function () { 
            results.push({
              url: `https://www.zerochan.net${$(this).children('a').first()
                .attr('href')}`,
              nama: $(this).children('p').children('a').children('img')
                .last()
                .attr('alt'),
              image: $(this).children('p').children('a')
                .last()
                .attr('href')
            });
            if (!$(this).children('p').children('a') // If the result is a registration link, remove it from the array
              .last()
              .attr('href')) results.pop();
          });
          return results;
        })
        .catch(err => console.error(err));
    }
    return console.error(`Error: "${keyword}" is an invalid search term.`);
  },

  getRandom: async function(keyword, page = 1, options) {
    await rp(`https://www.zerochan.net/login?ref=kamisato+ayaka?p=2&name=${username}&password=${pass}&login=Login`)
    if (isNaN(page)) page = 1;

    const obj = {
      uri: `https://www.zerochan.net/${parseInput(keyword)}?p=${page}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };


    if (obj.uri.includes('zerochan')) {
      return await rp(obj, options) /* eslint no-return-await: 0 */
        .then($ => {
          const results = [];
         $('#thumbs2').children('li').children('div').each(function () { 
            results.push({
              url: `https://www.zerochan.net${$(this).children('a').first()
                .attr('href')}`,
              nama: $(this).children('a').children('img')
                .last()
                .attr('alt'),
              image: $(this).children('a')
                .last()
                .attr('href')
            });
            if (!$(this).children('p').children('a') // If the result is a registration link, remove it from the array
              .last()
              .attr('href')) results.pop();
          });
          return results;
        })
        .catch(err => console.error(err));
    }
    return "error"
  },
  getHD: async function(link) {
    await rp(`https://www.zerochan.net/login?ref=kamisato+ayaka?p=2&name=${username}&password=${pass}&login=Login`)
    const obj = {
      uri: link,
      transform: function(body) {
        return cheerio.load(body);
      }
    };


    if (obj.uri.includes('zerochan')) {
      return await rp(obj) /* eslint no-return-await: 0 */
        .then($ => {
          const results = [];
          $('#large').each(function() { /* eslint func-names: 0 */
            results.push({
              url: `https://www.zerochan.net${$(this).children('a').first()
                .attr('href')}`,
              image: $(this).children('a')
                .last()
                .attr('href')
            });
            if (!$(this).children('p').children('a') // If the result is a registration link, remove it from the array
              .last()
              .attr('href')) results.pop();
          });
          return results;
        })
        .catch(err => console.error(err));
    }
    return console.error(`Error: "${keyword}" is an invalid search term.`);
  },

  //===========================================================================
  //Shuushuu
  getSearchSS: async function(keyword, page = 1, options) {

    if (isNaN(page)) page = 1;

    const obj = {
      uri: `https://e-shuushuu.net/search/results/?page=${page}&tags=${keyword}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };


    if (obj.uri.includes('shuushuu')) {
      return await rp(obj) /* eslint no-return-await: 0 */
        .then($ => {
          const results = [];
          $('.thumb').each(function() { /* eslint func-names: 0 */
            results.push({
              image: "https://e-shuushuu.net" + $(this).children('a')
                .first()
                .attr('href')
            });
          });
          return results;
        })
        .catch(err => console.error(err));
    }
    return console.error(`Error: "${keyword}" is an invalid search term.`);
  },

  getSearchSSR: async function(page = 1, options) {

    if (isNaN(page)) page = 1;

    const obj = {
      uri: `https://e-shuushuu.net/top.php?page=${page}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };


    if (obj.uri.includes('shuushuu')) {
      return await rp(obj) /* eslint no-return-await: 0 */
        .then($ => {
          const results = [];
          $('.thumb').each(function() { /* eslint func-names: 0 */
            results.push({
              image: "https://e-shuushuu.net" + $(this).children('a')
                .first()
                .attr('href')
            });
          });
          return results;
        })
        .catch(err => console.error(err));
    }
    return console.error(`Error: "${keyword}" is an invalid search term.`);
  },

}
