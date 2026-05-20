// --------------------------
// ADD CATEGORY
// --------------------------
const categoryForm = document.getElementById("categoryForm");

categoryForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(categoryForm);

    const response = await fetch("/add-category", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    alert(data.message);

    if(data.success){
        window.location.reload();
    }

});


// --------------------------
// ADD PRODUCT
// --------------------------
const productForm = document.getElementById("productForm");

productForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(productForm);

    const response = await fetch("/add-product", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    alert(data.message);

    if(data.success){
        window.location.reload();
    }

});


// --------------------------
// DELETE PRODUCT
// --------------------------
async function deleteProduct(id){

    const confirmDelete = confirm("Delete product?");

    if(!confirmDelete) return;

    const response = await fetch(`/delete-product/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if(data.success){
        window.location.reload();
    }

}