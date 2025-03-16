document.addEventListener("DOMContentLoaded", async function () {

    const recipes = await getBookmarks();
    displayRecipeBookmarks(recipes);

});

async function getBookmarks() {
    try {
        const response = await fetch("/api/bookmarks")
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);

        return json;

    } catch (error) {
        console.error(error.message);
    }
}


function displayRecipeBookmarks(recipes) {

    const recipeBookmarksContainer = document.getElementById("recipeBookmarks");
    recipeBookmarksContainer.innerHTML = "";

    const recipeBookmarkedCardsHTML = recipes.map((recipe, index) => `
        <div class="col">
            <div class="card">
                <img src="${recipe.image_url}" class="card-img-top" alt="${recipe.title}">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text">Preparation Time: ${recipe.preparation_time} mins. | Serving size: ${recipe.serving_size}</p>
                    <button type="button" class="btn btn-primary" id="moreInfoButton${index}" data-bs-toggle="modal" data-bs-target="#recipeModal">
                        More Info 
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    recipeBookmarksContainer.innerHTML = recipeBookmarkedCardsHTML;

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
            ${recipe.usedIngredients.map(ingredient => `<li class="text-primary">${ingredient}</li>`).join('')}
        </ul>

        <h3>Missed Ingredients</h3>
        <ul>
            ${recipe.missedIngredients.map(ingredient => `<li class="text-secondary">${ingredient}</li>`).join('')}
        </ul>

        <h3>Instructions</h3>
        <p>${recipe.instructions}</p>    

        <a href="${recipe.source_url}" target="_blank">Link to Recipe</a>
    `;
    
    recipeModalTitle.textContent = recipe.title;
    recipeModalBody.innerHTML = recipeModalBodyContent;

    document.getElementById('bookmarkButton').textContent = "Delete";
    document.getElementById('bookmarkButton').addEventListener('click', () => {
        deleteBookmark(recipe['id']);
    });
}


async function deleteBookmark(id) {
    try {
        const response = await fetch(`/api/bookmarks/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        location.reload()
    } catch (error) {
        console.error(error.message);
    }
}
