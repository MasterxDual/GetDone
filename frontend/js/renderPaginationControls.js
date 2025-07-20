// Controles para la paginacion
function renderPaginationControls(currentPage, totalPages, loadPages) {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Botón "Anterior" con icono
    const prevButton = document.createElement('button');
    prevButton.className = "btn btn-outline-primary mx-1";
    prevButton.innerHTML = `<i class="bi bi-chevron-left"></i>`;
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => loadPages(currentPage - 1);
    paginationContainer.appendChild(prevButton);

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        // Página actual: color celeste (btn-info), no clickeable
        if (i === currentPage) {
            pageButton.className = `btn btn-primary mx-1`;
            pageButton.textContent = i;
            pageButton.disabled = false;
        } else {
            pageButton.className = `btn btn-primary mx-1`;
            pageButton.textContent = i;
            pageButton.disabled = true;
            pageButton.onclick = () => loadPages(i);
        }
        paginationContainer.appendChild(pageButton);
    }

    // Botón "Siguiente" con icono
    const nextButton = document.createElement('button');
    nextButton.className = "btn btn-outline-primary mx-1";
    nextButton.innerHTML = `<i class="bi bi-chevron-right"></i>`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => loadPages(currentPage + 1);
    paginationContainer.appendChild(nextButton);
}