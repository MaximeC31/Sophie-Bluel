const buttonClass = document.getElementsByClassName("projectSelection");

for (let i = 0; i < buttonClass.length; i++) {
    buttonClass[i].addEventListener("click", (e) => {
        e.preventDefault();
        const galleryElement = document.getElementsByClassName("gallery")[0];
        while (galleryElement.firstChild) {
            galleryElement.removeChild(galleryElement.firstChild);
        }

        fetch("http://localhost:5678/api/works", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => console.log(data));
    });
}
