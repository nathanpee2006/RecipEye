let API_KEY = null;

const getAPI_KEY = fetch("/api-key")
    .then((response) => response.json())
    .then((key) => {
        return key;
    });

const initAPI_KEY = async () => {
    API_KEY = await getAPI_KEY;
};

initAPI_KEY();

let inputCounter = 1;

function clone() {
    // Create a clone of input field
    const node = document.getElementById("input");
    const clone = node.cloneNode(true);

    // Clear values of created input field
    clone.querySelectorAll("input").forEach(clear);

    function clear(input) {
        input.value = "";
    }

    // Increment id of new input field
    clone.id = "input" + inputCounter;

    // Append to div
    document.getElementById("extra-inputs").appendChild(clone);

    // Create a delete button
    const button = document.createElement("button");
    button.className = "btn btn-secondary";
    button.type = "button";
    button.onclick = function() {
        document.getElementById(clone.id).remove();
    };
    button.textContent = "X";

    // Append to created input field
    document.getElementById(clone.id).appendChild(button);

    inputCounter += 1;
}

const button = document.getElementById("search");
button.addEventListener("click", async function() {
    // Clear page when refreshed
    document.getElementById("recipes").replaceChildren();

    let recipeByIngredientsURL =
        "https://api.spoonacular.com/recipes/findByIngredients?apiKey=" +
        API_KEY +
        "&ingredients=";

    let inputs = document.querySelectorAll("input"); // Is a request counted if nodeList is empty? If so, end function.
    for (let i = 0; i < inputs.length; i++) {
        let ingredient = inputs[i].value;

        // Ignore empty fields
        if (ingredient === "") {
            continue;
        }

        // Ensure inputs have no whitespace in between
        if (ingredient.includes(" ")) {
            ingredient = ingredient.replace(/ /g, "+");
        }

        // One ingredient
        if (inputs[i] === inputs[0]) {
            recipeByIngredientsURL += ingredient;
        }

        // Multiple ingredients
        else {
            recipeByIngredientsURL += ",+" + ingredient;
        }
    }

    // More filter options: Include complex searches (such as cuisine type, summary and instruction of recipes)
    recipeByIngredientsURL += "&ranking=1";

    let recipeExtraInfoURL =
        "https://api.spoonacular.com/recipes/informationBulk?apiKey=" +
        API_KEY +
        "&ids=";
    let recipeIds = [];

    let recipes = null;

    try {
        const response = await fetch(recipeByIngredientsURL);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();

        recipes = data;

        // Store ids in recipeIds
        data.forEach((recipe) => {
            recipeIds.push(recipe["id"]);
        });

        // Append ids to recipeExtraInfoURL
        for (let j = 0; j < recipeIds.length; j++) {
            recipeExtraInfoURL += recipeIds[j] + ",";
        }
    } catch (error) {
        console.error(error.message);
    }

    try {
        const response = await fetch(recipeExtraInfoURL);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();

        for (let k = 0; k < recipes.length; k++) {
            Object.assign(recipes[k], data[k]);
        }
    } catch (error) {
        console.error(error.message);
    }

    let modalCounter = 0;
    let bookmarkButtonCounter = 0;

    recipes.forEach((recipe) => {
        let used = "";
        recipe["usedIngredients"].forEach((ingredient) => {
            used += `<li class="list-group-item text-primary">${ingredient["originalName"]}</li>`;
        });

        let missed = "";
        recipe["missedIngredients"].forEach((ingredient) => {
            missed += `<li class="list-group-item text-secondary">${ingredient["originalName"]}</li>`;
        });

        modalCounter += 1;
        bookmarkButtonCounter += 1;

        let recipeCard = `
  <div class="col">
      <div class="card">
          <img src="${recipe["image"]}" class="card-img-top" alt="...">
          <div class="card-body">
              <h5 class="card-title">${recipe["title"]}</h5>
              <h6 class="card-subtitle mb-2 text-body-secondary">${recipe["dishTypes"].join(", ")}</h6>
              <p>Serving Size: ${recipe["servings"]}</p>
              <p>Preparation Time (in minutes): ${recipe["readyInMinutes"]}</p>
              <ul class="list-group list-group-flush">${used}</ul>
              <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${
                "modal" + modalCounter
              }">More Info</button>

              <div class="modal fade" id="${
                "modal" + modalCounter
              }" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div class="modal-dialog">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h1 class="modal-title fs-5" id="exampleModalLabel">More Info</h1>
                              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div class="modal-body">
                              <p>Likes: ${recipe["likes"]}</p>
                              <p>Health Score: ${recipe["healthScore"]}</p>
                              <p>Diet Type: ${recipe["diets"].join(
                                ", "
                              )}</p>
                              <ul class="list-group list-group-flush">${missed}</ul>
                              <a href="${
                                recipe["sourceUrl"]
                              }" target="_blank">Link to Recipe</a>
                          </div>
                          <div class="modal-footer">
                              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                              <button type="button" class="btn btn-primary" id="${"bookmark" + bookmarkButtonCounter}">Bookmark</button>
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </div>
  </div>
`;
        document.getElementById("recipes").insertAdjacentHTML("beforeend", recipeCard);

        let bookmarkId = "bookmark" + bookmarkButtonCounter;
        let bookmarkButton = document.getElementById(bookmarkId);

        bookmarkButton.addEventListener("click", () =>
            addBookmark(recipe)
        )
    });
});

async function addBookmark(data) {
    try {

        // console.log(data);
        let usedIngredientsArr = [];
        data["usedIngredients"].forEach(ingredient =>
            usedIngredientsArr.push(ingredient['originalName'])
        )

        let missedIngredientsArr = [];
        data["missedIngredients"].forEach(ingredient =>
            missedIngredientsArr.push(ingredient['originalName'])
        )

        const response = await fetch("/api/bookmarks", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                image: data["image"],
                title: data["title"],
                dishTypes: data["dishTypes"],
                servings: data["servings"],
                readyInMinutes: data["readyInMinutes"],
                likes: data["likes"],
                healthScore: data["healthScore"],
                diets: data["diets"],
                sourceUrl: data["sourceUrl"],
                usedIngredients: usedIngredientsArr,
                missedIngredients: missedIngredientsArr
            }),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(error.message);
    }
}
