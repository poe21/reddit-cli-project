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

// SORTED MENU CHOICES
var sortedMenuChoices = [
    {name: 'Show Hot', value: 'hot'},
    {name: 'Show New', value: 'new'},
    {name: 'Show Rising', value: 'rising'},
    {name: 'Show Controversial', value: 'controversial'},
    {name: 'Show Top', value: 'top'},
    new inquirer.Separator(),
    {name: 'Go back to main menu', value: 'BACK'},
    {name: 'Quit', value: 'QUIT'}
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
        printHomepagePost();
      } else if (choice === "SORTEDHOMEPAGE") {
        printSortedHomepagePost();
      } else if (choice === "SUBREDDIT") {
        printSubredditPost();
      } else if (choice === "SORTEDSUBREDDIT") {
        printSortedSubreddit();
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

function printHomepagePost() {
  reddit.getHomepage(function(data1) {
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

function printSortedHomepagePost() {
  sortedMenu(function(data1) {
    reddit.getSortedHomepage(data1, function(data2) {
      reddit.listPosts(data2, function(data3) {
        choosePost(data3, function(data4) {
          reddit.printPost(data4, function(post) {
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
  });
}

function sortedMenu(callback) {
  inquirer.prompt({
    type: 'list',
    name: 'sorted',
    message: 'How would you like the homepage to be sorted?',
    choices: sortedMenuChoices
  }).then(
    function(choice) {
      if (choice.sorted === "BACK") {
        showMainMenu();
      }
      else if (choice.sorted === "QUIT") {
        return;
      }
      else {
        callback(choice.sorted);
      }
    }
  );
}

function printSubredditPost(){
  reddit.whichSubreddit(function(data1) {
    getSubreddit(data1, function(data2) {
      reddit.listPosts(data2, function(data3) {
        choosePost(data3, function(data4) {
          reddit.printPost(data4, function(post) {
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
  });
}

function printSortedSubreddit() {
  reddit.whichSubreddit(function(data1) {
    sortedMenu(function(data2) {
      getSortedSubreddit(data1, data2, function(data3) {
        reddit.listPosts(data3, function(data4) {
          choosePost(data4, function(data5) {
            reddit.printPost(data5, function(post) {
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
    });
  });
}

/*
This function should "return" the posts on the front page of a subreddit as an array of objects.
*/
function getSubreddit(subreddit, callback) {
  // Load reddit.com/r/{subreddit}.json and call back with the array of posts
  var urlFriendlySubreddit = subreddit.toLowerCase().split(" ").join("");
  var address = "https://www.reddit.com/r/" + urlFriendlySubreddit + ".json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);

    // if search invalid, returns to choose subreddit, else put result in a callback
    if (resultObject.error) {
      console.log("We couldn't find anything related to your request.");
      printSubredditPost();
    } else if (resultObject.data.children === 0) {
      console.log("We couldn't find anything related to your request.");
      printSubredditPost();
    } else {
      callback(resultObject.data.children);
    }
  });
}

/*
This function should "return" the posts on the front page of a subreddit as an array of objects.
In contrast to the `getSubreddit` function, this one accepts a `sortingMethod` parameter.
*/
function getSortedSubreddit(subreddit, sortingMethod, callback) {
  // Load reddit.com/r/{subreddit}/{sortingMethod}.json and call back with the array of posts
  // Check if the sorting method is valid based on the various Reddit sorting methods
  var urlFriendlySubreddit = subreddit.toLowerCase().split(" ").join("");
  var address = "https://www.reddit.com/r/" + urlFriendlySubreddit + "/" + sortingMethod + "/.json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);

    // if search invalid, returns to choose subreddit, else put result in a callback
    if (resultObject.error) {
      console.log("We couldn't find anything related to your request.");
      printSubredditPost();
    } else if (resultObject.data.children === 0) {
      console.log("We couldn't find anything related to your request.");
      printSubredditPost();
    } else {
      callback(resultObject.data.children);
    }
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