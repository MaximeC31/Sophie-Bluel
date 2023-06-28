// Function to create filter buttons based on categories
async function initFilters() {
  try {
    // Get categories from API
    const filterForm = document.querySelector("#projectOrganization");
    const response = await fetch("http://localhost:5678/api/categories");

    if (response.status === 200) {
      const categories = await response.json();
      console.log("init cat response 20X", response);
      console.log("init categories ", categories);

      // Create 'All' filter button
      const buttonAll = document.createElement("button");
      buttonAll.className = "projectSelection";
      buttonAll.type = "submit";
      buttonAll.dataset.id = "0";
      buttonAll.textContent = "All";
      filterForm.appendChild(buttonAll);

      // Create filter buttons for each category
      for (const category of categories) {
        const buttonFilter = document.createElement("button");
        buttonFilter.className = "projectSelection";
        buttonFilter.type = "submit";
        buttonFilter.dataset.id = category.id;
        buttonFilter.textContent = category.name;
        filterForm.appendChild(buttonFilter);
      }

      return categories;

    } else {
      console.error(response.status, response);
    }

  } catch (error) {
    console.error(error);
  }
}





// Function to return projects from API
async function initProjects() {
  try {
    // Get works from API
    const response = await fetch("http://localhost:5678/api/works");

    if (response.status === 200) {
      let worksList = await response.json();
      console.log("init worksList response 20X", response);
      console.log("init workList", worksList);
      refreshProjects(worksList);
      return worksList;
    }
    else {
      console.error(response.status, response);
    }

  } catch (error) {
    console.error(error);
  }
}

// Function to display projects on mainscreen
function refreshProjects(worksList) {
  console.log("workList on main screen refresh", worksList);
  const galleryContainer = document.querySelector(".gallery");
  galleryContainer.innerHTML = "";

  // Create and show projects in the gallery
  for (const work of worksList) {
    const projectHTML = `<figure><img src="${work.imageUrl}" alt="${work.title}"><figcaption>${work.title}</figcaption></figure>`;
    galleryContainer.insertAdjacentHTML("beforeend", projectHTML);
  }
}





// Filter projects based on the selected category
function filterProjects(projectId, worksList) {

  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  // Filter projects based on the selected category
  const filteredProjects = worksList.filter((project) => {
    if (projectId === "0") {
      return true;
    } else {
      return projectId == project.category.id;
    }
  })

  // Display filtered projects in the gallery
  for (const work of filteredProjects) {
    const projectContainer = document.createElement("figure");
    gallery.appendChild(projectContainer);

    const projectImg = document.createElement("img");
    projectImg.src = work.imageUrl;
    projectImg.alt = work.title;
    projectContainer.appendChild(projectImg);

    const projectTitle = document.createElement("figcaption");
    projectTitle.innerHTML = work.title;
    projectContainer.appendChild(projectTitle);
  }
}





// Function to create interface elements for logged users
function createInterfaceForLoggedUsers(worksList, categories) {

  // Check if token is present in localStorage to determine if the user is logged
  if (localStorage.getItem("token")) {

    // Create interface for logged-in users
    document.getElementById("stock-header").style.margin = "100px 0";
    const loggedHeader = document.createElement("header");
    loggedHeader.innerHTML = `
<i class='fa-solid fa-pen-to-square'></i>
<p>Mode édition</p>
<a class='publish-button'>Pulier les changements</a>
`
    loggedHeader.id = "logged-header";
    document.getElementById("log-button-event").innerText = "logout";
    document.getElementById("log-button-event").setAttribute("href", "./index.html");
    document.querySelector("body").insertAdjacentElement("afterbegin", loggedHeader);

    // Modify buttons for logged-in users
    const modifyButtons = document.querySelectorAll(".modify-marker");
    for (const modifyButton of modifyButtons) {
      modifyButton.innerHTML = `
<i class='fa-solid fa-pen-to-square'></i>
<p>modifier</p>
`
      modifyButton.querySelector("p").style.color = "#000000";
    };

    // Undisplay modal background
    document.querySelector("#modal-gallery").style.display = "none";



    // Display modal
    const activateModal = document.querySelector("#start-modal");
    activateModal.addEventListener("click", function displayModal() {
      document.querySelector("#modal-gallery").style.display = "flex";
      document.querySelector("#modal-wrapper").style.display = "flex";
      const modalGallery = document.querySelector("#modal-wrapper");
      modalGallery.innerHTML = `
<i class='fa-solid fa-xmark'></i>
<h2 id='modal-title'>Galerie photo</h2>
<div id='modal-elements'></div>
<div id='buttons-inside-modal'>
<div class="separation-line"></div>
<button id='add-picture-modal'>Ajouter une photo</button>
<a id='delete-element-modal' href='#'>Supprimer la galerie</a>
`;



      // Function to closeModal
      function closeModal() {
        document.querySelector("#modal-gallery").style.display = "none";
        document.querySelector("#modal-wrapper").style.display = "none";
        document.querySelector("#modal-wrapper").innerHTML = "";
      }
      document.querySelector(".fa-solid.fa-xmark").addEventListener("click", closeModal);
      document.querySelector("#modal-gallery").addEventListener("click", closeModal);



      // Create works & manage elements
      function displayWorksOnModal() {
        console.log("display works on modal", worksList);

        for (work of worksList) {
          const modalElement = document.createElement("div");
          modalElement.innerHTML = `
<img class='element-picture-modal' src="${work.imageUrl}">
<i class="fa-solid fa-arrows-up-down-left-right"></i>
<i data-id="${work.id}" class="fa-solid fa-trash delete-work"></i>
<p>éditer</p>
`;
          document.getElementById("modal-elements").appendChild(modalElement);



          // Delete single work
          modalElement.querySelector(".delete-work").addEventListener("click", async function deleteSingleWork() {
            // Get id from the work to delete
            const workId = modalElement.querySelector(".delete-work").getAttribute("data-id");

            try {
              // Request to API to delete
              const response = await fetch(`http://localhost:5678/api/works/${workId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                })

              if (response.status === 200 || 204) {
                // Find index of work in worksList using the workId
                const index = worksList.findIndex(work => work.id == workId);
                worksList.splice(index, 1);
                console.log("fetch delete response 20X", response);
                console.log("worksList with event deleted", worksList);

                // Empty the modal
                refreshProjects(worksList);
                closeModal();

              } else if (response.status === 401) {
                console.error("Unauthorized", response.statusText);
              } else if (response.status === 500) {
                console.error("Unexpected Behaviour", response.statusText);
              }
            } catch (error) {
              console.error(error);
            }
          })
        }

        // Delete all works
        document.getElementById("delete-element-modal").addEventListener("click", async function deleteAllWorks() {
          for (const work of worksList) {

            try {
              const response = await fetch(`http://localhost:5678/api/works/${work.id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                })

              if (response.status === 200 || 204) {
                // delete all works
                worksList = [];
                console.log("fetch delete response 20X", response);
                console.log("worksList with all deleted", worksList);

                // close modal and refresh projects on main screen
                closeModal();
                refreshProjects(worksList);

              } else if (response.status === 401) {
                console.error("Unauthorized", response.statusText);
              } else if (response.status === 500) {
                console.error("Unexpected Behaviour", response.statusText);
              }

            } catch (error) {
              console.error(error);
            }
          }
        })
      }

      displayWorksOnModal(worksList);



      // Update modal add works
      document.getElementById("add-picture-modal").addEventListener("click", function addPartForModal() {

        let modalWrapper = document.getElementById("modal-wrapper");
        modalWrapper.innerHTML = "";

        modalWrapper.innerHTML = `
<form id="addImageForm" enctype="multipart/form-data">
<div id="modalWrapperAddContainer">
<i class="fa-solid fa-arrow-left"></i>
<i class="fa-solid fa-xmark"></i>
</div>
<h2 id="modal-title">Ajout photo</h2>
<div id="uploadAddImagecontainer">
<i class="fa-sharp fa-regular fa-image" id="iconImageUpload"></i>
<label for="picture" id="buttonImageUpload">+ Ajouter photo</label>
<input id="picture" class="invisible" type="file" name="image" onchange="previewPicture(this)" required>
<img name="imageUrl" style='display:none' src="#" id="image">
<p class="little-text">jpg, png : 4mo max</p>
</div>
<h3>Titre</h3>
<input name="title" id="form-add-title" class="input-field-area" type="text"/>
<h3>Catégorie</h3>
<select class="input-field-area" name="category">
<option disabled selected hidden>Choisissez une option</option>
</select>
<div class="separation-line"></div>
<button id="add-picture-modal" type="submit">Valider</button>
</form>
`;

        // Display all existing categories to the <select> field on the add form
        for (category of categories) {
          let categorySelection = document.createElement("option");
          categorySelection.setAttribute("value", `${category.id}`);
          categorySelection.innerHTML = `${category.name}`;
          document.getElementsByClassName("input-field-area")[1].appendChild(categorySelection);
        }

        // Back/quit button in add form
        document.querySelector(".fa-solid.fa-xmark").addEventListener("click", closeModal);
        document.querySelector(".fa-solid.fa-arrow-left").addEventListener("click", function returnToPhotoGallery() {
          modalWrapper.innerHTML = "";
          displayModal();
        })

        // Seeing image in the front-end
        let image = document.getElementById("image");
        previewPicture = function (e) {
          document.getElementById("image").style.display = "block";
          document.getElementById("buttonImageUpload").style.display = "none";
          document.getElementById("iconImageUpload").style.display = "none";
          document.getElementsByClassName("little-text")[0].style.display = "none";
          const [file] = e.files;
          if (file) {
            image.src = URL.createObjectURL(file);
          }
        }



        // function to add a project
        document.getElementById("addImageForm").addEventListener("submit", async function addSingleWork(event) {
          try {
            event.preventDefault();

            let form = document.getElementById("addImageForm");
            let formData = new FormData(form);

            // Make a POST request to the works API
            const response = await fetch("http://localhost:5678/api/works", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: formData,
            });

            if (response.status === 201) {

              let newObjectToAdd = await response.json();
              newObjectToAdd.categoryId = parseInt(newObjectToAdd.categoryId);

              worksList.push(newObjectToAdd);
              console.log("fetch add response 20X", response);
              console.log("worksList after work added", worksList);

              refreshProjects(worksList);
              displayModal();

            } else if (response.status === 400) {
              console.error("Bad Request", response);
            } else if (response.status === 401) {
              console.error("Unauthorized", response);
            } else if (response.status === 500) {
              console.error("Unexpected Error", response);
            }
          } catch (error) {
            console.error(error);
          }
        })
      })
    })

    // Set the logout event
    document.getElementById("log-button-event").addEventListener("click", () => {
      localStorage.removeItem("token");
    })

  } else {
    // User is not logged, modify the login button accordingly
    document.getElementById("log-button-event").innerText = "login";
    document.getElementById("log-button-event").setAttribute("href", "./login.html");
    document.getElementById("modal-gallery").style.display = "none";
  }
}





// Main function to initialize other functions
async function main() {

  try {
    let categories = await initFilters();
    let worksList = await initProjects();

    // Add onclick event listener to filter buttons
    const buttons = document.getElementsByClassName("projectSelection");
    for (const button of buttons) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const projectId = e.target.getAttribute("data-id");
        filterProjects(projectId, worksList);
      })
    }

    createInterfaceForLoggedUsers(worksList, categories);

  } catch (error) {
    console.error(error);
  }
}





main();