class Producto {
  constructor(id, imagen, nombre, descripcion, categoria, precio) {
    this.id = id;
    this.imagen = imagen;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.precio = precio;
  }
}

class Base_de_datos {
  constructor() {
    this.productos = [];
    this.cargarRegistros();
  }

  async cargarRegistros() {
    const resultado = await fetch("/json/productos.json");
    this.productos = await resultado.json();
    cargarProductos(this.productos);
  }

  mostrarProductos() {
    return this.productos;
  }

  mostrarPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }

  mostrarPorNombre(palabra) {
    return this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(palabra.toLowerCase())
    );
  }

  mostrarPorCategoria(categoria) {
    return this.productos.filter(
      (producto) => producto.categoria === categoria
    );
  }
}

class Carrito {
  constructor() {
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));

    this.carrito = carritoStorage || [];
    this.totalPagar = 0;
    this.cantidadProductos = 0;

    this.listar();
  }

  enCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  agregar(producto) {
    const productoEnCarrito = this.enCarrito(producto);

    if (!productoEnCarrito) {
      this.carrito.push({ ...producto, cantidad: 1 });
    } else {
      productoEnCarrito.cantidad++;
    }

    localStorage.setItem("carrito", JSON.stringify(this.carrito));

    this.listar();
  }

  quitar(id) {
    const indice = this.carrito.findIndex((producto) => producto.id === id);

    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      this.carrito.splice(indice, 1);
    }

    localStorage.setItem("carrito", JSON.stringify(this.carrito));

    this.listar();
  }

  vaciar() {
    this.totalPagar = 0;
    this.cantidadProductos = 0;
    this.carrito = [];

    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  listar() {
    this.totalPagar = 0;
    this.cantidadProductos = 0;
    divCarrito.innerHTML = "";

    for (const producto of this.carrito) {
      divCarrito.innerHTML += `
      <div class="productoCarrito">
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio}</p>
      <p>Cantidad: ${producto.cantidad}</p>
      <a href="#" class="btnQuitar" data-id="${producto.id}">Quitar del carrito</a>
      </div>
      `;

      this.totalPagar += producto.precio * producto.cantidad;
      this.cantidadProductos += producto.cantidad;
    }

    if (this.cantidadProductos > 0) {
      botonComprar.style.display = "block";
    } else {
      botonComprar.style.display = "none";
    }

    const botonesQuitar = document.querySelectorAll(".btnQuitar");

    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();

        const idProducto = Number(boton.dataset.id);

        this.quitar(idProducto);
      });
    }

    spanCantidadProductos.innerText = this.cantidadProductos;
    spanTotalPagar.innerText = this.totalPagar;
  }
}

const bd = new Base_de_datos();

const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalPagar = document.querySelector("#totalPagar");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const buscador = document.querySelector("#buscador");
const botonCarrito = document.querySelector("section h1");
const botonComprar = document.querySelector("#botonComprar");
const botonesCategorias = document.querySelectorAll(".btnCategoria");

botonesCategorias.forEach((boton) => {
  boton.addEventListener("click", () => {
    const categoria = boton.dataset.categoria;
    const botonSeleccionado = document.querySelector(".seleccionado");
    botonSeleccionado.classList.remove("seleccionado");
    boton.classList.add("seleccionado");
    if (categoria == "Todos") {
      cargarProductos(bd.mostrarProductos());
    } else {
      cargarProductos(bd.mostrarPorCategoria(categoria));
    }
  });
});

const carrito = new Carrito();

cargarProductos(bd.mostrarProductos());

function cargarProductos(productos) {
  divProductos.innerHTML = "";

  for (const producto of productos) {
    divProductos.innerHTML += `
        <section id="productos" class="d-flex flex-wrap justify-content-center" data-aos="fade-up">
          <div class="card m-4" style="width: 18rem">
            <img src="../assets/img/${producto.imagen}" alt=${producto.nombre} />
            <div class="card-body">
              <h5 class="card-title">${producto.nombre}</h5>
              <p class="card-text">
                ${producto.descripcion}
              </p>
              <p>$${producto.precio}</p>
              <p>Envio a domicilio: $999</p>
              <div class="d-flex">
                <a href="#" class="btn btn-dark m-2 button" data-id ="${producto.id}"
                  >Agregar al carrito</a
                >
              </div>
            </div>
          </div>
        </section>`;
  }

  const botonesAgregar = document.querySelectorAll(".btn");

  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      event.preventDefault();

      const idProducto = Number(boton.dataset.id);

      const producto = bd.mostrarPorId(idProducto);

      carrito.agregar(producto);

      Toastify({
        text: `Se ha añadido ${producto.nombre} al carrito`,
        gravity: "bottom",
        position: "center",
        style: {
          background: "linear-gradient(to right, #000000, #83000D)",
          color: "white",
        },
      }).showToast();
    });
  }
}

buscador.addEventListener("input", (event) => {
  event.preventDefault();

  const palabra = buscador.value;

  const productos = bd.mostrarPorNombre(palabra);

  cargarProductos(productos);
});

botonCarrito.addEventListener("click", (event) => {
  document.querySelector(".seccion").classList.toggle("ocultar");
});

botonComprar.addEventListener("click", (event) => {
  event.preventDefault();

  Swal.fire({
    title: "¿Seguro que desea comprar los productos?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.vaciar();
      Swal.fire({
        title: "¡Compra realizada!",
        icon: "success",
        text: "Su compra fue realizada con éxito !",
        timer: 3000,
      });
    }
  });
});
