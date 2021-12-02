// variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//Para añadir los productos al carrito no puedo hacer esto porque estoy seleccionando
//los botones antes de que los productos se carguen. Tendrá que ser más abajo.
//const btns = document.querySelectorAll('.bag-btn');
//console.log(btns);

// cart 
let cart = []

// getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            });
            console.log(products);
            return products;
        } catch (error) {
            console.log (error);
        }
    }
}
// display products 
// esto también se puede hacer con JS wtf 
class UI {
    displayProducts(products){
        let result = '';
        products.forEach(product => {
             result += `
             <!--single product-->
            <article class="product"> 
            <div class="img-container">
                <img src=${product.image} alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    add to bag
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
            </article>
            <!--end of single product-->
             `
        });
        // innerHTML para modificar el contenido HTML de esa etiqueta (.products-center)
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        // también podríamos haber usado la NodeList, pero el spread operator es más cómodo
        const btns = [...document.querySelectorAll(".bag-btn")];
        btns.forEach(button=>{
            // para saber el id del producto
            let id = button.dataset.id;
            // para saber si el producto está en el carro
            let inCart = cart.find(item => item.id === id);
            // si el item ya está en el carro deshabilitamos el boton
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            } 
            else {
                button.addEventListener('click', (event)=>{
                    console.log(event);
                })
            }
        })
    }
}

// local storage
class Storage {
    //static implica que no necesitas crear una instancia para usarlo
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    }
}

// event listener
//DOMContentLoaded event fires cuando el documento HTML inicial ha sido completamente cargado y parseado
//sin esperar a stylesheets, imágenes y subframes 
//DOMContentLoaded escucha cualquier evento que ocurra en la página cargada
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI() //de la clase UI creada
    const products = new Products(); //de la clase Products creada

    //get all products
    //el then recibe una promesa y encadena un método/función
    products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
    });
});