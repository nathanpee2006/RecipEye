let inputCounter = 1;
function cloneInputField() {
    // Create a clone of input field
    const node = document.getElementById("ingredient0");
    const clone = node.cloneNode(true);

    // Clear values of created input field
    clone.querySelectorAll("input").forEach(clear);
    function clear(input) {
        input.value = "";
    }

    // Increment id of new input field
    clone.id = "ingredient" + inputCounter;

    // Append to div
    document.getElementById("input").appendChild(clone);

    let currentNumberOfIngredients = document.querySelectorAll("input").length;

    // Create a delete button to remove an ingredient
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-secondary";
    deleteButton.type = "button";
    deleteButton.textContent = "X";
    deleteButton.addEventListener('click', () => {
        document.getElementById(clone.id).remove();
        if (currentNumberOfIngredients < requiredNumberOfIngredients) {
            hideSearchButton();
        }
    });

    // Append delete button to created input field
    document.getElementById(clone.id).appendChild(deleteButton);
    inputCounter += 1;

    
    const requiredNumberOfIngredients = 3;
    if (currentNumberOfIngredients > requiredNumberOfIngredients && !document.getElementById("search")) {
        showSearchButton();
    }
}


function showSearchButton() {
    const searchButton = document.createElement('button'); 
    searchButton.className = "btn btn-primary";
    searchButton.id = "search";
    searchButton.type = "button";
    searchButton.textContent = "Search";
    document.getElementById('add').insertAdjacentElement('afterend', searchButton);
    searchButton.addEventListener('click', getRecipes);
}


function hideSearchButton() {
    const searchButton = document.getElementById("search");
    if (searchButton) {
        searchButton.remove();
    } 
}


async function getRecipes() {
    try {
        const ingredients = document.querySelectorAll("input");
        const ingredientNames = [];
        ingredients.forEach(ingredient => {
            ingredientNames.push(ingredient.value);
        });        

        const response = await fetch('/recipes?ingredients=' + ingredientNames.join(','));
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);

        displayRecipes(json);

    } catch (error) {
        console.error(error.message);
    }
}


function displayRecipes(recipes) {
    const recipesContainer = document.getElementById("recipes");
    recipesContainer.innerHTML = "";

    const recipeCardsHTML = recipes.map((recipe, index) => `
        <div class="col">
            <div class="card">
                <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text">Preparation Time: ${recipe.readyInMinutes} mins. | Serving size: ${recipe.servings}</p>
                    <button type="button" class="btn btn-primary" id="moreInfoButton${index}" data-bs-toggle="modal" data-bs-target="#recipeModal">
                        More Info 
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    recipesContainer.innerHTML = recipeCardsHTML;

    recipes.forEach((recipe, index) => {
        const moreInfoButton = document.getElementById(`moreInfoButton${index}`);
        moreInfoButton.addEventListener('click', () => {
            displayRecipeModal(recipe);
        });
    })
}


function displayRecipeModal(recipe) {
    
    const recipeModalTitle = document.getElementById("recipeModalLabel");
    const recipeModalBody = document.getElementById("recipeModalBody");

    recipeModalTitle.textContent = "";
    recipeModalBody.innerHTML = "";

    const recipeModalBodyContent = `
        <h3>Summary</h3>
        <p>${recipe.summary}</p>

        <h3>Ingredients</h3>
        <ul>
            ${recipe.usedIngredients.map(ingredient => `<li class="text-primary">${ingredient.original}</li>`).join('')}
        </ul>

        <h3>Missed Ingredients</h3>
        <ul>
            ${recipe.missedIngredients.map(ingredient => `<li class="text-secondary">${ingredient.original}</li>`).join('')}
        </ul>

        <h3>Instructions</h3>
        <p>${recipe.instructions}</p>    

        <a href="${recipe.sourceUrl}" target="_blank">Link to Recipe</a>
    `;
    
    recipeModalTitle.textContent = recipe.title;
    recipeModalBody.innerHTML = recipeModalBodyContent;

    document.getElementById('bookmarkButton').textContent = "Bookmark";
    document.getElementById('bookmarkButton').addEventListener('click', () => {
        addBookmark(recipe);
    });
}


async function addBookmark(recipe) {
    try {
        const recipeData = {
            title: recipe.title,
            image_url: recipe.image,
            preparation_time: recipe.readyInMinutes,
            serving_size: recipe.servings,
            summary: recipe.summary,
            instructions: recipe.instructions,
            source_url: recipe.sourceUrl,
            ingredients: [
                ...recipe.usedIngredients.map(ing => ({
                    name: ing.original,
                    is_used: true
                })),
                ...recipe.missedIngredients.map(ing => ({
                    name: ing.original,
                    is_used: false
                }))
            ]
        };

        const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipeData)
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(error.message);
    }
}
