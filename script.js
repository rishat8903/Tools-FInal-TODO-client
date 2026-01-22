// ========== CONFIGURATION ==========
const API = 'http://localhost:5000';

// ========== GLOBAL STATE ==========
let currentUser = null; // Store logged-in user info
let todos = []; // Store all todos

// ========== INITIALIZATION ==========
// Check if user is already logged in (stored in browser)
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
        loadTodos();
    }

    // Setup event listeners
    setupEventListeners();
});

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Login form submit
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Register form submit
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Enter key in todo input
    document.getElementById('todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
}

// ========== AUTHENTICATION FUNCTIONS ==========

// Switch between login and register forms
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    clearErrors();
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    clearErrors();
}

function clearErrors() {
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault(); // Prevent form from refreshing page

    console.log('🔵 Login attempt started');

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    console.log(' Username:', username);

    try {
        console.log(' Sending request to:', `${API}/auth/login`);

        // Send login request to server
        const response = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        console.log(' Response status:', response.status);
        console.log(' Response ok:', response.ok);

        const data = await response.json();
        console.log(' Response data:', data);

        if (data.success) {
            // Login successful
            console.log(' Login successful!');
            currentUser = { userId: data.userId, username: data.username };
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Save to browser
            console.log(' Current user set:', currentUser);
            console.log(' Calling showApp()...');
            showApp();
            console.log(' Calling loadTodos()...');
            loadTodos();
        } else {
            // Login failed
            console.log(' Login failed:', data.message);
            document.getElementById('loginError').textContent = data.message;
        }
    } catch (error) {
        console.error(' Connection error:', error);
        console.error(' Error details:', error.message, error.stack);
        document.getElementById('loginError').textContent = 'Connection error. Please try again. Check console for details.';
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();

    console.log(' Registration attempt started');

    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    console.log(' Username:', username);

    try {
        console.log(' Sending request to:', `${API}/auth/register`);

        // Send registration request to server
        const response = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        console.log(' Response status:', response.status);
        console.log(' Response ok:', response.ok);

        const data = await response.json();
        console.log(' Response data:', data);

        if (data.success) {
            // Registration successful - auto login
            console.log(' Registration successful!');
            currentUser = { userId: data.userId, username: data.username };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log(' Current user set:', currentUser);
            console.log(' Calling showApp()...');
            showApp();
            console.log('Calling loadTodos()...');
            loadTodos();
        } else {
            // Registration failed
            console.log('❌ Registration failed:', data.message);
            document.getElementById('registerError').textContent = data.message;
        }
    } catch (error) {
        console.error('❌ Connection error:', error);
        console.error('❌ Error details:', error.message, error.stack);
        document.getElementById('registerError').textContent = 'Connection error. Please try again. Check console for details.';
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    todos = [];
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';

    // Clear forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    clearErrors();
}

// Show the main app screen
function showApp() {
    console.log('🔵 showApp() called');
    const loginScreen = document.getElementById('loginScreen');
    const appScreen = document.getElementById('appScreen');

    console.log('🔵 Login screen element:', loginScreen);
    console.log('🔵 App screen element:', appScreen);

    if (!loginScreen || !appScreen) {
        console.error('❌ ERROR: Screen elements not found!');
        return;
    }

    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';

    // Update username display
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay && currentUser) {
        usernameDisplay.textContent = currentUser.username;
    }

    console.log('✅ Login screen display:', loginScreen.style.display);
    console.log('✅ App screen display:', appScreen.style.display);
    console.log('✅ showApp() completed successfully');
}

// ========== TODO FUNCTIONS ==========

// Load todos from server
async function loadTodos() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API}/todos/${currentUser.userId}`);
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

// Render todos in two sections
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const doneList = document.getElementById('doneList');

    // Clear both lists
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    // Separate todos into active and completed
    const activeTodos = todos.filter(todo => !todo.done);
    const completedTodos = todos.filter(todo => todo.done);

    // Render active todos
    if (activeTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No active todos. Add one above!</div>';
    } else {
        activeTodos.forEach(todo => {
            todoList.appendChild(createTodoElement(todo, false));
        });
    }

    // Render completed todos
    if (completedTodos.length === 0) {
        doneList.innerHTML = '<div class="empty-state">No completed todos yet.</div>';
    } else {
        completedTodos.forEach(todo => {
            doneList.appendChild(createTodoElement(todo, true));
        });
    }
}

// Create a todo element
function createTodoElement(todo, isDone) {
    const li = document.createElement('li');
    li.className = 'todo-item';

    // Todo text
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.title;

    // If not done, make it clickable to mark as complete
    if (!isDone) {
        textSpan.style.cursor = 'pointer';
        textSpan.onclick = () => toggleTodo(todo._id);
        textSpan.title = 'Click to mark as done';
    }

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = () => deleteTodo(todo._id);
    deleteBtn.title = 'Delete todo';

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    return li;
}

// Add new todo
async function addTodo() {
    const input = document.getElementById('todoInput');
    const title = input.value.trim();

    if (!title) {
        alert('Please enter a todo!');
        return;
    }

    try {
        const response = await fetch(`${API}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                userId: currentUser.userId
            })
        });

        const newTodo = await response.json();
        todos.push(newTodo);
        input.value = ''; // Clear input
        renderTodos();
    } catch (error) {
        alert('Error adding todo. Please try again.');
    }
}

// Toggle todo between done/not done
async function toggleTodo(id) {
    try {
        const todo = todos.find(t => t._id === id);

        const response = await fetch(`${API}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ done: !todo.done })
        });

        const updatedTodo = await response.json();

        // Update local todos array
        const index = todos.findIndex(t => t._id === id);
        todos[index] = updatedTodo;

        renderTodos();
    } catch (error) {
        alert('Error updating todo. Please try again.');
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        await fetch(`${API}/todos/${id}`, {
            method: 'DELETE'
        });

        // Remove from local array
        todos = todos.filter(t => t._id !== id);
        renderTodos();
    } catch (error) {
        alert('Error deleting todo. Please try again.');
    }
}
