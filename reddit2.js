// linked modules
var request = require('request');
var inquirer = require("inquirer");

/*
This function should "return" the default homepage posts as an array of objects
*/
function getHomepage(callback) {
// Load reddit.com/.json and call back with the array of posts
  var address = "https://www.reddit.com/.json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    callback(resultObject.data.children);
  });
}

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

function printPost(obj, callback) {
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

function whichSubreddit(callback) {
  var question = [{
    type: "input",
    name: "whichsub",
    message: "Which subreddit would you like to view?"
  }];
  inquirer.prompt(question).then(function(answer) {
    callback(answer.whichsub);
  });
}

/*
This function should "return" all the popular subreddits
*/
function getSubreddits(callback) {
  // Load reddit.com/subreddits.json and call back with an array of subreddits
}

// Export the API
module.exports = {
  getHomepage: getHomepage,
  getSortedHomepage: getSortedHomepage,
  listPosts: listPosts,
  printPost: printPost,
  whichSubreddit: whichSubreddit
};
