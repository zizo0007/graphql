document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    localStorage.getItem('jwt') ? window.location.href = 'profile.html' : ''

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        if (!username || !password) {
            showError("Veuillez remplir tous les champs");
            return;
        }

        try {
            const token = await authenticate(username, password);
            localStorage.setItem('jwt', token);
            window.location.href = 'profile.html';
        } catch (error) {
            showError("Identifiants incorrects ou problème de connexion");
            console.error('Erreur:', error);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        setTimeout(() => errorMessage.textContent = '', 3000);
    }
});

async function authenticate(usernameOrEmail, password) {
    const authString = btoa(`${usernameOrEmail}:${password}`);
    const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
}