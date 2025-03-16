import bcrypt
import json
import requests
import sqlite3

from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session

from helpers import ingredients, login_required

# Initialisation
app = Flask(__name__)

# Load environment variables
app.config.from_pyfile("settings.py")

# Configuration
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.route("/")
@login_required
def index():

    # GET

    # Let user input or select ingredients
    # Give user the option to add or delete ingredients
    # Make a GET request to Spoonacular API
    # Gather ingredients from input fields and append to URL
    # Display recipe suggestions
    ingredients_list = ingredients()

    return render_template("index.html", ingredients=ingredients_list)


@app.route("/register", methods=["GET", "POST"])
def register():

    # POST
    if request.method == "POST":

        # Validate user input
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        if not username or not password or not confirmation:
            flash("Missing input!", "text-secondary")
            return render_template("register.html")

        if password != confirmation:
            flash("Passwords do not match!", "text-secondary")
            return render_template("register.html")

        # Database connection and cursor
        con = sqlite3.connect("database.db")
        cur = con.cursor()

        # Ensure username is unique
        rows = cur.execute(
            "SELECT username FROM users WHERE username = ?", (username,)).fetchone()
        if not rows:
            pass
        else:
            con.close()
            flash("Username is already taken!", "text-secondary")
            return render_template("register.html")

        # Generate hash of password
        salt = bcrypt.gensalt(rounds=15)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        # Store inside databse
        cur.execute("INSERT INTO users (username, password) VALUES(?, ?)",
                    (username, hashed_password))
        con.commit()
        con.close()

        # Redirect user to login
        flash("Account successfully created!", "text-primary")
        return redirect("/login")

    # GET
    else:
        return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():

    # POST
    if request.method == "POST":

        # Clear session data
        session.clear()

        # Validate user input
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            flash("Missing input!", "text-secondary")
            return render_template("login.html")

        # Database connection and cursor
        con = sqlite3.connect("database.db")
        cur = con.cursor()

        # Query database
        rows = cur.execute(
            "SELECT * FROM users WHERE username = ?", (username,)).fetchall()
        con.close()

        # Ensure username exists and plaintext password matches hashed password in database
        if len(rows) != 1 or not bcrypt.checkpw(password.encode('utf-8'), rows[0][2]):
            con.close()
            flash("Invalid username or password!", "text-secondary")
            return render_template("login.html")

        # Track session id
        session["user_id"] = rows[0][0]

        # Redirect user to home page
        flash("Logged in successfully!", "text-primary")
        return redirect("/")

    # GET
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():

    # Clear the session
    session.clear()

    # Redirect user to login page
    flash("Logged out successfully!", "text-primary")
    return redirect("/login")


@app.route("/reset", methods=["GET", "POST"])
def reset():

    # POST
    if request.method == "POST":
        pass

        # Validate user input
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        if not username or not password or not confirmation:
            flash("Missing input!", "text-secondary")
            return render_template("reset.html")

        if password != confirmation:
            flash("Passwords do not match!", "text-secondary")
            return render_template("reset.html")

        # Database Connection and Cursor
        con = sqlite3.connect("database.db")
        cur = con.cursor()

        # Query database
        rows = cur.execute(
            "SELECT username FROM users WHERE username = ?", (username,)).fetchone()

        # Ensure username exists in database
        if not rows:
            flash("Username does not exist!", "text-secondary")
            return render_template("reset.html")

        # Generate new hashed password
        salt = bcrypt.gensalt(rounds=15)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        # Update old password with new hashed password
        cur.execute("UPDATE users SET password = ? WHERE username = ?",
                    (hashed_password, username))
        con.commit()
        con.close()

        # Redirect user to login page
        flash("Password successfully reset!", "text-primary")
        return redirect("/login")

    # GET
    else:
        return render_template("reset.html")


@app.route("/recipes", methods=["GET"])
@login_required
def get_recipes():
    api_key = app.config["API_KEY"]
    ingredients = request.args.get("ingredients")
    recipes_by_ingredients_url = f"https://api.spoonacular.com/recipes/findByIngredients?apiKey={api_key}&ingredients={ingredients}&number=10&ranking=1&ignorePantry=true"
    res1 = requests.get(recipes_by_ingredients_url)
    recipes = res1.json()

    recipe_ids = []
    for recipe in recipes:
        recipe_ids.append(recipe["id"])

    recipes_information_url = f"https://api.spoonacular.com/recipes/informationBulk?apiKey={api_key}&ids={','.join(map(str, recipe_ids))}"
    res2 = requests.get(recipes_information_url)
    recipe_information = res2.json()

    # Combine both responses
    for recipe in recipes:
        for info in recipe_information:
            if recipe["id"] == info["id"]:
                recipe.update(info)

    # Return JSON data
    return jsonify(recipes)


@app.route("/bookmark")
def bookmark():
    return render_template("bookmark.html")


@app.route("/api/bookmarks")
def get_bookmarks():

    # Query database to display recipe information for recipe card
    con = sqlite3.connect("database.db")
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    rows = cur.execute("""
        SELECT id, title, image_url, summary, instructions, preparation_time, serving_size, source_url
        FROM recipes
        WHERE user_id = ?
    """, (session["user_id"],)).fetchall()

    RECIPES = []
    for row in rows:
        RECIPES.append(dict(row))
    
    for recipe in RECIPES:

        ingredients = cur.execute("""
            SELECT name, is_used
            FROM ingredients
            WHERE recipe_id = ?
        """, (recipe["id"],)).fetchall()

        recipe["usedIngredients"] = []
        recipe["missedIngredients"] = []
    
        for ingredient in ingredients:
            if ingredient["is_used"] == 1:
                recipe["usedIngredients"].append(ingredient["name"])
            else:
                recipe["missedIngredients"].append(ingredient["name"])
    
    con.commit()
    con.close()

    return jsonify(RECIPES)


@app.route("/api/bookmarks", methods=["POST"])
def add_bookmark():

    # Use fetch to POST JSON data to Flask server

    # Retrieve JSON
    recipe = request.get_json()

    # Database connection and cursor
    con = sqlite3.connect("database.db")
    cur = con.cursor()

    # Handle duplicate bookmark
    rows = cur.execute("SELECT title FROM recipes WHERE user_id = ?", (session["user_id"],)).fetchall()
    for title in rows:
        if title[0] == recipe["title"]:
            con.close()
            return jsonify({'message': 'Recipe already bookmarked'}) 

    # Insert current user's bookmarked recipe into database 
    cur.execute("""
        INSERT INTO recipes (user_id, title, image_url, summary, instructions, preparation_time, serving_size, source_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (session['user_id'], recipe['title'], recipe['image_url'], recipe['summary'], 
          recipe['instructions'], recipe['preparation_time'], recipe['serving_size'], recipe['source_url']))
    
    recipe_id = cur.lastrowid

    # Insert ingredients into database
    for ingredient in recipe['ingredients']:
        cur.execute("""
            INSERT INTO ingredients (recipe_id, name, is_used)
            VALUES (?, ?, ?)
        """, (recipe_id, ingredient['name'], ingredient['is_used']))

    con.commit()
    con.close()

    return jsonify({'id': recipe['id'], 'message': 'Recipe bookmarked successfully'})


@app.route("/api/bookmarks/<id>", methods=["DELETE"])
def delete_bookmark(id):

    # Database connection and cursor
    con = sqlite3.connect("database.db")
    cur = con.cursor()

    # Delete data inside database
    cur.execute("DELETE FROM recipes WHERE id = ? AND user_id = ?", (id, session["user_id"]))

    con.commit()
    con.close()

    return jsonify({'id': id, 'message': 'Recipe deleted successfully'})



