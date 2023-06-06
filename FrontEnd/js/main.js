// Function to create filter buttons based on categories
async function initFilters() {
  try {
    // Get categories from API
    const filterForm = document.querySelector("#projectOrganization");
    const response = await fetch("http://localhost:5678/api/categories");

    if (response.status === 200) {
      const categories = await response.json();

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
      console.log("response.status != 200", response.status);
      console.log(response);
    }
  } catch (error) {
    console.error(error);
  }
}

// Function to fetch and display projects
async function initProjects() {
  try {
    // Get works from API
    const response = await fetch("http://localhost:5678/api/works");
    const galleryContainer = document.querySelector(".gallery");

    if (response.status === 200) {
      let worksList = await response.json();

      // Create and show projects in the gallery
      for (const work of worksList) {
        const projectHTML = `<figure><img src="${work.imageUrl}" alt="${work.title}"><figcaption>${work.title}</figcaption></figure>`;
        galleryContainer.insertAdjacentHTML("beforeend", projectHTML);
      }

      return worksList;

    } else {
      console.log("response.status != 200", response.status);
      console.log(response);
    }
  } catch (error) {
    console.error(error);
  }
}

// Filter projects based on the selected category
function filterProjects(projectId, worksList) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  // Filter projects based on the selected category
  const filteredProjects = worksList.filter(function (project) {
    if (projectId === "0") {
      return true;
    } else {
      return projectId == project.category.id;
    }
  });

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
    loggedHeader.innerHTML = "<i class='fa-solid fa-pen-to-square'></i><p>Mode édition</p><a class='publish-button'>Pulier les changements</a>";
    loggedHeader.id = "logged-header";
    document.getElementById("log-button-event").innerText = "logout";
    document.getElementById("log-button-event").setAttribute("href", "./index.html");
    document.querySelector("body").insertAdjacentElement("afterbegin", loggedHeader);

    // Modify buttons for logged-in users
    const modifyButtons = document.querySelectorAll(".modify-marker");
    for (const modifyButton of modifyButtons) {
      modifyButton.innerHTML = "<i class='fa-solid fa-pen-to-square' style='color:#000000'></i><p>modifier</p>";
    }

    // Undisplay modal background
    document.querySelector("#modal-gallery").style.display = "none";

    // Display modal
    const activateModal = document.querySelector("#start-modal");
    activateModal.addEventListener("click", function displayModal() {
      document.querySelector("#modal-gallery").style.display = "flex";
      document.querySelector("#modal-wrapper").style.display = "flex";
      const modalGallery = document.querySelector("#modal-wrapper");
      modalGallery.innerHTML = "<i class='fa-solid fa-xmark'></i><h2 id='modal-title'>Galerie photo</h2><div id='modal-elements'></div><div id='buttons-inside-modal'><div style='border: 1px solid grey; width: 100%;'></div><button id='add-picture-modal'>Ajouter une photo</button><a id='delete-element-modal' href='#'>Supprimer la galerie</a>";

      // Function to closeModal + Attach event listener for close modal purpose
      function closeModal() {
        document.querySelector("#modal-gallery").style.display = "none";
        document.querySelector("#modal-wrapper").style.display = "none";
        document.querySelector("#modal-wrapper").innerHTML = "";
      };
      document.querySelector(".fa-solid.fa-xmark").addEventListener("click", closeModal);
      document.querySelector("#modal-gallery").addEventListener("click", closeModal);

      // Create works & manage elements
      function displayWorksOnModal(worksList) {
        for (work of worksList) {
          const modalElement = document.createElement("div");
          modalElement.innerHTML = `<img class='element-picture-modal' src="${work.imageUrl}"><i class="fa-solid fa-arrows-up-down-left-right"></i><i data-id="${work.id}" class="fa-solid fa-trash delete-work"></i><p>éditer</p>`;
          document.getElementById("modal-elements").appendChild(modalElement);

          modalElement.querySelector(".delete-work").addEventListener("click", async function deleteSingleWork() {
            // Get id from the work to delete
            const workId = modalElement.querySelector(".delete-work").getAttribute("data-id");
            try {
              // Request to API to delete
              const response = await fetch(
                `http://localhost:5678/api/works/${workId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              // Modify/filter the workList with the id choosen
              worksList = worksList.filter(function (work) {
                return work.id != workId;
              });
              // Empty the modal
              document.getElementById("modal-elements").innerHTML = "";
              displayWorksOnModal(worksList);
              if (response.status != 200) {
                console.log("response.status != 200", response.status);
                console.log(response);
              }
            } catch (error) {
              console.error(error);
            }
          });
        }

        // Delete all projects
        document.getElementById("delete-element-modal").addEventListener("click", async function deleteAllWorks() {
          let workIds = worksList.map((item) => item.id);
          for (const workId of workIds) {
            try {
              const response = await fetch(
                `http://localhost:5678/api/works/${workId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              document.getElementById("modal-elements").innerHTML = "";
              if (response.status != 200) {
                console.log("response.status != 200", response.status);
                console.log(response);
              }
            } catch (error) {
              console.error(error);
            }
          }
        });
      }
      displayWorksOnModal(worksList);

      // Update modal add works
      document.getElementById("add-picture-modal").addEventListener("click", function addPartForModal() {
        document.getElementById("modal-wrapper").innerHTML = "";
        document.getElementById("modal-wrapper").innerHTML = "<div style='display: flex; flex-direction: row; justify-content: space-between;'><i class='fa-solid fa-arrow-left'></i><i class='fa-solid fa-xmark'></i></div><h2 id='modal-title'>Ajout photo</h2><div style='padding: 33px 66px; background: #E8F1F7; display: flex; flex-direction: column; gap: 10px; align-items: center;'><i class='fa-sharp fa-regular fa-image' style='font-size: 60px; color: #B9C5CC;'></i><label for='file' style='color: #306685; background: #CBD6DC; padding: 10px 20px; border-radius: 10px; cursor:pointer'>+ Ajouter photo</label><input type='file' id='file' style='display: none;'><p>jpg, png : 4mo max</p></div><h3>Titre</h3><input class='input-field-area' type='text'/><h3>Catégorie</h3><select class='input-field-area' value=''></select><div style='border: 1px solid grey; width: 100%;'></div><button id='add-picture-modal'>Valider</button>";
        document.querySelector(".fa-solid.fa-xmark").addEventListener("click", closeModal);
        document.querySelector(".fa-solid.fa-arrow-left").addEventListener("click", function returnToPhotoGallery() {
          document.getElementById("modal-wrapper").innerHTML = "";
          displayModal();
        });
      });
    });

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
      });
    }

    createInterfaceForLoggedUsers(worksList, categories);

    // Logout - Remove "token" from localStorage with logout event
    document.getElementById("log-button-event").addEventListener("click", () => {
      localStorage.removeItem("token");
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();