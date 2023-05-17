// Function to create filter buttons based on categories
async function initFilters() {
    try {
        // Get categories from API
        const response = await fetch("http://localhost:5678/api/categories");

        if (response.status === 200) {
            const categories = await response.json();
            const filterForm = document.querySelector("#projectOrganization");

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
        } else {
            console.log("response.status != 200");
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

        if (response.status === 200) {
            let worksList = await response.json();
            const gallery = document.querySelector(".gallery");

            // Create and show projects in the gallery
            for (const work of worksList) {
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
            return worksList;
        } else {
            console.log("response.status != 200");
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

// Function to create interface elements for logged-in users
function createInterfaceForLoggedUsers(worksList) {
    // Check if token is present in localStorage to determine if the user is logged
    if (localStorage.getItem("token")) {
        // Create sub-header for logged-in users
        const loggedHeader = document.createElement("header");
        loggedHeader.innerHTML =
            "<i class='fa-solid fa-pen-to-square'></i><p>Mode édition</p><a class='publish-button'>Pulier les changements</a>";
        loggedHeader.id = "logged-header";
        document.getElementById("log-button-event").innerText = "logout";
        document.getElementById("log-button-event").setAttribute("href", "./index.html");
        document.querySelector("body").insertAdjacentElement("afterbegin", loggedHeader);

        // Modify buttons for logged-in users
        const modifyButtons = document.querySelectorAll(".modify-marker");
        for (const modifyButton of modifyButtons) {
            modifyButton.innerHTML =
                "<i class='fa-solid fa-pen-to-square' style='color:#000000'></i><p>modifier</p>";
        }

        // Attach event listeners to the modified buttons
        const activateModal = document.querySelector("#start-modal");
        document.querySelector("#modal-gallery").style.display = "none"
        activateModal.addEventListener("click", () => {
            document.querySelector("#modal-gallery").style.display = "flex";
            // Create and display a modal for editing
            const modal = document.querySelector("#modal-gallery");
            modal.innerHTML =
                "<div id='modal-wrapper'><i class='fa-solid fa-xmark'></i><h2 id='modal-title'>Galerie photo</h2><div id='modal-elements'></div><div id='buttons-inside-modal'><div style='border: 1px solid grey; width: 100%;'></div><button id='add-picture-modal'>Ajouter une photo</button><a id='delete-element-modal' href='#'>Supprimer la galerie</a></div>";
            // Attach event listener to the close button of the modal
            document.querySelector(".fa-solid.fa-xmark").addEventListener("click", () => {
                document.querySelector("#modal-gallery").style.display = "none";
                document.querySelector("#modal-gallery").innerHTML = "";
            });

            console.log(worksList);
            for (works of worksList) {
                const modalElement = document.createElement("div");
                modalElement.innerHTML = `
                    <img class='element-picture-modal' src="${works.imageUrl}">
                    <i class="fa-solid fa-arrows-up-down-left-right"></i>
                    <i class="fa-solid fa-trash"></i>
                    <p>éditer</p>
                    `;
                document.getElementById("modal-elements").appendChild(modalElement);
            };
        });

    } else {
        // User is not logged, modify the login button accordingly
        document.getElementById("log-button-event").innerText = "login";
        document.getElementById("log-button-event").setAttribute("href", "./login.html");
    }
}

// Main function to initialize other functions
async function main() {
    await initFilters();
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

    createInterfaceForLoggedUsers(worksList);

    // Logout - Remove "token" from localStorage with logout event
    document.getElementById("log-button-event").addEventListener("click", () => {
        localStorage.removeItem("token");
    });
}

main();