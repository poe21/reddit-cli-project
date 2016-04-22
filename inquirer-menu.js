// linked modules
var inquirer = require("inquirer");
var colors = require("colors");
var reddit = require("./reddit2");
var request = require('request');

// MAIN MENU CHOICES
var mainMenuChoices = [
  {name: "Show homepage posts", value: "HOMEPAGE"},
  {name: "Show sorted homepage posts", value: "SORTEDHOMEPAGE"},
  {name: "Show a subreddit's posts", value: "SUBREDDIT"},
  {name: "Show a sorted subreddit's posts", value: "SORTEDSUBREDDIT"},
  {name: "List popular subreddits", value: "LISTSUBREDDITS"},
  new inquirer.Separator(),
  {name: "Quit", value: "QUIT"}
];

function getUserChoice(callback) {
// GIVES A CHOICE TO THE USER 
  inquirer.prompt({
    type: "list",
    name: "menu",
    message: "What do you want to do?",
    choices: mainMenuChoices
  }).then(
    function(choice) {
      callback(choice.menu);
    }
  );
}

// STARTS PROGRAM, FIRST MENU CALL
showMainMenu();

function showMainMenu() {
  getUserChoice(
    function(choice) {
      if (choice === "HOMEPAGE") {
        printHomepage();
      // } else if (choice === "SORTEDHOMEPAGE") {
      //   printSortedHomepage();
      // } else if (choice === "SUBREDDIT") {
      //   printSubreddit();
      // } else if (choice === "SORTEDSUBREDDIT") {
      //   printSortedSubreddit();
      // } else if (choice === "LISTSUBREDDITS") {
      //   printListOfSubreddits();
      } else if (choice === "QUIT") {
        return;
      }
    }
  );
}

// function printHomepage () {
//   reddit.getHomepage(function(posts) {
//     posts.forEach(function(post) {
//       console.log(("Title: " + post.data.title).blue.bold);
//       console.log("By: " + post.data.author);
//       console.log("url: https://www.reddit.com" + post.data.permalink);
//       console.log("vote ups: " + post.data.ups);
//     });
//     showMainMenu();
//   });
// }

function printHomepage(){
  reddit.getHomepage(function(data1){
    reddit.listPosts(data1, function(data2) {
      choosePost(data2, function(data3) {
        reddit.printPost(data3, function(post) {
          console.log("\033c"); // clears console
          
          console.log("POST: ");
          console.log(("Title: " + post.title).blue.bold);
          console.log("By: " + post.author);
          console.log("url: " + post.url);
          console.log("vote ups: " + post.votes);
        });
      });
    });
  });
}

function choosePost(arr, callback) {
inquirer.prompt({
    type: 'list',
    name: 'postChooser',
    message: 'Which post from the list would you like to see?',
    choices: arr
  }).then(function(choice) {
      if (choice.postChooser === "BACK") {
        showMainMenu();
      } else if (choice.postChooser === "QUIT") {
        return;
      } else {
        callback(choice.postChooser);
      }
    });
}