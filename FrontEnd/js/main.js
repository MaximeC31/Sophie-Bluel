// Function to create filters buttons
async function initFilters() {
    try {
        // Get categories from API
        const response = await fetch("http://localhost:5678/api/categories");

        if (response.status === 200) {
            const categories = await response.json();
            const filterForm = document.querySelector("#projectOrganization");

            // Create all filter button
            const buttonAll = document.createElement("button");
            buttonAll.className = "projectSelection";
            buttonAll.type = "submit";
            buttonAll.id = "all";
            buttonAll.textContent = "Tous";
            filterForm.appendChild(buttonAll);

            // Create categories filter button
            for (const category of categories) {
                const buttonFilter = document.createElement("button");
                buttonFilter.className = "projectSelection";
                buttonFilter.type = "submit";
                buttonFilter.id = category.name;
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
};

// Init first project to be shown
async function initProjects() {
    try {
        // Get works from API
        const response = await fetch("http://localhost:5678/api/works");

        if (response.status === 200) {
            worksList = await response.json();

            const gallery = document.querySelector(".gallery");

            // Create and show projects to gallery
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

        } else {
            console.log("response.status != 200");
            console.log(response);
        }

    } catch (error) {
        console.error(error);
    }
};

// Filter projects from category selected
function filterProjects(categoryId) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    const filteredProjects = worksList.filter(function(project) {
        if (categoryId === "all") {
            return true;
        } else {
            return categoryId === project.category.name;
        }
    });

    // Show project filtered into gallery
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

// Main function to initialize others functions
async function main() {
    await initFilters();
    await initProjects();

    // Add onclick EventListener on filters buttons
    const buttons = document.getElementsByClassName("projectSelection");

    for (const button of buttons) {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            const projectId = e.target.id;
            filterProjects(projectId);
        });
    }
}

main();