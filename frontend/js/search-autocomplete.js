document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const suggestionsContainer = document.getElementById('searchSuggestions');

    if (!searchBar || !suggestionsContainer) return;

    let debounceTimeout = null;

    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimeout);

        if (query.length === 0) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            return;
        }

        // Debounce para evitar consultas excesivas
        debounceTimeout = setTimeout(async () => {
            const suggestions = await fetchSuggestions(query);
            renderSuggestions(suggestions);
        }, 250);
    });

    function renderSuggestions(results) {
        suggestionsContainer.innerHTML = '';
        if (results.length > 0) {
            suggestionsContainer.style.display = 'block';
            results.forEach(item => {
                const div = document.createElement('div');
                div.className = 'search-suggestion-item';
                div.innerHTML = `
                    <i class="bi bi-search me-2"></i>
                    <span class="suggestion-type">${item.type === 'group' ? 'Grupo:' : 'Tarea:'}</span>
                    <span class="suggestion-text">${item.name}</span>
                `;
                div.addEventListener('mousedown', () => {
                    searchBar.value = item.name;
                    suggestionsContainer.style.display = 'none';

                    // Aquí puedes navegar al grupo/tarea, si tienes esa lógica
                    if (item.type === 'group' && item.id) {
                        window.location.href = `/views/user/home.html?groupId=${item.id}`;
                    } else if (item.type === 'task' && item.id) {
                        if (item.role === 'admin') {
                            window.location.href = `/views/admin/group-admin.html?taskId=${item.id}`;
                        } else {
                            window.location.href = `/views/user/group-member.html?taskId=${item.id}`;
                        }
                    }
                });
                suggestionsContainer.appendChild(div);
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }

    // Oculta sugerencias al perder foco
    searchBar.addEventListener('blur', () => {
        setTimeout(() => { suggestionsContainer.style.display = 'none'; }, 150);
    });
    searchBar.addEventListener('focus', () => {
        if (searchBar.value.length > 0) suggestionsContainer.style.display = 'block';
    });
});

// Obtiene sugerencias de la API de grupos y tareas
async function fetchSuggestions(query) {
    try {
        // Puedes agregar el token si hace falta autenticación
        const token = localStorage.getItem('token') || '';
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Fetch grupos y tareas en paralelo
        const [groupsRes, tasksRes] = await Promise.all([
            fetch(`http://localhost:3000/api/groups/search?query=${encodeURIComponent(query)}`, { headers }),
            fetch(`http://localhost:3000/api/tasks/search?query=${encodeURIComponent(query)}`, { headers })
        ]);

        const groupsData = await groupsRes.json();
        const tasksData = await tasksRes.json();

        // Adapta el formato según tu API
        const groups = Array.isArray(groupsData) ? groupsData : groupsData.groups || [];
        const tasks = Array.isArray(tasksData) ? tasksData : tasksData.tasks || [];

        // Estructura para el render
        const suggestions = [
            ...groups.map(group => ({
                type: 'group',
                name: group.name || group.title,
                id: group.id || group._id,
                role: group.role || 'member'
            })),
            ...tasks.map(task => ({
                type: 'task',
                name: task.name || task.title,
                id: task.id || task._id
            }))
        ];

        // Opcional: prioriza los que empiezan igual
        return suggestions
            .sort((a, b) => {
                const aIndex = a.name.toLowerCase().indexOf(query.toLowerCase());
                const bIndex = b.name.toLowerCase().indexOf(query.toLowerCase());
                return aIndex - bIndex;
            })
            .slice(0, 8); // máximo 8 sugerencias
    } catch (err) {
        return [];
    }
}
