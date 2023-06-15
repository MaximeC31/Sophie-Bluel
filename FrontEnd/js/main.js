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
      };

      return categories;

    } else {
      console.log("response.status != 200", response.status);
      console.log(response);
    }

  } catch (error) {
    console.error(error);
  };
};





// Function to fetch projects
async function initProjects() {
  try {
    // Get works from API
    const response = await fetch("http://localhost:5678/api/works");

    if (response.status === 200) {
      let worksList = await response.json();
      refreshProjects(worksList);
      return worksList;
    }
    else {
      console.log("response.status != 200", response.status);
      console.log(response);
    };

  } catch (error) {
    console.error(error);
  };
};

// function to display projects with initProjects
function refreshProjects(worksList) {
  const galleryContainer = document.querySelector(".gallery");

  galleryContainer.innerHTML = "";
  // Create and show projects in the gallery
  for (const work of worksList) {
    const projectHTML = `<figure><img src="${work.imageUrl}" alt="${work.title}"><figcaption>${work.title}</figcaption></figure>`;
    galleryContainer.insertAdjacentHTML("beforeend", projectHTML);
  };

};





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
    };
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
  };
};





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
      `

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
          modalElement.innerHTML = `
          <img class='element-picture-modal' src="${work.imageUrl}">
          <i class="fa-solid fa-arrows-up-down-left-right"></i>
          <i data-id="${work.id}" class="fa-solid fa-trash delete-work"></i>
          <p>éditer</p>
          `
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
                });
              // Modify/filter the worksList with the id choosen
              worksList = worksList.filter(function (work) {
                return work.id != workId;
              });
              // Empty the modal
              document.getElementById("modal-elements").innerHTML = "";
              displayWorksOnModal(worksList);
              refreshProjects(worksList);

              if (response.status != 200) {
                console.log("response.status != 200", response.status);
                console.log(response);
              };
            } catch (error) {
              console.error(error);
            };
          });
        };

        // Delete all projects
        document.getElementById("delete-element-modal").addEventListener("click", async function deleteAllWorks() {
          let workIds = worksList.map((item) => item.id);
          for (const workId of workIds) {
            try {
              const response = await fetch(`http://localhost:5678/api/works/${workId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });

              if (response.status != 200) {
                console.log("response.status != 200", response.status);
                console.log(response);
              };
            } catch (error) {
              console.error(error);
            };
          }
          document.getElementById("modal-elements").innerHTML = "";
          // worksList = [];
          refreshProjects(worksList);
        });
      };

      displayWorksOnModal(worksList);



      // Update modal add works
      document.getElementById("add-picture-modal").addEventListener("click", function addPartForModal() {

        let modalWrapper = document.getElementById("modal-wrapper");
        modalWrapper.innerHTML = "";

        modalWrapper.innerHTML = `
        <form id="addImageForm" action="" method="post" url="/upload-picture" enctype="multipart/form-data">
        <div id="modalWrapperAddContainer">
        <i class="fa-solid fa-arrow-left"></i>
        <i class="fa-solid fa-xmark"></i>
        </div>
        <h2 id="modal-title">Ajout photo</h2>
        <div id="uploadAddImagecontainer">
        <i class="fa-sharp fa-regular fa-image" id="iconImageUpload"></i>
        <label for="picture" id="buttonImageUpload">+ Ajouter photo</label>
        <input id="picture" class="invisible" type="file" name="picture" onchange="previewPicture(this)" required>
        <img name="imageUrl" style='display:none' src="#" id="image">
        <p class="little-text">jpg, png : 4mo max</p>
        </div>
        <h3>Titre</h3>
        <input name="title" id="form-add-title" class="input-field-area" type="text"/>
        <h3>Catégorie</h3>
        <select class="input-field-area" name="categoryId">
        <option disabled selected hidden>Choisissez une option</option>
        </select>
        <div class="separation-line"></div>
        <button id="add-picture-modal" type="submit">Valider</button>
        </form>
        `

        // display all existing categories to the <select> field on the add form
        for (category of categories) {
          let categorySelection = document.createElement("option");
          categorySelection.setAttribute("name", "categoryId");
          categorySelection.innerHTML = `${category.name}`;
          document.getElementsByClassName("input-field-area")[1].appendChild(categorySelection);
        };

        // back/quit button in add form
        document.querySelector(".fa-solid.fa-xmark").addEventListener("click", closeModal);
        document.querySelector(".fa-solid.fa-arrow-left").addEventListener("click", function returnToPhotoGallery() {
          modalWrapper.innerHTML = "";
          displayModal();
        });

        // seeing image in the front-end
        let image = document.getElementById("image");
        previewPicture = function (e) {
          document.getElementById("image").style.display = "block";
          document.getElementById("buttonImageUpload").style.display = "none";
          document.getElementById("iconImageUpload").style.display = "none";
          document.getElementsByClassName("little-text")[0].style.display = "none";
          const [file] = e.files
          if (file) {
            image.src = URL.createObjectURL(file)
          }
        };

        // function to add a project
        document.getElementById("addImageForm").addEventListener("submit", async function addSingleWork(event) {
          try {
            event.preventDefault();

            console.log(worksList);
            console.log("id", worksList.length + 1);
            console.log("title", document.getElementById("form-add-title").value);
            console.log("imageUrl", document.getElementById("image").src);
            console.log("categoryId", document.getElementsByClassName("input-field-area")[1].value);
            console.log("userId", 1);

            let formData = new FormData();
            formData.append("id", worksList.length + 1);
            formData.append("title", document.getElementById("form-add-title").value);
            formData.append("imageUrl", document.getElementById("image").src);
            formData.append("categoryId", document.getElementsByClassName("input-field-area")[1].value);
            formData.append("userId", 1);

            // Make a POST request to the works API
            const response = await fetch("http://localhost:5678/api/works", {
              method: "POST",
              headers: {
                "accept": "application/json",
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: formData,
            });

            // If the response status is 200, save the token in local storage and redirect the user to the index page
            if (response.status === 200) {
              console.log("It works !")
            }

            // Display errors in response.status
            else if (response.status === 401) {
              alert(response.statusText);
            } else if (response.status === 404) {
              alert(response.statusText);
            } else {
              alert("Reponse status undefined");
            }

          } catch (error) {
            // If function promise contains errors, show error threw an error in console
            console.error("Erreur : ", error);
          }
        });
      });
    });

  } else {
    // User is not logged, modify the login button accordingly
    document.getElementById("log-button-event").innerText = "login";
    document.getElementById("log-button-event").setAttribute("href", "./login.html");
    document.getElementById("modal-gallery").style.display = "none";
  };
};





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
    };

    createInterfaceForLoggedUsers(worksList, categories);

    // Logout - Remove "token" from localStorage with logout event
    document.getElementById("log-button-event").addEventListener("click", () => {
      localStorage.removeItem("token");
    });

  } catch (error) {
    console.error("An error occurred:", error);
  };
};





main();