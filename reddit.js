var colors = require('colors');
var request = require('request');
var inquirer = require('inquirer');

// MENU
var menuChoices = [
    {name: 'Show homepage', value: 'HOMEPAGE'},
    {name: 'Show sorted homepage', value: 'SORTEDHOMEPAGE'},
    {name: 'Show subreddit', value: 'SUBREDDIT'},
    {name: 'Show sorted subreddit', value: 'SORTEDSUBREDDIT'},
    {name: 'List subreddits', value: 'LISTSUBREDDITS'},
    new inquirer.Separator(),
    {name: 'Quit', value: 'QUIT'}
];

function menu() {
    inquirer.prompt({
      type: 'list',
      name: 'menu',
      message: 'What do you want to do?',
      choices: menuChoices
    }).then(
        function(choice) {
            if (choice.menu === "HOMEPAGE") {
                getHomepage(function(posts) {
                    console.log("Posts: ");
                    console.log(posts);
                    menu();
                });
            } else if (choice.menu === "SORTEDHOMEPAGE") {
                sortedMenu();
            } else if (choice.menu === "SUBREDDIT") {
                whichSubreddit();
            } else if (choice.menu === "SORTEDSUBREDDIT") {
                whichSortedSubreddit();
            } else if (choice.menu === "LISTSUBREDDITS") {
                
            } else if (choice.menu === "QUIT") {
                return;
            }
        }
    );
}

// Menu first call
menu();

/*
This function should "return" the default homepage posts as an array of objects
*/
function getHomepage(callback) {
    var address = "https://www.reddit.com/.json";
    request(address, function(err, result) {
    	var resultObject = JSON.parse(result.body);
        
        // making an object for each post
    	var postObj = {};
    	resultObject.data.children.forEach(function(post) {
        	postObj[post.data.title.substring(0, 25)+"..."] = {
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
            } else if (choice.sorted === "QUIT") {
                return;
            } else { getSortedHomepage(choice.sorted, function(posts) {
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
    var address = "https://www.reddit.com/"+sortingMethod.toLowerCase()+".json";
    request(address, function(err, result) {
    	var resultObject = JSON.parse(result.body);
        
        // making an object for each post
    	var postObj = {};
    	resultObject.data.children.forEach(function(post) {
        	postObj[post.data.title.substring(0, 25)+"..."] = {
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
    var address = "https://www.reddit.com/r/"+urlFriendlySubreddit+".json";
    request(address, function(err, result) {
    	var resultObject = JSON.parse(result.body);
        
        if (resultObject.error) {
    	    console.log("We couldn't find anything related to your request.");
    	    menu();
    	} else if (resultObject.data.children === 0) {
    	    console.log("We couldn't find anything related to your request.");
    	    menu();
    	} else {
    	// making an object for each post
        	var postObj = {};
        	resultObject.data.children.forEach(function(post) {
            	postObj[post.data.title.substring(0, 25)+"..."] = {
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
                    } else if (choice.sorted === "QUIT") {
                        return;
                    } else { 
                        getSortedSubreddit(answer.whichsub, choice.sorted, function(posts) {
                            console.log("Posts: ");
                            console.log(posts);
                            sortedSubredditMenu()
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
    var address = "https://www.reddit.com/r/"+urlFriendlySubreddit+"/"+sortingMethod.toLowerCase()+"/.json";
    request(address, function(err, result) {
    	var resultObject = JSON.parse(result.body);
        
        if (resultObject.error) {
    	    console.log("We couldn't find anything related to your request.");
    	    whichSortedSubreddit();
    	} else if (resultObject.data.children === 0) {
    	    console.log("We couldn't find anything related to your request.");
    	    whichSortedSubreddit();
    	} else {
            // making an object for each post
        	var postObj = {};
        	resultObject.data.children.forEach(function(post) {
            	postObj[post.data.title.substring(0, 25)+"..."] = {
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

/*
This function should "return" all the popular subreddits
*/
function getSubreddits(callback) {
  // Load reddit.com/subreddits.json and call back with an array of subreddits
}

// Export the API
module.exports = {
    //
};
