// Variáveis existentes
let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

// Função para verificar se o restaurante está aberto
function restauranteAberto() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 18 && hora < 22; // Aberto das 18h às 22h
}

// Função para formatar valor monetário
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para gerar mensagem do pedido para WhatsApp
function gerarMensagemWhatsApp(pedido) {
    let mensagem = `*Pedido Xis querencia do sul* 🍔\n\n`;
    mensagem += `*Itens do pedido:*\n`;
    
    pedido.itens.forEach(item => {
        mensagem += `- ${item.titulo} (${item.quantidade}x) - ${formatarMoeda(item.subtotal)}\n`;
    });
    
    mensagem += `\n*Total:* ${formatarMoeda(pedido.total)}\n`;
    mensagem += `\n*Observação :*\n[ALGUMA OBSERVAÇÃO ?]`;
    mensagem += `\n*Endereço de entrega:*\n[INSIRA O ENDEREÇO AQUI]`;
    mensagem += `\n*Forma de Pagamento:*\n[ INSIRA A FORMA DE PAGAMENTO]`;
    
    return encodeURIComponent(mensagem);
}

// Função para mostrar notificação de restaurante fechado
function mostrarRestauranteFechado() {
    Toastify({
        text: "Restaurante fechado - Horário de funcionamento: 18:00 às 22:00",
        duration: 5000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #dc2626, #ef4444)",
            borderRadius: "2rem",
            fontSize: ".85rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
        }
    }).showToast();
}

// Função para mostrar modal de processamento
function mostrarModalProcessamento(pedido) {
    Swal.fire({
        title: 'Processando seu pedido...',
        html: `
            <div class="flex flex-col items-center">
                <img src="logo-devburguer.ico" alt="" class="w-20 h-20 mb-4 animate-pulse">
                <div class="swal2-loader"></div>
                <p class="mt-3 text-gray-600">Aguarde enquanto preparamos seu Pedido</p>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        backdrop: `
           
            url("logo-devburguer.ico")
            center left
            no-repeat
        `,
        didOpen: () => {
            setTimeout(() => {
                Swal.fire({
                    title: 'Confirme seu pedido',
                    html: `
                        <div class="text-left">
                            <div class="flex items-center justify-center mb-4">
                                <img src="logo-devburguer.ico" alt="Dev Burguer Logo" class="w-16 h-16 mr-3">
                                <h3 class="text-xl font-bold">Resumo do Pedido</h3>
                            </div>
                            <div class="max-h-60 overflow-y-auto mb-4">
                                ${pedido.itens.map(item => `
                                    <div class="flex justify-between py-2 border-b">
                                        <span>${item.quantidade}x ${item.titulo}</span>
                                        <span class="font-medium">${formatarMoeda(item.subtotal)}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between font-bold text-lg mt-4 pt-2 border-t">
                                <span>Total:</span>
                                <span>${formatarMoeda(pedido.total)}</span>
                            </div>
                            <p class="mt-6 text-center">Deseja finalizar a compra?</p>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Sim, finalizar!',
                    cancelButtonText: 'Cancelar',
                    
                    confirmButtonColor: '#16a34a',
                    cancelButtonColor: '#dc2626'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const mensagem = gerarMensagemWhatsApp(pedido);
                        window.open(`https://wa.me/5547992070167?text=${mensagem}`, '_blank');
                        
                        productosEnCarrito = [];
                        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
                        cargarProductosCarrito();
                        
                        Swal.fire({
                            title: 'Pedido enviado!',
                            html: `
                                <div class="flex flex-col items-center">
                                    <img src="logo-devburguer.ico" alt="Dev Burguer Logo" class="w-24 h-24 mb-4">
                                    <p>Seu pedido foi encaminhado para nosso WhatsApp.</p>
                                    <p class="mt-2 text-sm text-gray-500">Aguarde nosso contato para confirmação</p>
                                </div>
                            `,
                            icon: 'success'
                        });
                    } else {
                        Swal.fire(
                            'Pedido cancelado',
                            'Seu hambúrguer ficou esperando...',
                            'info'
                        );
                    }
                });
            }, 2000);
        }
    });
}

// Função existente modificada para comprarCarrito
function comprarCarrito() {
    if (!restauranteAberto()) {
        mostrarRestauranteFechado();
        return;
    }

    if (productosEnCarrito.length === 0) {
        Toastify({
            text: "Seu carrinho está vazio!",
            duration: 3000,
            // ... configurações do Toastify
        }).showToast();
        return;
    }

    // Criar objeto do pedido
    const pedido = {
        itens: productosEnCarrito.map(producto => ({
            titulo: producto.titulo,
            quantidade: producto.cantidad,
            subtotal: producto.precio * producto.cantidad
        })),
        total: productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0),
        data: new Date().toLocaleString()
    };

    mostrarModalProcessamento(pedido);
}

// Funções existentes (mantidas conforme seu código original)
function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    
        contenedorCarritoProductos.innerHTML = "";
    
        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Quantidade</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Preço</small>
                    <p>${formatarMoeda(producto.precio)}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>${formatarMoeda(producto.precio * producto.cantidad)}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
            contenedorCarritoProductos.append(div);
        });
    
        actualizarBotonesEliminar();
        actualizarTotal();
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    Toastify({
        text: "Produto removido",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #4b33a8, #785ce9)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
        }
    }).showToast();

    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    productosEnCarrito.splice(index, 1);
    
    cargarProductosCarrito();
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    total.innerText = formatarMoeda(totalCalculado);
}

function vaciarCarrito() {
    Swal.fire({
        title: 'Você tem certeza?',
        icon: 'question',
        html: `Serão removidos ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} itens do seu carrinho.`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito = [];
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
    });
}

// Event Listeners
botonVaciar.addEventListener("click", vaciarCarrito);
botonComprar.addEventListener("click", comprarCarrito);

// Inicialização
cargarProductosCarrito();