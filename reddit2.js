// linked modules
var request = require('request');
var inquirer = require("inquirer");
var colors = require("colors");


//////////////////////POSTS DISPLAY RELATED//////////////////////////

function listPosts(arr, callback) {
  var postChoices = []; // empty array that will store all the posts objects to make a menu
  var postObj = {}; // empty object to push to the posts list menu
  
  arr.forEach(function(post) { // goes over each post in the result array
    postObj = {
      name: post.data.title,
      value: "https://www.reddit.com" + post.data.permalink
    };
    // pushes each new post object into the choices menu array
    postChoices.push(postObj);
  });
  
  // pushing more options to the menu
  postChoices.push(
    new inquirer.Separator(), 
    {name: 'Go back to main menu', value: 'BACK'}, 
    {name: 'Quit', value: 'QUIT'},
    new inquirer.Separator()
  );
  callback(postChoices); //exporting posts array
}

function makePostObj(obj, callback) {
  var address = obj+".json";
  var postObj = {};
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    var post = resultObject[0].data.children[0].data;
    postObj = {
      title: post.title,
      author: post.author,
      url: "https://www.reddit.com" + post.permalink,
      votes: post.ups
    };
    callback(postObj);
  });
}

function printPost(post, callback) {
  console.log("\033c"); // clears console

  console.log("POST: ");
  console.log(("Title: " + post.title).blue.bold);
  console.log("By: " + post.author);
  console.log("url: " + post.url);
  console.log("vote ups: " + post.votes);
}

////////////////FETCH DATA FROM URL.JSON//////////////////

function getPage(url, callback) {
  var address = url + ".json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    callback(resultObject.data.children);
  });
}

/*
This function should "return" the default homepage posts as an array of objects.
In contrast to the `getHomepage` function, this one accepts a `sortingMethod` parameter.
*/
function getSortedHomepage(sortingMethod, callback) {
  // Load reddit.com/{sortingMethod}.json and call back with the array of posts
  // Check if the sorting method is valid based on the various Reddit sorting methods
  var address = "https://www.reddit.com/" + sortingMethod + "/.json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    callback(resultObject.data.children);
  });
}

/*
This function should "return" all the popular subreddits
*/
function getSubreddits(callback) {
  // Load reddit.com/subreddits.json and call back with an array of subreddits
  var address = "https://www.reddit.com/subreddits.json";
  var subredditChoices = [];
  var subredditObj = {};
  
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    // making an object for each subreddit
    resultObject.data.children.forEach(function(subreddit) {
      subredditObj = {
        name: subreddit.data.title,
        value: "https://www.reddit.com" + subreddit.data.url
      };
      // push each subreddit object into the subredditChoices menu array
      subredditChoices.push(subredditObj);
    });
    
    // pushing more options to the menu
    subredditChoices.push(
      new inquirer.Separator(), {
        name: 'Go back to main menu',
        value: 'BACK'
      }, {
        name: 'Quit',
        value: 'QUIT'
      },
      new inquirer.Separator()
    );

  callback(subredditChoices); // output array of posts
  });
}


////////////////////MODULES EXPORT//////////////////////////

module.exports = {
  getSortedHomepage: getSortedHomepage,
  listPosts: listPosts,
  makePostObj: makePostObj,
  printPost: printPost,
  getSubreddits: getSubreddits,
  getPage: getPage
};