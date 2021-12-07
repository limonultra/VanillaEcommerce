const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "mgnl0n4za466",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "Jjrpb9JftCkROkBwbl1TpEHNPqDNSnuWbubOTfBZf-w"
  });
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
// buttons
let buttonsDOM = []

// getting the products
class Products {
    async getProducts() {
        try {

            let contentful = await client.getEntries({
                content_type: "products"
            });

            let products = contentful.items;
            
            //let result = await fetch("products.json");
            //let data = await result.json();
            //let products = data.items;

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
                    add to cart
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
    //Esta función cambia el texto y deshabilita los botones si ya hay productos con el mismo id en el carro
    //También añade un listener a los botones que actualiza el carro
    getBagButtons(){ 
        // también podríamos haber usado la NodeList, pero el spread operator es más cómodo
        const button = [...document.querySelectorAll(".bag-btn")];
        //el array donde vamos a seleccionar cada botón particularmente
        buttonsDOM = button;
        button.forEach(button => {
            // para saber el id del producto
            let id = button.dataset.id;
            // para saber si el producto está en el carro
            let inCart = cart.find(item => item.id === id);
            // si el item ya está en el carro deshabilitamos el boton
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            } 
            
            button.addEventListener('click', event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products 
                //convertimos cartItem en un objeto que almacena por separado todas las propiedades de product y añade amount con valor 1
                let cartItem = {...Storage.getProduct(id), amount:1};
                // add product to the cart 
                cart = [...cart, cartItem];
                // save the cart in the local storage
                Storage.saveCart(cart);
                // set cart values (el numerito de arriba y el precio total del carro) 
                //this indica que está dentro de esta clase UI
                this.setCartValues(cart);
                // add cart items // display cart items on the DOM 
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
                });
            
        });
    }
    //Esta función actualiza el precio total de los productos del carro y el número de productos en el carro
    //que es mostrado en la navbar, en el icono del carro
    //es llamado desde button.addEventListener porque se actualiza cada vez que alguien añade algo al carro
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
     
    //esta función "crea" los productos que se muestran en el carro, con su título, precio, cantidad, etc.
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = ` <img src=${item.image} alt="product" />
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class= "remove-item" data-id=${item.id}> remove </span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`
        //Añade el div al .cart-content del index.html
        cartContent.appendChild(div);
    }

    //Función que muestra el carro poniendo visible el .cart y transpartente el overlay
    showCart() {
        //hace visible el .cart-overlay
        cartOverlay.classList.add('transparentBcg');
        //translada a X=0 el .cart
        cartDOM.classList.add('showCart');
    }
    //Es la primera función que se llama. 
    //Obtiene el carro del localStorage. 
    //Actualiza el setCartValues y añade al DOM todos los elementos almacenados en el carro.
    //También añade un listener que hace que se muestre el carro si añades un nuevo elemento
    //Y otro listener que cierra el carro al pulsar el botón de cerrar.
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    //Añade al DOM todos los elementos almacenados en el carro
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    
    cartLogic() {
        // botón de clear cart
        // clearCartBtn.addEventListener('click', this.clearCart);
        // no se puede hacer eso porque si quieres acceder a elementos de la clase tendrás que hacerlo como abajo.
        // this.showCart y this.hideCart se pueden usar directamente porque solo acceden a modificar el DOM y nada de dentro de la clase
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        // funcionalidad del carro
        cartContent.addEventListener('click', event=> {
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } 
            else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas
        fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

// local storage
class Storage {

    //static implica que no necesitas crear una instancia para usarlo
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        //para coger el producto del array del localStorage
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
    }
}

// event listener
//DOMContentLoaded event fires cuando el documento HTML inicial ha sido completamente cargado y parseado
//sin esperar a stylesheets, imágenes y subframes 
//DOMContentLoaded escucha cualquier evento que ocurra en la página cargada
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI() //de la clase UI creada
    const products = new Products(); //de la clase Products creada
    //setup APP
    ui.setupAPP();
    //get all products
    //el then recibe una promesa y encadena un método/función
    products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});