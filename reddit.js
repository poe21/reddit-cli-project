var colors = require('colors');
var request = require('request');
var inquirer = require('inquirer');

// MENU CHOICES
var menuChoices = [
    {name: 'Show homepage posts', value: 'HOMEPAGE'},
    {name: 'Show sorted homepage posts', value: 'SORTEDHOMEPAGE'},
    {name: 'Show subreddit', value: 'SUBREDDIT'},
    {name: 'Show sorted subreddit', value: 'SORTEDSUBREDDIT'},
    {name: 'List subreddits', value: 'LISTSUBREDDITS'},
    new inquirer.Separator(),
    {name: 'Quit', value: 'QUIT'}
];

// MAIN MENU 
function menu() {
  inquirer.prompt({
    type: 'list',
    name: 'menu',
    message: 'What do you want to do?',
    choices: menuChoices
  }).then(
    function(choice) {
      if (choice.menu === "HOMEPAGE") {
        getPostsList("https://www.reddit.com");
      }
      else if (choice.menu === "SORTEDHOMEPAGE") {
        sortedMenu();
      }
      else if (choice.menu === "SUBREDDIT") {
        whichSubreddit();
      }
      else if (choice.menu === "SORTEDSUBREDDIT") {
        whichSortedSubreddit();
      }
      else if (choice.menu === "LISTSUBREDDITS") {
        getSubredditsList();
      }
      else if (choice.menu === "QUIT") {
        return;
      }
    }
  );
}

// Main menu first call, starts program
menu();

// makes a choice menu using the listed posts
function getPostsList(address) {
  request(address+"/.json", function(err, result) {
    var resultObject = JSON.parse(result.body);
    var postChoices = [];

    // making an object for each post
    var postObj = {};
    resultObject.data.children.forEach(function(post) {
      postObj = {
        name: post.data.title,
        value: "https://www.reddit.com" + post.data.permalink
      };
      // push each object into the choices menu array
      postChoices.push(postObj);
    });

    // pushing more options to the menu
    postChoices.push(
      new inquirer.Separator(), {
        name: 'Go back to main menu',
        value: 'BACK'
      }, {
        name: 'Quit',
        value: 'QUIT'
      },
      new inquirer.Separator()
    );

    // calls the list of posts from the chosen page
    postsList();

    function postsList() {
      inquirer.prompt({
        type: 'list',
        name: 'postlist',
        message: 'Which post from the list would you like to view?',
        choices: postChoices
      }).then(function(choice) {
        if (choice.postlist === "BACK") {
          menu();
        }
        else if (choice.postlist === "QUIT") {
          return;
        }
        else {
          // calls the function to display the posts of the chosen subreddit
          getPosts(choice.postlist, function(posts) {
            console.log("\033c"); // clears console
            console.log("Posts: ");
            console.log(posts);
            postsList();
          });
        }
      });
    }
  });
}

function getPosts(address, callback) {
  request(address+".json", function(err, result) {
    var resultObject = JSON.parse(result.body);
    
    // making an object for each post
    var postObj = {
      Title: resultObject[0].data.children[0].data.title,
      by: resultObject[0].data.children[0].data.author,
      url: "https://www.reddit.com" + resultObject[0].data.children[0].data.permalink,
      votes: resultObject[0].data.children[0].data.ups
    };
    callback(postObj);
  });
}

/*
This function should "return" the default homepage posts as an array of objects
*/
function getHomepage(callback) {
  var address = "https://www.reddit.com/.json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    console.log(resultObject);
    // making an object for each post
    var postObj = {};
    resultObject.data.children.forEach(function(post) {
      postObj[post.data.title.substring(0, 25) + "..."] = {
        Title: post.data.title,
        by: post.data.author,
        url: "https://www.reddit.com" + post.data.permalink,
        votes: post.data.ups
      };
    });
    callback(postObj);
  });
  // Load reddit.com/.json and call back with the array of posts
}

/*
This function should "return" the default homepage posts as an array of objects.
In contrast to the `getHomepage` function, this one accepts a `sortingMethod` parameter.
*/
var sortedMenuChoices = [
    {name: 'Show Hot', value: 'HOT'},
    {name: 'Show New', value: 'NEW'},
    {name: 'Show Rising', value: 'RISING'},
    {name: 'Show Controversial', value: 'CONTROVERSIAL'},
    {name: 'Show Top', value: 'TOP'},
    new inquirer.Separator(),
    {name: 'Go back to main menu', value: 'BACK'},
    {name: 'Quit', value: 'QUIT'}
];

function sortedMenu() {
  inquirer.prompt({
    type: 'list',
    name: 'sorted',
    message: 'How would you like the homepage to be sorted?',
    choices: sortedMenuChoices
  }).then(
    function(choice) {
      if (choice.sorted === "BACK") {
        menu();
      }
      else if (choice.sorted === "QUIT") {
        return;
      }
      else {
        getSortedHomepage(choice.sorted, function(posts) {
          console.log("Posts: ");
          console.log(posts);
          sortedMenu();
        });
      }
    }
  );
}

function getSortedHomepage(sortingMethod, callback) {
  // Load reddit.com/{sortingMethod}.json and call back with the array of posts
  // Check if the sorting method is valid based on the various Reddit sorting methods
  var address = "https://www.reddit.com/" + sortingMethod.toLowerCase() + ".json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);

    // making an object for each post
    var postObj = {};
    resultObject.data.children.forEach(function(post) {
      postObj[post.data.title.substring(0, 25) + "..."] = {
        Title: post.data.title,
        by: post.data.author,
        url: "https://www.reddit.com" + post.data.permalink,
        votes: post.data.ups
      };
    });
    callback(postObj);
  });
}

// User prompt asking which subreddit the user wants to view
function whichSubreddit() {
  var question = [{
    type: "input",
    name: "whichsub",
    message: "Which subreddit would you like to view?"
  }];
  inquirer.prompt(question).then(function(answer) {
    getSubreddit(answer.whichsub, function(posts) {
      console.log("Posts: ");
      console.log(posts);
      menu();
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

    if (resultObject.error) {
      console.log("We couldn't find anything related to your request.");
      menu();
    }
    else if (resultObject.data.children === 0) {
      console.log("We couldn't find anything related to your request.");
      menu();
    }
    else {
      // making an object for each post
      var postObj = {};
      resultObject.data.children.forEach(function(post) {
        postObj[post.data.title.substring(0, 25) + "..."] = {
          Title: post.data.title,
          by: post.data.author,
          url: "https://www.reddit.com" + post.data.permalink,
          votes: post.data.ups
        };
      });
      callback(postObj);
    }
  });
}

function whichSortedSubreddit() {
  var question = [{
    type: "input",
    name: "whichsub",
    message: "Which subreddit would you like to view?"
  }];
  inquirer.prompt(question).then(function(answer) {
    sortedSubredditMenu();

    function sortedSubredditMenu() {
      inquirer.prompt({
        type: 'list',
        name: 'sorted',
        message: 'How would you like the homepage to be sorted?',
        choices: sortedMenuChoices
      }).then(
        function(choice) {
          if (choice.sorted === "BACK") {
            menu();
          }
          else if (choice.sorted === "QUIT") {
            return;
          }
          else {
            getSortedSubreddit(answer.whichsub, choice.sorted, function(posts) {
              console.log("Posts: ");
              console.log(posts);
              sortedSubredditMenu();
            });
          }
        }
      );
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
  var address = "https://www.reddit.com/r/" + urlFriendlySubreddit + "/" + sortingMethod.toLowerCase() + "/.json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);

    if (resultObject.error) {
      console.log("We couldn't find anything related to your request.");
      whichSortedSubreddit();
    }
    else if (resultObject.data.children === 0) {
      console.log("We couldn't find anything related to your request.");
      whichSortedSubreddit();
    }
    else {
      // making an object for each post
      var postObj = {};
      resultObject.data.children.forEach(function(post) {
        postObj[post.data.title.substring(0, 25) + "..."] = {
          Title: post.data.title,
          by: post.data.author,
          url: "https://www.reddit.com" + post.data.permalink,
          votes: post.data.ups
        };
      });
      callback(postObj);
    }
  });
}

// makes a choice menu using the popular subreddits list from reddit.com/subreddits
function getSubredditsList() {
  var address = "https://www.reddit.com/subreddits.json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    var subredditChoices = [];

    // making an object for each subreddit
    var subredditObj = {};
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

    // calls the subreddit list
    subredditList();

    function subredditList() {
      inquirer.prompt({
        type: 'list',
        name: 'sublist',
        message: 'Which subreddit from the list would you like to view?',
        choices: subredditChoices
      }).then(function(choice) {
        if (choice.sublist === "BACK") {
          menu();
        }
        else if (choice.sublist === "QUIT") {
          return;
        }
        else {
          // calls the function to display the posts of the chosen subreddit
          getSubreddits(choice.sublist, function(posts) {
            console.log("Posts: ");
            console.log(posts);
            subredditList();
          });
        }
      });
    }
  });
}

/*
This function "returns" posts from a chosen popular subreddit
*/
function getSubreddits(subreddit, callback) {
  var address = subreddit + "/.json";
  request(address, function(err, result) {
    var resultObject = JSON.parse(result.body);
    // making an object for each post
    var postObj = {};
    resultObject.data.children.forEach(function(post) {
      postObj[post.data.title.substring(0, 25) + "..."] = {
        Title: post.data.title,
        by: post.data.author,
        url: "https://www.reddit.com" + post.data.permalink,
        votes: post.data.ups
      };
    });
    callback(postObj);
  });
}

// Export the API
module.exports = {
  //
};