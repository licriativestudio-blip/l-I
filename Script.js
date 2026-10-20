// ==========================================
// L&I Criative Studio — Script.js
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // ==========================================
    // 1. NAVEGAÇÃO SUAVE ENTRE SEÇÕES
    // ==========================================
    const linksNavegacao = document.querySelectorAll('a[href^="#"]');
    
    linksNavegacao.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const alvoId = this.getAttribute('href');
            const alvo = document.querySelector(alvoId);
            
            if (alvo) {
                const alturaHeader = document.querySelector('header').offsetHeight;
                const posicaoAlvo = alvo.offsetTop - alturaHeader;
                
                window.scrollTo({
                    top: posicaoAlvo,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 2. SISTEMA DE ABAS — FILTRO DE SERVIÇOS
    // ==========================================
    const abas = document.querySelectorAll('.aba');
    const servicos = document.querySelectorAll('.servico-card');

    abas.forEach(aba => {
        aba.addEventListener('click', () => {
            // Remove classe ativa de todas as abas
            abas.forEach(a => a.classList.remove('ativa'));
            // Adiciona na aba clicada
            aba.classList.add('ativa');

            const categoriaSelecionada = aba.getAttribute('data-categoria');

            // Mostra/oculta serviços conforme categoria
            servicos.forEach(servico => {
                const categoriasServico = servico.getAttribute('data-categoria').split(',');
                
                if (categoriaSelecionada === 'todos' || categoriasServico.includes(categoriaSelecionada)) {
                    servico.style.display = 'block';
                    // Pequena animação de entrada
                    servico.style.opacity = '0';
                    servico.style.transform = 'translateY(10px)';
                    
                    setTimeout(() => {
                        servico.style.opacity = '1';
                        servico.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    servico.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // 3. ANIMAÇÃO AO ROLAR A PÁGINA
    // ==========================================
    const elementosParaAnimar = document.querySelectorAll('.servico-card, .diferencial-item, .cliente-card');
    
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.style.opacity = '1';
                entrada.target.style.transform = 'translateY(0)';
                observador.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px 0px'
    });

    // Inicializa elementos com opacidade zero
    elementosParaAnimar.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observador.observe(el);
    });

    // ==========================================
    // 4. DESTAQUE DA ABA ATIVA NO SCROLL
    // ==========================================
    const secoes = document.querySelectorAll('section[id]');
    const cabecalhoAltura = document.querySelector('header').offsetHeight;

    function destacarNavegacao() {
        const posicaoScroll = window.scrollY + cabecalhoAltura + 100;

        secoes.forEach(secao => {
            const topoSecao = secao.offsetTop;
            const alturaSecao = secao.offsetHeight;
            const idSecao = secao.getAttribute('id');
            
            if (posicaoScroll >= topoSecao && posicaoScroll < topoSecao + alturaSecao) {
                linksNavegacao.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === `#${idSecao}`) {
                        link.style.color = '#F9A825';
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', destacarNavegacao);

    // ==========================================
    // 5. FORMULÁRIO DO E-BOOK — CONFIRMAÇÃO
    // ==========================================
    const formEbook = document.querySelector('.form-ebook');
    
    if (formEbook) {
        formEbook.addEventListener('submit', function() {
            const botao = this.querySelector('button[type="submit"]');
            const textoOriginal = botao.innerHTML;
            
            botao.innerHTML = '✓ Enviando...';
            botao.disabled = true;
            
            // Restaura após 3 segundos (feedback visual)
            setTimeout(() => {
                botao.innerHTML = '✓ Verifique seu e-mail! 📥';
                
                setTimeout(() => {
                    botao.innerHTML = textoOriginal;
                    botao.disabled = false;
                    this.reset();
                }, 4000);
            }, 1500);
        });
    }

    // ==========================================
    // 6. EFEITO DE TRANSPARÊNCIA NO CABEÇALHO AO SCROLL
    // ==========================================
    const cabecalho = document.querySelector('header');
    
    function atualizarCabecalho() {
        if (window.scrollY > 50) {
            cabecalho.style.background = 'rgba(0, 0, 0, 0.4)';
        } else {
            cabecalho.style.background = 'rgba(0, 0, 0, 0.2)';
        }
    }

    window.addEventListener('scroll', atualizarCabecalho);
});
