import csv
import requests

from flask import redirect, render_template, session
from functools import wraps

# https://spoonacular.com/food-api/docs#List-of-Ingredients
def ingredients():
    ingredients = []
    with open('ingredients.csv', 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            ingredients.append(row['ingredient'])

    return ingredients


# https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/#login-required-decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


