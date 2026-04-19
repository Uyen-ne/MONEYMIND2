function toggleFilter() {
    document.getElementById('filterPanel').classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-btn') && !e.target.closest('#filterPanel')) {
        document.getElementById('filterPanel')?.classList.add('hidden');
    }
});