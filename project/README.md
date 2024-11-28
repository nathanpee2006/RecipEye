# RecipEye
#### Video Demo: https://www.youtube.com/watch?v=Mw0jP50qXFI
#### Description: A web app that outputs recipe suggestions based on the ingredients inputted by the user.



## How does the web app work?
If a user is having a hard time deciding what to cook or make, this app can be helpful as it can search for recipes  based on the user's ingredients.

### Registering and logging in an account
Before being able to access the website, the user must first register a new account with a username and password. Once the user creates an account, all they need to do is type in their login credentials and they can successfully use the web app.

### Resetting password
If a user forgets their password, they will be able to reset their password by clicking on 'Forgot your password?'.

### Searching recipes by ingredients
When logged in the app, the user can see an input field wherein they can type in and select the ingredients that they currently have. They can add in more input fields to accomodate for more ingredients and delete input fields to not include an ingredient for the recipe search.

Once a user has inputted their ingredients and clicked the 'Search' button, they will be presented with recipe cards. Each recipe card contains an image, title, and ingredients that match their input. Furthermore, within each recipe card there contains a 'More Info' button. This can allow the user to see additional information such as the missing ingredients and health score of the selected recipe.

### Saving recipes
Within the app, there is a bookmark section where the user can see the recipes they bookmarked. This allows them to easily view the recipes that they saved. They also have the option to delete a bookmarked recipe if they do not need it anymore.

_Note: The recipe data gathered for this project was all possible thanks to the [Spoonacular API](https://spoonacular.com/food-api)._



## Tech Stack:
- HTML, CSS, Javascript
- Python, Flask, Jinja
- SQLite
- Bootstrap

## Source Files:

### Python
- app.py - This file contains the backend or server-side logic. It contains routes that handles different request methods. It can serve HTML files and send data to the client in a JSON format to the front-end. It can store and retrieve data from a database, and do some error handling in the event user inputs something wrong. This the "Flask API" of the web app.

- helpers.py - A Python file containing helper functions, which are small and reusable code. This includes reading from a .csv file that contains a list of ingredients and writing to a file. It also ensures that a user is authenticated before being able to access the web app.

### SQLite
- database.db - A SQLite database that contains two tables:
    - users: Contains the user's id, username, and hashed password.
    - bookmarks: Stores recipe title, image, ingredients, and healthscore, etc. It also has a user id column, a foreign key, which can allow the Flask API to differentiate the user who bookmarked a specific recipe.

### HTML
- layout.html - The parent template that the proceeding HTML files utilise for consistency in design.

- register.html - A page where the user has to create a new account before logging in.

- login.html - A page where the user has to input their login credentials in order to access the web app.

- reset.html - In the event that a user forgets their password, they can access this page to reset their password.

- index.html - The home page where the user will be able to see recipe suggestions through cards that display useful information based on the inputted ingredients that the user selected.

- bookmark.html - A page where the user can visually see their saved or bookmarked recipes to save them time from searching a certain recipe again. This is distinct for every user (different users won't be able to see others' bookmarks just like the shopping cart feature of Amazon).

### JavaScript
- index.js
    -   It contains the logic to add and delete input fields.
    -   It is also responsible for making a GET request to the Spoonacular API through the fetch() function in order to gather the recipe data. It also generates the recipe cards after the user inputs their selected ingredients and clicks on the 'Search' button. After gathering the recipe data, it is placed on the recipe cards, so that it can be displayed to the user in a nice format.
    - Furthermore, it also contains code that lets the user bookmark a recipe. When the user clicks on the 'Bookmark' button it makes makes a POST request to the Flask API, where it will store the recipe data inside the database.

- bookmark.js
    - When a user goes to bookmark.html, the following code makes a GET request to the Flask API to retrieve the bookmarked recipe data inside the database. Once the recipe data is gathered, it also displayed in recipe cards.
    - It also has a function to delete a bookmarked recipe by clicking on the "Delete" button when the user does not need the recipe anymore. It does this by making a DELETE request to the Flask API where it will delete the data inside the database.

### CSS
- bootstrap.min.css - A CSS file from [Bootswatch](https://bootswatch.com/minty/) that provides free Bootstrap themes. This handles all of the styling (i.e. color) and responsiveness (i.e. scaling down when broswer window is becoming smaller) of the web page.






