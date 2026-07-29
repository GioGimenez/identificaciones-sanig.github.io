// Desplazamiento suave del menú
document.querySelectorAll('nav a').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
        e.preventDefault();

        const destino = document.querySelector(this.getAttribute('href'));

        if (destino) {
            destino.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Cambia el color del menú al desplazarse
window.addEventListener('scroll', () => {

    const nav = document.querySelector('nav');

    if(window.scrollY > 50){
        nav.style.background = "#0b4f8a";
    }else{
        nav.style.background = "#ffffff";
    }

});
