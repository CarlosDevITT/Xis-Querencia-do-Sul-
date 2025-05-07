
// Verificar a hora e manipular o card horário
function checkRestaurantOpen(){
    const data = new Date();
    const hora = data.getHours();
    return hora >= 18 && hora < 00;
    // true = restaurante está aberto
}

// Atualizar o status do restaurante
function updateRestaurantStatus() {
    const spanItem = document.getElementById("date-span");
    const isOpen = checkRestaurantOpen();
    
    if(isOpen){
        spanItem.classList.remove("bg-red-500");
        spanItem.classList.add("bg-green-600");
    } else {
        spanItem.classList.remove("bg-green-600");
        spanItem.classList.add("bg-red-500");
    }
}

