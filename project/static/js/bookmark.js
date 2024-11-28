async function getBookmarks() {
    try {
        const response = await fetch("/api/bookmarks")
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        return json;

    } catch (error) {
        console.error(error.message);
    }
}

getBookmarks().then(json => {
    let recipes = json;

    let modalCounter = 0;
    let deleteButtonCounter = 0;

    recipes.forEach(recipe => {

        let used = "";
        JSON.parse(recipe["usedIngredients"]).forEach((ingredient) => {
            used += `<li class="list-group-item text-primary">${ingredient}</li>`;
        });

        let missed = "";
        JSON.parse(recipe["missedIngredients"]).forEach((ingredient) => {
            missed += `<li class="list-group-item text-secondary">${ingredient}</li>`;
        });

        modalCounter += 1;
        deleteButtonCounter += 1;

        let recipeCard = `
      <div class="col">
          <div class="card">
              <img src="${recipe["image"]}" class="card-img-top" alt="...">
              <div class="card-body">
                  <h5 class="card-title">${recipe["title"]}</h5>
                  <h6 class="card-subtitle mb-2 text-body-secondary">${JSON.parse(recipe["dishTypes"]).join(", ")}</h6>
                  <p>Serving Size: ${recipe["servings"]}</p>
                  <p>Preparation Time (in minutes): ${recipe["readyInMinutes"]}</p>
                  <ul class="list-group list-group-flush">${used}</ul>
                  <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${
                    "modal" + modalCounter}">More Info</button>

                  <div class="modal fade" id="${"modal" + modalCounter}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                      <div class="modal-dialog">
                          <div class="modal-content">
                              <div class="modal-header">
                                  <h1 class="modal-title fs-5" id="exampleModalLabel">More Info</h1>
                                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                              </div>
                              <div class="modal-body">
                                  <p>Likes: ${recipe["likes"]}</p>
                                  <p>Health Score: ${recipe["healthScore"]}</p>
                                  <p>Diet Type: ${JSON.parse(recipe["diets"]).join(", ")}</p>
                                  <ul class="list-group list-group-flush">${missed}</ul>
                                  <a href="${recipe["sourceUrl"]}" target="_blank">Link to Recipe</a>
                              </div>
                              <div class="modal-footer">
                                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                  <button type="button" class="btn btn-secondary" id="${"delete" + deleteButtonCounter}">Delete</button>
                              </div>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>
   `;
        document.getElementById("recipeBookmark").insertAdjacentHTML("beforeend", recipeCard);

        let deleteButtonId = "delete" + deleteButtonCounter;
        let deleteButton = document.getElementById(deleteButtonId);

        deleteButton.addEventListener("click", () =>
            deleteBookmark(recipe["id"])
        )
    })
})

async function deleteBookmark(id) {
    try {

        let url = "/api/bookmarks/" + id;

        const response = await fetch(url, {
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
