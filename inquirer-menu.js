////////////////////LINKED MODULES//////////////////////////
var inquirer = require("inquirer");
var colors = require("colors");
var reddit = require("./reddit2");
var request = require('request');


////////////////////MENU CHOICES//////////////////////////

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


/////////////// STARTS PROGRAM, FIRST MENU CALL//////////////
showMainMenu();

//////////////////////USER PROMPT///////////////////////////

function getUserChoice(callback) {
// GIVES THE MAIN MENU CHOICE TO THE USER 
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

function showMainMenu() {
  getUserChoice(
    function(choice) {
      if (choice === "HOMEPAGE") {
        printHomepagePost("https://www.reddit.com/");
      } else if (choice === "SORTEDHOMEPAGE") {
        printSortedHomepagePost();
      } else if (choice === "SUBREDDIT") {
        printSubredditPost();
      } else if (choice === "SORTEDSUBREDDIT") {
        printSortedSubreddit();
      } else if (choice === "LISTSUBREDDITS") {
        printListOfSubreddits();
      } else if (choice === "QUIT") {
        return;
      }
    }
  );
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

function choosePost(arr, callback) {
inquirer.prompt({
    type: 'list',
    name: 'postChooser',
    message: 'What would you like to see?',
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

////////////////////PRINT CHOSEN DATA//////////////////////////

function printHomepagePost(url) {
  reddit.getPage(url, function(data1) {
    reddit.listPosts(data1, function(data2) {
      choosePost(data2, function(data3) {
        reddit.makePostObj(data3, function(post) {
          reddit.makeCommentObj(data3, function(comments){
            reddit.printPost(post, comments, function() {
              showMainMenu();
            });
          });
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
          reddit.makePostObj(data4, function(post) {
            reddit.printPost(post, function() {
              printSortedHomepagePost();
            });
          });
        });
      });
    });
  });
}

function printSubredditPost(){
  whichSubreddit(function(data1) {
    getSubreddit(data1, function(data2) {
      reddit.listPosts(data2, function(data3) {
        choosePost(data3, function(data4) {
          reddit.makePostObj(data4, function(post) {
            reddit.printPost(post, function() {
              showMainMenu();
            });
          });
        });
      });
    });
  });
}

function printSortedSubreddit() {
  whichSubreddit(function(data1) {
    sortedMenu(function(data2) {
      getSortedSubreddit(data1, data2, function(data3) {
        reddit.listPosts(data3, function(data4) {
          choosePost(data4, function(data5) {
            reddit.makePostObj(data5, function(post) {
              reddit.printPost(post, function() {
                showMainMenu();
              });
            });
          });
        });
      });
    });
  });
}

function printListOfSubreddits() {
  reddit.getSubreddits(function(data1) {
    choosePost(data1, function(data2) {
      reddit.getPage(data2, function(data3) {
        reddit.listPosts(data3, function(data4) {
          choosePost(data4, function(data5) {
            reddit.makePostObj(data5, function(post) {
              reddit.makeCommentObj(data5, function(comments) {
                reddit.printPost(post, comments, function() {
                  showMainMenu();
                });
              });
            });
          });
        });
      });
    });
  });
}


///////////THESE FUNCTIONS FETCH DATA / RETURN TO OTHER FUNCTIONS ON THIS PAGE//////////////////////////

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