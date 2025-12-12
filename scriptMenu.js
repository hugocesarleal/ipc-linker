document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.addEventListener("mouseover", function() {
            sidebar.classList.remove("active");
        });
        sidebar.addEventListener("mouseout", function() {
            sidebar.classList.add("active");
        });
    }

    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-icon-btn');

    if (searchInput && searchBtn) {
        function handleSearch() {
            if (searchInput.value.trim() !== "") {
                console.log("Pesquisando por: " + searchInput.value);
                searchInput.value = '';
                searchInput.blur();
            }
        }

        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSearch();
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    const userDropdownContent = document.getElementById("userDropdownContent");

    function checkLoginStatus() {
        const isLogged = localStorage.getItem("isUserLogged") === "true";
        const userName = localStorage.getItem("userName") || "Usuário";

        if (isLogged) {
            renderLoggedInMenu(userName);
        } else {
            renderLoginForm();
        }
    }

    function renderLoginForm() {
        if (!userDropdownContent) return;

        userDropdownContent.innerHTML = `
            <div onclick="event.stopPropagation()">
                <label class="login-label">Usuário:</label>
                <div class="login-input-group">
                    <input type="text" id="inputUser" class="login-input">
                </div>
                <div id="msgErrorUser" style="color: #d9534f; font-size: 0.8rem; display: none; margin-top: -10px; margin-bottom: 10px;">
                    Campo obrigatório
                </div>

                <label class="login-label">Senha:</label>
                <div class="login-input-group">
                    <input type="password" id="inputPass" class="login-input">
                    <i class="far fa-eye-slash toggle-password" id="togglePassBtn"></i>
                </div>
                <div id="msgErrorPass" style="color: #d9534f; font-size: 0.8rem; display: none; margin-top: -10px; margin-bottom: 10px;">
                    Campo obrigatório
                </div>

                <div class="login-checkbox-wrapper">
                    <input type="checkbox" id="keepConnected">
                    <label for="keepConnected" style="margin:0;">Manter conectado</label>
                </div>

                <button class="btn-login-submit" id="btnLogin">Log in</button>

                <div class="login-links">
                    <a href="#" class="register-link">Registrar-se</a>
                    <a href="#" class="forgot-pass-link">
                        <i class="fas fa-question-circle"></i> Esqueceu a senha?
                    </a>
                </div>
            </div>
        `;
        attachLoginEvents();
    }

    function renderLoggedInMenu(name) {
        if (!userDropdownContent) return;

        userDropdownContent.innerHTML = `
            <div class="logged-in-menu" onclick="event.stopPropagation()">
                <div class="user-greeting">Olá, <strong>${name}</strong></div>
                
                <a href="#" class="logged-item">
                    <i class="fas fa-cog"></i> Gerenciar Conta
                </a>
                
                <a href="#" class="logged-item" id="btnLogout" style="background-color: #d9534f;">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            </div>
        `;

        document.getElementById("btnLogout").addEventListener("click", function(e) {
            e.preventDefault();
            logoutUser();
        });
    }

    function attachLoginEvents() {
        const btnLogin = document.getElementById("btnLogin");
        const inputUser = document.getElementById("inputUser");
        const inputPass = document.getElementById("inputPass");
        const msgErrorUser = document.getElementById("msgErrorUser");
        const msgErrorPass = document.getElementById("msgErrorPass");

        function validateAndLogin() {
            const userVal = inputUser.value.trim();
            const passVal = inputPass.value.trim();
            let isValid = true;

            msgErrorUser.style.display = 'none';
            msgErrorPass.style.display = 'none';
            inputUser.style.border = "";
            inputPass.style.border = "";

            if (userVal === "") {
                msgErrorUser.style.display = 'block';
                inputUser.style.border = "1px solid #d9534f";
                isValid = false;
            }

            if (passVal === "") {
                msgErrorPass.style.display = 'block';
                inputPass.style.border = "1px solid #d9534f";
                isValid = false;
            }

            if (isValid) {
                loginUser(userVal);
            }
        }

        if (btnLogin) {
            btnLogin.addEventListener("click", function() {
                validateAndLogin();
            });
        }

        if (inputPass) {
            inputPass.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    validateAndLogin();
                }
            });
        }

        const toggleBtn = document.getElementById("togglePassBtn");
        if (toggleBtn && inputPass) {
            toggleBtn.addEventListener("click", function() {
                const type = inputPass.getAttribute("type") === "password" ? "text" : "password";
                inputPass.setAttribute("type", type);
                this.classList.toggle("fa-eye");
                this.classList.toggle("fa-eye-slash");
            });
        }
    }

    function loginUser(name) {
        localStorage.setItem("isUserLogged", "true");
        localStorage.setItem("userName", name);
        checkLoginStatus();
        $('.user-trigger').dropdown('toggle');
        if (typeof toastr !== 'undefined') toastr.success(`Bem-vindo, ${name}!`);
    }

    function logoutUser() {
        localStorage.removeItem("isUserLogged");
        localStorage.removeItem("userName");
        checkLoginStatus();
        if (typeof toastr !== 'undefined') toastr.info("Você saiu da conta.");
    }

    checkLoginStatus();

    const notificationList = document.getElementById("notificationList");
    const notificationBadge = document.querySelector(".notification-badge");
    const clearAllBtn = document.getElementById("clearAllBtn");

    let notificationsData = JSON.parse(localStorage.getItem('userNotifications')) || [];

    function renderNotifications() {
        if (!notificationList || !notificationBadge) return;

        notificationList.innerHTML = '';
        const count = notificationsData.length;
        notificationBadge.innerText = count;

        if (count === 0) {
            notificationBadge.style.display = 'none';
            if (clearAllBtn) clearAllBtn.style.display = 'none';

            notificationList.innerHTML = '<div class="text-center p-3 text-muted small">Nenhuma notificação nova.</div>';
        } else {
            notificationBadge.style.display = 'block';
            if (clearAllBtn) clearAllBtn.style.display = 'block';

            notificationsData.forEach(note => {
                const item = document.createElement("div");
                item.className = "dropdown-item notification-item d-flex justify-content-between align-items-start";
                item.dataset.id = note.id;

                item.innerHTML = `
                    <div style="flex: 1; padding-right: 10px; cursor: pointer;">
                        <strong>${note.title}</strong>
                        <span class="notification-time d-block text-muted" style="font-size: 0.8rem;">${note.text}</span>
                    </div>
                    <button type="button" class="btn btn-link text-danger p-0 delete-notif" title="Apagar" style="text-decoration: none;">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                notificationList.appendChild(item);
            });
        }
    }

    function addNotification(title, text) {
        const newNote = {
            id: Date.now(),
            title: title,
            text: text
        };

        notificationsData.unshift(newNote);
        localStorage.setItem('userNotifications', JSON.stringify(notificationsData));
        renderNotifications();
        $(notificationBadge).fadeOut(100).fadeIn(100);
    }

    if (notificationList) {
        notificationList.addEventListener("click", function(e) {
            const deleteBtn = e.target.closest(".delete-notif");

            if (deleteBtn) {
                e.stopPropagation();
                e.preventDefault();

                const item = deleteBtn.closest(".notification-item");
                const idToDelete = parseInt(item.dataset.id);

                notificationsData = notificationsData.filter(note => note.id !== idToDelete);
                localStorage.setItem('userNotifications', JSON.stringify(notificationsData));

                $(item).slideUp(200, function() {
                    renderNotifications();
                    if (typeof toastr !== 'undefined') toastr.info("Notificação removida.");
                });
            }
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (notificationsData.length > 0) {
                $(notificationList).fadeOut(200, function() {
                    notificationsData = [];
                    localStorage.setItem('userNotifications', JSON.stringify(notificationsData));

                    $(this).show();
                    renderNotifications();

                    if (typeof toastr !== 'undefined') toastr.warning("Todas as notificações foram apagadas.");
                });
            }
        });
    }

    renderNotifications();

    document.addEventListener("keydown", function(e) {
        if ((e.key === "n" || e.key === "N") && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && !e.target.isContentEditable) {
            const options = [
                { title: "Reserva Confirmada", text: "Veículo PT-4521 liberado." },
                { title: "Alerta de Frota", text: "Nível de óleo baixo no Carro 04." },
                { title: "Manutenção", text: "Revisão agendada para 12/12." },
                { title: "Pagamento Recebido", text: "Fatura #1234 quitada." },
                { title: "Falha no Motor", text: "Código de erro P0420 detectado." },
                { title: "Combustível Baixo", text: "Autonomia crítica no veículo 09." },
                { title: "Aluguel Pendente", text: "Reserva XP-778 expirada." },
                { title: "Agendamento Confirmado", text: "Motorista Maria designada." },
                { title: "Inspeção Pendente", text: "Inspeção anual vencida." },
                { title: "Mensagem Interna", text: "Nova mensagem da administração." },
                { title: "Aprovação Necessária", text: "Solicitação de rota aguardando." },
                { title: "Cancelamento de Reserva", text: "Reserva #998 cancelada." },
                { title: "Acesso Negado", text: "Tentativa de login falhou." },
                { title: "Novo Feedback", text: "Avaliação recebida para veículo 07." },
                { title: "Nota de Serviço", text: "Serviço concluído no caminhão 12." },
                { title: "Alerta de Temperatura", text: "Motor acima de 95°C." },
                { title: "Mudança de Status", text: "Veículo 20 agora disponível." }
            ];
            const choice = options[Math.floor(Math.random() * options.length)];
            addNotification(choice.title, choice.text);
        }
    });
});