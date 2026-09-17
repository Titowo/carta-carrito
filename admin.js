import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJMYhprsh-Tep5tGENKuwKcGOag9Sn_3k",
    authDomain: "carta-carrito.firebaseapp.com",
    projectId: "carta-carrito",
    storageBucket: "carta-carrito.firebasestorage.app",
    messagingSenderId: "756179917172",
    appId: "1:756179917172:web:e53ced47977a31003bf421"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');
const contenedorProductos = document.getElementById('productos-container');

// 1. Escuchar si el usuario inicia o cierra sesión
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        cargarProductosAdmin();
    } else {
        adminSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
});

// 2. Lógica para Iniciar Sesión
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        errorMsg.style.display = 'none';
        loginForm.reset();
    } catch (error) {
        console.error("Error de login:", error);
        errorMsg.style.display = 'block';
    }
});

// 3. Lógica para Cerrar Sesión
btnLogout.addEventListener('click', () => {
    signOut(auth);
});

// 4. Renderizar el menú en el panel de control
async function cargarProductosAdmin() {
    contenedorProductos.innerHTML = "<p style='text-align:center;'>Cargando carta...</p>";
    const querySnapshot = await getDocs(collection(db, "productos"));
    
    const productos = [];
    querySnapshot.forEach((doc) => {
        productos.push({ id: doc.id, ...doc.data() });
    });

    const categorias = {};
    productos.forEach(p => {
        if (!categorias[p.categoria]) categorias[p.categoria] = [];
        categorias[p.categoria].push(p);
    });

    contenedorProductos.innerHTML = "";

    for (const cat in categorias) {
        // Ordenar productos por precio dentro del admin
        categorias[cat].sort((a, b) => a.precio - b.precio);

        const divCat = document.createElement('div');
        divCat.innerHTML = `<h2 class="categoria-header">${cat}</h2>`;
        
        categorias[cat].forEach(prod => {
            const prodDiv = document.createElement('div');
            prodDiv.className = 'producto-admin';
            
            // Botón dinámico según el estado actual
            const btnTexto = prod.disponible ? 'Disponible' : 'Agotado';
            const btnClase = prod.disponible ? 'disponible' : 'agotado';

            prodDiv.innerHTML = `
                <div class="prod-info">
                    <strong>${prod.nombre}</strong>
                </div>
                <div class="prod-actions">
                    <input type="number" id="precio-${prod.id}" value="${prod.precio}">
                    <button class="btn-update" onclick="actualizarPrecio('${prod.id}')">Guardar</button>
                    <button class="btn-toggle ${btnClase}" onclick="toggleDisponibilidad('${prod.id}', ${prod.disponible})">
                        ${btnTexto}
                    </button>
                </div>
            `;
            divCat.appendChild(prodDiv);
        });
        contenedorProductos.appendChild(divCat);
    }
}

// 5. Funciones globales para actualizar la base de datos (se disparan con los botones)
window.actualizarPrecio = async (id) => {
    const nuevoPrecio = parseInt(document.getElementById(`precio-${id}`).value);
    try {
        await updateDoc(doc(db, "productos", id), { precio: nuevoPrecio });
        alert("¡Precio actualizado correctamente!");
    } catch (error) {
        console.error("Error al actualizar precio", error);
        alert("Error al actualizar. Revisa tu conexión y sesión.");
    }
};

window.toggleDisponibilidad = async (id, estadoActual) => {
    try {
        await updateDoc(doc(db, "productos", id), { disponible: !estadoActual });
        cargarProductosAdmin(); // Recargar la lista para reflejar el cambio de color
    } catch (error) {
        console.error("Error al cambiar disponibilidad", error);
        alert("Error al actualizar. Revisa tu conexión y sesión.");
    }
};
