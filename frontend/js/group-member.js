requireAuth();

/**
 * @function loadGroupInfo
 * @description Carga y muestra la información básica de un grupo desde la API
 * @async
 * 
 * Flujo de la función:
 * 1. Obtiene el ID del grupo y token JWT del localStorage
 * 2. Valida la presencia de estos datos esenciales
 * 3. Realiza petición GET a la API de grupos
 * 4. Actualiza la interfaz con los datos recibidos
 * 5. Maneja errores adecuadamente
 * 
 * Elementos del DOM que modifica:
 * - #groupName: Muestra el nombre del grupo
 * - #nameGroup: Actualiza la ruta de navegación (breadcrumb)
 * - #groupDescription: Muestra la descripción del grupo
 * 
 * Almacenamiento local:
 * - selectedGroupRole: Guarda el rol del usuario en el grupo (admin/member)
 */
async function loadGroupInfo() {
    // 1. Obtener credenciales y referencia del grupo
    const groupId = localStorage.getItem('selectedGroupId');
    const token = localStorage.getItem('token');
    
    // 2. Validación de datos esenciales
    if (!groupId || !token) {
        alert('No se encontró información del grupo o usuario.');
        window.location.href = '/views/user/home.html';
        return;
    }

    try {
        // 3. Petición a la API
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Verificar estado de la respuesta
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const group = await res.json();

        // 4. Actualizar almacenamiento local y UI
        localStorage.setItem('selectedGroupRole', group.role);

        // Actualizar elementos de la interfaz
        const nameGroup = document.getElementById('nameGroup');
        document.getElementById('groupName').textContent = group.name;
        document.getElementById('groupDescription').textContent = group.description;

        // Construir breadcrumb de navegación
        nameGroup.innerHTML = '';
        const breadcrumbItem = document.createElement('li');
        breadcrumbItem.className = 'breadcrumb-item active';
        breadcrumbItem.textContent = group.name;
        nameGroup.appendChild(breadcrumbItem);

    } catch (error) {
        // 5. Manejo de errores
        console.error('Error al cargar información del grupo:', error);

        // Mostrar feedback al usuario
        const errorMessage = error.message.includes('HTTP')
            ? 'Error al conectar con el servidor'
            : 'Error al procesar los datos del grupo';

        alert(errorMessage);

        // Redirigir en caso de error grave
        if (error instanceof TypeError) {
            window.location.href = '/views/user/home.html';
        }
    }
}

/**
 * Evento de inicialización
 * Espera a que el DOM esté completamente cargado antes de ejecutar loadGroupInfo
 */
document.addEventListener('DOMContentLoaded', () => {
    // Versión mejorada con manejo de errores inicial
    try {
        loadGroupInfo();
    } catch (initError) {
        console.error('Error en inicialización:', initError);
        alert('Error al cargar la página');
        window.location.href = '/views/user/home.html';
    }
});