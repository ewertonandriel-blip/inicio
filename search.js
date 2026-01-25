// Sistema de Busca para o Portal de Estudos - Versão Mobile Otimizada

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');
    const materiaLinks = document.querySelectorAll('.materia-link');
    const modulos = document.querySelectorAll('.modulo');
    
    // Detectar se é dispositivo móvel
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Função para normalizar texto (remover acentos e converter para minúsculas)
    function normalizeText(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    
    // Função para realizar a busca
    function performSearch(searchTerm) {
        const normalizedSearch = normalizeText(searchTerm);
        let totalResults = 0;
        let moduleResults = {};
        
        // Resetar todas as matérias e módulos
        materiaLinks.forEach(link => {
            link.classList.remove('hidden', 'highlight');
        });
        
        modulos.forEach(modulo => {
            modulo.classList.remove('hidden');
        });
        
        // Se a busca estiver vazia, mostrar tudo
        if (!normalizedSearch.trim()) {
            searchResults.style.display = 'none';
            clearSearchBtn.style.display = 'none';
            
            // Em mobile, fecha o teclado se estiver aberto
            if (isMobile && document.activeElement === searchInput) {
                searchInput.blur();
            }
            
            return;
        }
        
        // Realizar a busca
        materiaLinks.forEach(link => {
            const title = link.getAttribute('data-title') || '';
            const searchData = link.getAttribute('data-search') || '';
            const materiaName = link.querySelector('.materia-name').textContent;
            const materiaDesc = link.querySelector('.materia-desc').textContent;
            
            const searchableText = normalizeText(
                title + ' ' + searchData + ' ' + materiaName + ' ' + materiaDesc
            );
            
            const moduleName = link.closest('.modulo').getAttribute('data-module');
            
            // Verificar se o texto de busca está no conteúdo
            if (searchableText.includes(normalizedSearch)) {
                link.classList.add('highlight');
                totalResults++;
                
                // Contar resultados por módulo
                if (!moduleResults[moduleName]) {
                    moduleResults[moduleName] = 0;
                }
                moduleResults[moduleName]++;
            } else {
                link.classList.add('hidden');
            }
        });
        
        // Esconder módulos sem resultados
        modulos.forEach(modulo => {
            const moduleName = modulo.getAttribute('data-module');
            if (moduleResults[moduleName] === 0 || !moduleResults[moduleName]) {
                modulo.classList.add('hidden');
            }
        });
        
        // Mostrar resultados
        if (totalResults > 0) {
            resultsCount.textContent = `${totalResults} resultado${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`;
            searchResults.style.display = 'block';
            clearSearchBtn.style.display = 'block';
            
            // Em mobile, rolar suavemente para os resultados
            if (isMobile && window.innerWidth < 768) {
                setTimeout(() => {
                    searchResults.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 100);
            }
        } else {
            resultsCount.textContent = 'Nenhum resultado encontrado';
            searchResults.style.display = 'block';
            clearSearchBtn.style.display = 'block';
        }
    }
    
    // Evento de input na busca (com debounce para performance em mobile)
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, isMobile ? 300 : 150); // Debounce mais longo em mobile
    });
    
    // Evento de tecla Enter na busca
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            performSearch(e.target.value);
            
            // Em mobile, fecha o teclado ao pressionar Enter
            if (isMobile) {
                searchInput.blur();
            }
        }
    });
    
    // Evento de clique no botão de limpar
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
    });
    
    // Fechar busca ao clicar fora (apenas mobile)
    if (isMobile) {
        document.addEventListener('click', function(e) {
            if (!searchContainer.contains(e.target) && searchInput.value === '') {
                searchInput.blur();
            }
        });
        
        // Foco melhorado para mobile
        searchInput.addEventListener('focus', function() {
            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
    
    // Focar no campo de busca ao pressionar Ctrl+K (apenas desktop)
    if (!isMobile) {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    
    // Swipe para limpar busca (mobile)
    let touchStartX = 0;
    searchInput.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    });
    
    searchInput.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe da direita para esquerda para limpar
        if (swipeDistance < -50 && searchInput.value) {
            searchInput.value = '';
            performSearch('');
        }
    });
    
    // Inicializar o sistema de busca
    console.log('Sistema de busca inicializado. Dispositivo móvel:', isMobile);
    
    // Sugestões de busca para mobile
    if (isMobile) {
        // Adicionar atributo para não abrir teclado com sugestões em mobile
        searchInput.setAttribute('autocorrect', 'on');
        searchInput.setAttribute('spellcheck', 'true');
        searchInput.setAttribute('autocomplete', 'on');
    }
});