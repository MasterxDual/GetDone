async function loadGroupInfo() {
    const groupId = localStorage.getItem('selectedGroupId');
    const token = localStorage.getItem('token');
    if (!groupId || !token) {
        alert('No se encontró información del grupo o usuario.');
        window.location.href = '/views/user/home.html';
        return;
    }
    try {
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const group = await res.json();

        // Guarda el rol del usuario en el grupo
        localStorage.setItem('selectedGroupRole', group.role);

        const nameGroup = document.getElementById('nameGroup');

        document.getElementById('groupName').textContent = group.name;

        nameGroup.innerHTML = '';
        const html = `<li class="breadcrumb-item active">${group.name}</li>`;
        nameGroup.innerHTML += html;

        document.getElementById('groupDescription').textContent = group.description;
    } catch (error) {
        alert('Error al cargar la información del grupo');
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadGroupInfo();
});