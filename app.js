import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJMYhprsh-Tep5tGENKuwKcGOag9Sn_3k",
    authDomain: "carta-carrito.firebaseapp.com",
    projectId: "carta-carrito",
    storageBucket: "carta-carrito.firebasestorage.app",
    messagingSenderId: "756179917172",
    appId: "1:756179917172:web:e53ced47977a31003bf421"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ORDEN_CATEGORIAS = [
    "Vienesas", 
    "As", 
    "Churrascos", 
    "Pernil", 
    "Frituras", 
    "Bebestibles"
];

async function renderizarMenu() {
    const contenedor = document.getElementById("menu-container");

    try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productos = [];
        
        querySnapshot.forEach((doc) => {
            productos.push({ id: doc.id, ...doc.data() });
        });

        const menuAgrupado = {};
        productos.forEach(prod => {
            // Ya no filtramos por disponibilidad, los guardamos todos
            if (!menuAgrupado[prod.categoria]) {
                menuAgrupado[prod.categoria] = [];
            }
            menuAgrupado[prod.categoria].push(prod);
        });

        contenedor.innerHTML = "";

        ORDEN_CATEGORIAS.forEach((categoria, index) => {
            if (menuAgrupado[categoria] && menuAgrupado[categoria].length > 0) {
                
                menuAgrupado[categoria].sort((a, b) => a.precio - b.precio);

                // Usamos <details> para hacer el contenedor desplegable nativo
                // Añadimos 'open' al primer elemento para que cargue abierto por defecto
                // Contenedor desplegable nativo (todos inician cerrados por defecto)
                const details = document.createElement("details");
                details.className = "categoria-desplegable";

                // <summary> actúa como el botón del desplegable
                details.innerHTML = `<summary class="categoria-titulo">${categoria.toUpperCase()}</summary>`;
                
                const listaDiv = document.createElement("div");
                listaDiv.className = "productos-lista";

                menuAgrupado[categoria].forEach(prod => {
                    const div = document.createElement("div");
                    
                    // Si no está disponible, le añadimos la clase 'agotado'
                    const claseAgotado = prod.disponible ? "" : " agotado";
                    div.className = `producto${claseAgotado}`;
                    
                    const descripcionHTML = prod.descripcion 
                        ? `<div class="desc">(${prod.descripcion})</div>` 
                        : '';

                    // Si está disponible mostramos el precio, si no, texto de agotado
                    const textoPrecio = prod.disponible 
                        ? `$${prod.precio.toLocaleString('es-CL')}` 
                        : 'AGOTADO';

                    div.innerHTML = `
                        <div class="info">
                            <div class="nombre">${prod.nombre}</div>
                            ${descripcionHTML}
                        </div>
                        <div class="precio">${textoPrecio}</div>
                    `;
                    listaDiv.appendChild(div);
                });

                details.appendChild(listaDiv);
                contenedor.appendChild(details);
            }
        });

    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        contenedor.innerHTML = "<p style='color:white; text-align:center;'>Ocurrió un error al cargar la carta. Por favor recarga la página.</p>";
    }
}

renderizarMenu();
