document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const taskInput = document.getElementById('taskInput');
            const addTaskBtn = document.getElementById('addTaskBtn');
            const taskList = document.getElementById('taskList');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const searchInput = document.getElementById('searchInput');
            const totalTasks = document.getElementById('totalTasks');
            const completedTasks = document.getElementById('completedTasks');
            const pendingTasks = document.getElementById('pendingTasks');

            // State
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [
                { id: 1, text: 'Complete project proposal', completed: false, priority: 'high', createdAt: new Date().toISOString() },
                { id: 2, text: 'Buy groceries', completed: true, priority: 'medium', createdAt: new Date().toISOString() },
                { id: 3, text: 'Call mom', completed: false, priority: 'low', createdAt: new Date().toISOString() },
                { id: 4, text: 'Read a book', completed: false, priority: 'medium', createdAt: new Date().toISOString() }
            ];
            let currentFilter = 'all';
            let editTaskId = null;

            // Initial render
            renderTasks();
            updateStats();

            // Event Listeners
            addTaskBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });

            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.dataset.filter;
                    renderTasks();
                });
            });

            searchInput.addEventListener('input', function() {
                renderTasks();
            });

            // Functions
            function addTask() {
                const text = taskInput.value.trim();
                if (text === '') return;

                const newTask = {
                    id: Date.now(),
                    text: text,
                    completed: false,
                    priority: getRandomPriority(),
                    createdAt: new Date().toISOString()
                };

                tasks.unshift(newTask);
                saveTasks();
                renderTasks();
                updateStats();
                taskInput.value = '';
                taskInput.focus();
            }

            function getRandomPriority() {
                const priorities = ['low', 'medium', 'high'];
                return priorities[Math.floor(Math.random() * priorities.length)];
            }

            function deleteTask(id) {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                renderTasks();
                updateStats();
            }

            function toggleTask(id) {
                tasks = tasks.map(task => {
                    if (task.id === id) {
                        return { ...task, completed: !task.completed };
                    }
                    return task;
                });
                saveTasks();
                renderTasks();
                updateStats();
            }

            function editTask(id, newText) {
                tasks = tasks.map(task => {
                    if (task.id === id) {
                        return { ...task, text: newText };
                    }
                    return task;
                });
                saveTasks();
                renderTasks();
                updateStats();
            }

            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }

            function renderTasks() {
                const searchTerm = searchInput.value.toLowerCase();
                
                const filteredTasks = tasks.filter(task => {
                    const matchesFilter = currentFilter === 'all' || 
                        (currentFilter === 'active' && !task.completed) || 
                        (currentFilter === 'completed' && task.completed);
                    
                    const matchesSearch = task.text.toLowerCase().includes(searchTerm);
                    
                    return matchesFilter && matchesSearch;
                });

                if (filteredTasks.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>No tasks found</h3>
                            <p>${searchTerm ? 'No tasks match your search' : 'Add a task to get started'}</p>
                        </div>
                    `;
                    return;
                }

                taskList.innerHTML = filteredTasks.map(task => `
                    <div class="task ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        <div class="task-content">
                            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
                            <span class="task-text">${task.text}</span>
                            <span class="task-priority priority-${task.priority}">${task.priority}</span>
                        </div>
                        <div class="task-actions">
                            <button class="action-btn edit-btn" onclick="startEdit(${task.id}, '${task.text.replace(/'/g, "\\'")}')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.206-.228A5.001 5.001 0 0 1 8 10c2.293 0 4.129-1.377 4.871-3.207l.206.228.548-.457a7.001 7.001 0 0 0-6.124 0l.548.457z"/>
                                </svg>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1 1v1h4V2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            function updateStats() {
                const completed = tasks.filter(task => task.completed).length;
                const total = tasks.length;
                const pending = total - completed;

                totalTasks.textContent = total;
                completedTasks.textContent = completed;
                pendingTasks.textContent = pending;
            }

            // Functions available globally
            window.toggleTask = toggleTask;
            window.deleteTask = deleteTask;
            window.startEdit = function(id, text) {
                editTaskId = id;
                const taskElement = document.querySelector(`[data-id="${id}"]`);
                const taskText = taskElement.querySelector('.task-text');
                const originalText = taskText.textContent;
                
                taskText.innerHTML = `
                    <input type="text" value="${text}" style="width: 100%; padding: 2px; border: 1px solid #ddd; border-radius: 4px;" onkeypress="handleEditKeyPress(event, ${id})">
                `;
                
                const input = taskText.querySelector('input');
                input.focus();
                input.select();
            };

            window.handleEditKeyPress = function(event, id) {
                if (event.key === 'Enter') {
                    const input = event.target;
                    const newText = input.value.trim();
                    if (newText) {
                        editTask(id, newText);
                    } else {
                        renderTasks(); // Revert if empty
                    }
                } else if (event.key === 'Escape') {
                    renderTasks(); // Revert on escape
                }
            };

            // Initial focus
            taskInput.focus();
        });
