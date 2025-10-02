/**
 * Gantt Professional - Advanced Project Management Tool
 * Author: AI Assistant
 * Version: 1.0.0
 */

class GanttProfessional {
    constructor() {
        this.tasks = [];
        this.currentView = 'week';
        this.zoomLevel = 1.0;
        this.selectedTask = null;
        this.editingTask = null;
        this.startDate = new Date();
        this.endDate = new Date();
        this.theme = 'light';
        this.projectInfo = {
            name: 'Projeto Principal',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            created: new Date(),
            modified: new Date()
        };
        this.autoSave = true;
        this.hasUnsavedChanges = false;
        
        // Initialize the application
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSampleData();
        this.updateDateRange();
        this.renderGanttChart();
        this.updateStatistics();
        this.loadTheme();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // View controls
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeView(e.target.dataset.view);
            });
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });

        // Chart controls
        document.getElementById('todayBtn').addEventListener('click', () => {
            this.goToToday();
        });
        document.getElementById('fitToScreen').addEventListener('click', () => {
            this.fitToScreen();
        });
        document.getElementById('resetView').addEventListener('click', () => {
            this.resetView();
        });

        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                document.getElementById('taskColor').value = color;
            });
        });

        // Export functionality
        document.getElementById('exportMenu').addEventListener('click', () => {
            this.showExportModal();
        });
        document.getElementById('closeExportModal').addEventListener('click', () => {
            this.hideExportModal();
        });
        document.getElementById('confirmExport').addEventListener('click', () => {
            this.exportChart();
        });

        // Export format buttons
        document.querySelectorAll('[data-format]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectExportFormat(e.target.dataset.format);
            });
        });

        // Export size presets
        document.querySelectorAll('[data-size]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setExportSize(e.target.dataset.size);
            });
        });

        // Full page layout checkbox
        document.getElementById('fullPageLayout').addEventListener('change', () => {
            this.updateExportSizePresets();
        });

        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        document.getElementById('priorityFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Modal controls
        document.getElementById('closeTaskModal').addEventListener('click', () => {
            this.hideTaskModal();
        });
        document.getElementById('editTask').addEventListener('click', () => {
            this.editSelectedTask();
        });
        document.getElementById('deleteTask').addEventListener('click', () => {
            this.deleteSelectedTask();
        });
        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Save project
        document.getElementById('saveProject').addEventListener('click', () => {
            this.saveProject();
        });

        // Project management
        document.getElementById('newProject').addEventListener('click', () => {
            this.showNewProjectModal();
        });

        document.getElementById('openProject').addEventListener('click', () => {
            this.openProject();
        });

        // Save dropdown
        document.getElementById('saveDropdown').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSaveDropdown();
        });

        document.getElementById('saveAs').addEventListener('click', () => {
            this.saveProjectAs();
        });

        document.getElementById('saveTemplate').addEventListener('click', () => {
            this.saveAsTemplate();
        });

        document.getElementById('autoSaveToggle').addEventListener('click', () => {
            this.toggleAutoSave();
        });

        // New project modal
        document.getElementById('closeNewProjectModal').addEventListener('click', () => {
            this.hideNewProjectModal();
        });

        document.getElementById('cancelNewProject').addEventListener('click', () => {
            this.hideNewProjectModal();
        });

        document.getElementById('confirmNewProject').addEventListener('click', () => {
            this.createNewProject();
        });

        // Project name changes
        document.getElementById('projectName').addEventListener('input', (e) => {
            this.projectInfo.name = e.target.value;
            this.markAsUnsaved();
        });

        // File input for opening projects
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileOpen(e.target.files[0]);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            this.closeSaveDropdown();
        });

        // Close context menu on scroll
        document.addEventListener('scroll', () => {
            const existingMenus = document.querySelectorAll('.context-menu');
            existingMenus.forEach(m => m.remove());
        }, true);
    }

    async loadSampleData() {
        // Load the specific project file automatically
        console.log('Tentando carregar projeto BR-FORÇA...');
        
        // Try multiple approaches to load the project file
        const fileNames = [
            './projeto-gantt-2025-10-02_(11).json',
            'projeto-gantt-2025-10-02_(11).json',
            './projeto-gantt-2025-10-02 (11).json',
            'projeto-gantt-2025-10-02 (11).json'
        ];
        
        for (const fileName of fileNames) {
            try {
                console.log('Tentando carregar:', fileName);
                const response = await fetch(fileName);
                console.log('Response status:', response.status, response.statusText);
                
                if (response.ok) {
                    const projectData = await response.json();
                    console.log('Projeto carregado com sucesso:', projectData.tasks?.length || 0, 'tarefas');
                    this.loadProject(projectData);
                    this.showNotification('Projeto BR-FORÇA carregado com sucesso!', 'success');
                    return;
                }
            } catch (error) {
                console.warn('Erro ao tentar carregar', fileName, ':', error.message);
                continue;
            }
        }

        // If running from file:// protocol, show appropriate message
        if (window.location.protocol === 'file:') {
            console.warn('Executando via file:// - CORS pode bloquear carregamento do arquivo');
            this.showNotification('Execute via servidor HTTP para carregamento automático do projeto', 'info');
        }

        // Fallback: Load project data directly (embedded)
        this.loadProjectDataDirectly();
    }

    loadProjectDataDirectly() {
        // Embedded project data as fallback
        console.log('Carregando dados do projeto diretamente...');
        
        // Load from embedded project data if available
        if (window.PROJETO_BR_FORCA_DATA) {
            console.log('Usando dados incorporados do projeto BR-FORÇA');
            this.loadProject(window.PROJETO_BR_FORCA_DATA);
            this.showNotification('Projeto BR-FORÇA carregado (dados incorporados)!', 'success');
            return;
        }
        
        // Final fallback: empty project
        this.tasks = [];
        this.projectInfo = {
            name: 'Projeto BR-FORÇA',
            description: 'Sistema de monitoramento estrutural offshore',
            created: new Date(),
            modified: new Date()
        };
        
        // Set current view and update interface
        this.currentView = 'month';
        this.zoomLevel = 0.5;
        
        // Update project name in header
        document.getElementById('projectName').value = this.projectInfo.name;
        
        // Update the interface
        this.updateDateRange();
        this.renderGanttChart();
        this.updateStatistics();
        this.updateProjectStatus();
        
        this.showNotification('Projeto vazio carregado. Para dados completos, use: Abrir Projeto → selecione o arquivo JSON.', 'info');
    }

    updateDateRange() {
        // Use the view-specific method instead
        this.updateDateRangeForView(this.currentView);
    }

    renderGanttChart() {
        // IMPORTANTE: Atualizar o range de datas ANTES de renderizar
        this.updateDateRange();
        
        this.renderTimeline();
        this.renderTaskList();
        this.renderChartBars();
        this.renderGrid();
        this.renderTodayLine();
    }

    renderTimeline() {
        const timeline = document.getElementById('ganttTimeline');
        const timelineHeader = document.createElement('div');
        timelineHeader.className = 'timeline-header';

        // Verificar se alguma tarefa está fora do range atual
        if (this.tasks.length > 0) {
            const minTaskDate = new Date(Math.min(...this.tasks.map(task => task.startDate)));
            const maxTaskDate = new Date(Math.max(...this.tasks.map(task => task.endDate)));
            
            // Se alguma tarefa está fora do range, atualizar automaticamente
            if (minTaskDate < this.startDate || maxTaskDate > this.endDate) {
                this.updateDateRange();
            }
        }

        let timeUnits = [];
        let cellWidth = 60 * this.zoomLevel;

        switch (this.currentView) {
            case 'day':
                timeUnits = this.getDaysBetweenDates(this.startDate, this.endDate);
                cellWidth = 80 * this.zoomLevel; // Mais largura para dias
                break;
            case 'week':
                timeUnits = this.getWeeksBetweenDates(this.startDate, this.endDate);
                cellWidth = 120 * this.zoomLevel; // Largura média para semanas
                break;
            case 'month':
                timeUnits = this.getMonthsBetweenDates(this.startDate, this.endDate);
                cellWidth = 150 * this.zoomLevel; // Maior largura para meses
                break;
        }

        timeUnits.forEach(unit => {
            const cell = document.createElement('div');
            cell.className = 'timeline-cell';
            cell.style.minWidth = `${cellWidth}px`;

            if (this.isCurrentPeriod(unit)) {
                cell.classList.add('today');
            }

            const primary = document.createElement('div');
            primary.className = 'timeline-primary';
            
            const secondary = document.createElement('div');
            secondary.className = 'timeline-secondary';

            switch (this.currentView) {
                case 'day':
                    primary.textContent = this.formatDayPrimary(unit);
                    secondary.textContent = this.formatDaySecondary(unit);
                    break;
                case 'week':
                    primary.textContent = this.formatWeekPrimary(unit);
                    secondary.textContent = this.formatWeekSecondary(unit);
                    break;
                case 'month':
                    primary.textContent = this.formatMonthPrimary(unit);
                    secondary.textContent = this.formatMonthSecondary(unit);
                    break;
            }

            cell.appendChild(primary);
            cell.appendChild(secondary);
            timelineHeader.appendChild(cell);
        });

        timeline.innerHTML = '';
        timeline.appendChild(timelineHeader);
    }

    renderTaskList() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.dataset.taskId = task.id;

            if (this.selectedTask && this.selectedTask.id === task.id) {
                taskItem.classList.add('selected');
            }

            const taskInfo = document.createElement('div');
            taskInfo.className = 'task-info';

            const taskName = document.createElement('div');
            taskName.className = 'task-name';
            taskName.textContent = task.name;

            const taskMeta = document.createElement('div');
            taskMeta.className = 'task-meta';

            const status = document.createElement('span');
            status.className = `task-status ${task.status}`;
            status.textContent = this.getStatusLabel(task.status);

            const assignee = document.createElement('span');
            assignee.textContent = task.assignee;

            const priority = document.createElement('div');
            priority.className = `task-priority ${task.priority}`;

            taskMeta.appendChild(status);
            taskMeta.appendChild(assignee);

            taskInfo.appendChild(taskName);
            taskInfo.appendChild(taskMeta);

            taskItem.appendChild(taskInfo);
            taskItem.appendChild(priority);

            // Add click event
            taskItem.addEventListener('click', () => {
                this.selectTask(task);
            });

            taskItem.addEventListener('dblclick', () => {
                this.showTaskModal(task);
            });

            // Add context menu (right-click)
            taskItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.selectTask(task);
                this.showContextMenu(e, task);
            });

            taskList.appendChild(taskItem);
        });
    }

    renderChartBars() {
        const chart = document.getElementById('ganttChart');
        
        // Clear existing bars
        const existingBars = chart.querySelectorAll('.gantt-bar');
        existingBars.forEach(bar => bar.remove());

        const filteredTasks = this.getFilteredTasks();
        const taskHeight = 50;

        filteredTasks.forEach((task, index) => {
            const bar = document.createElement('div');
            bar.className = 'gantt-bar';
            bar.dataset.taskId = task.id;
            
            if (task.milestone) {
                bar.classList.add('milestone');
            }

            // Calculate position and size based on current view
            let left, width, cellWidth;
            
            switch (this.currentView) {
                case 'day':
                    const startDays = this.getDaysBetweenDates(this.startDate, task.startDate).length;
                    const endDays = this.getDaysBetweenDates(this.startDate, task.endDate).length;
                    cellWidth = 80 * this.zoomLevel;
                    left = startDays * cellWidth;
                    width = task.milestone ? 24 : Math.max((endDays - startDays + 1) * cellWidth - 4, cellWidth * 0.1);
                    break;
                    
                case 'week':
                    const startWeekIndex = this.getWeeksFromDate(this.startDate, task.startDate);
                    const endWeekIndex = this.getWeeksFromDate(this.startDate, task.endDate);
                    const weekDuration = Math.max(1, endWeekIndex - startWeekIndex + 1);
                    
                    cellWidth = 120 * this.zoomLevel;
                    left = startWeekIndex * cellWidth;
                    width = task.milestone ? 24 : Math.max(weekDuration * cellWidth - 4, cellWidth * 0.1);
                    break;
                    
                case 'month':
                    const startMonthIndex = this.getMonthsFromDate(this.startDate, task.startDate);
                    const endMonthIndex = this.getMonthsFromDate(this.startDate, task.endDate);
                    const monthDuration = Math.max(1, endMonthIndex - startMonthIndex + 1);
                    
                    cellWidth = 150 * this.zoomLevel;
                    left = startMonthIndex * cellWidth;
                    width = task.milestone ? 24 : Math.max(monthDuration * cellWidth - 4, cellWidth * 0.1);
                    break;
            }
            
            const top = index * taskHeight + 13;

            bar.style.left = `${Math.max(0, left)}px`;
            bar.style.width = `${Math.max(24, width)}px`;
            bar.style.top = `${top}px`;
            bar.style.backgroundColor = task.color;

            // Add progress bar for non-milestones
            if (!task.milestone && task.progress > 0) {
                const progressBar = document.createElement('div');
                progressBar.className = 'bar-progress';
                progressBar.style.width = `${task.progress}%`;
                bar.appendChild(progressBar);
            }

            // Add label
            if (!task.milestone) {
                const label = document.createElement('div');
                label.className = 'bar-label';
                label.textContent = `${task.name} (${task.progress}%)`;
                bar.appendChild(label);
            }

            // Add click event
            bar.addEventListener('click', () => {
                this.selectTask(task);
            });

            bar.addEventListener('dblclick', () => {
                this.showTaskModal(task);
            });

            // Add context menu (right-click)
            bar.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.selectTask(task);
                this.showContextMenu(e, task);
            });

            chart.appendChild(bar);
        });

        // Update chart height
        const chartHeight = Math.max(400, filteredTasks.length * taskHeight + 50);
        chart.style.minHeight = `${chartHeight}px`;
    }

    renderGrid() {
        const chart = document.getElementById('ganttChart');
        
        // Remove existing grid
        const existingGrid = chart.querySelector('.gantt-grid');
        if (existingGrid) {
            existingGrid.remove();
        }

        const grid = document.createElement('div');
        grid.className = 'gantt-grid';

        let timeUnits, cellWidth;

        switch (this.currentView) {
            case 'day':
                timeUnits = this.getDaysBetweenDates(this.startDate, this.endDate);
                cellWidth = 80 * this.zoomLevel;
                break;
            case 'week':
                timeUnits = this.getWeeksBetweenDates(this.startDate, this.endDate);
                cellWidth = 120 * this.zoomLevel;
                break;
            case 'month':
                timeUnits = this.getMonthsBetweenDates(this.startDate, this.endDate);
                cellWidth = 150 * this.zoomLevel;
                break;
        }

        timeUnits.forEach((unit, index) => {
            const line = document.createElement('div');
            line.className = 'grid-line';
            line.style.left = `${(index + 1) * cellWidth}px`;

            if (this.isCurrentPeriod(unit)) {
                line.classList.add('today');
            }

            grid.appendChild(line);
        });

        chart.appendChild(grid);
    }

    renderTodayLine() {
        const chart = document.getElementById('ganttChart');
        
        // Remove existing today line
        const existingLine = chart.querySelector('.today-line');
        if (existingLine) {
            existingLine.remove();
        }

        const today = new Date();
        const todayDays = this.getDaysBetweenDates(this.startDate, today).length;
        const cellWidth = 60 * this.zoomLevel;

        if (todayDays >= 0 && today <= this.endDate) {
            const todayLine = document.createElement('div');
            todayLine.className = 'today-line';
            todayLine.style.left = `${todayDays * cellWidth}px`;
            chart.appendChild(todayLine);
        }
    }

    // Task Management
    saveTask() {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);

        const task = {
            id: this.editingTask ? this.editingTask.id : Date.now(),
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDescription').value,
            startDate: new Date(document.getElementById('taskStartDate').value),
            endDate: new Date(document.getElementById('taskEndDate').value),
            priority: document.getElementById('taskPriority').value,
            progress: parseInt(document.getElementById('taskProgress').value),
            assignee: document.getElementById('taskAssignee').value,
            color: document.getElementById('taskColor').value,
            milestone: document.getElementById('taskMilestone').checked,
            status: this.calculateTaskStatus(
                new Date(document.getElementById('taskStartDate').value),
                new Date(document.getElementById('taskEndDate').value),
                parseInt(document.getElementById('taskProgress').value)
            )
        };

        if (this.editingTask) {
            const index = this.tasks.findIndex(t => t.id === this.editingTask.id);
            this.tasks[index] = task;
            this.editingTask = null;
            
            // Reset form button text
            const submitBtn = document.querySelector('#taskForm button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Tarefa';
            
            document.getElementById('cancelEdit').style.display = 'none';
            
            // Show success message
            this.showNotification('Tarefa atualizada com sucesso!', 'success');
        } else {
            this.tasks.push(task);
            
            // Show success message
            this.showNotification('Tarefa adicionada com sucesso!', 'success');
        }

        this.markAsUnsaved();
        this.updateDateRange();
        this.renderGanttChart();
        this.updateStatistics();
        form.reset();
        
        // Set default start date to today
        document.getElementById('taskStartDate').value = this.formatDateInput(new Date());
        document.getElementById('taskEndDate').value = this.formatDateInput(new Date(Date.now() + 86400000));
    }

    calculateTaskStatus(startDate, endDate, progress) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (progress === 100) return 'completed';
        if (today < startDate) return 'not-started';
        if (today > endDate && progress < 100) return 'delayed';
        return 'in-progress';
    }

    selectTask(task) {
        this.selectedTask = task;
        this.renderTaskList();
        this.renderChartBars();
    }

    editSelectedTask() {
        if (!this.selectedTask) return;
        
        this.editingTask = this.selectedTask;
        
        // Populate form
        document.getElementById('taskName').value = this.selectedTask.name;
        document.getElementById('taskDescription').value = this.selectedTask.description || '';
        document.getElementById('taskStartDate').value = this.formatDateInput(this.selectedTask.startDate);
        document.getElementById('taskEndDate').value = this.formatDateInput(this.selectedTask.endDate);
        document.getElementById('taskPriority').value = this.selectedTask.priority;
        document.getElementById('taskProgress').value = this.selectedTask.progress;
        document.getElementById('taskAssignee').value = this.selectedTask.assignee || '';
        document.getElementById('taskColor').value = this.selectedTask.color;
        document.getElementById('taskMilestone').checked = this.selectedTask.milestone;
        
        // Update form button text
        const submitBtn = document.querySelector('#taskForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Tarefa';
        
        document.getElementById('cancelEdit').style.display = 'inline-flex';
        this.hideTaskModal();
        
        // Scroll to form
        document.querySelector('.sidebar').scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    cancelEdit() {
        this.editingTask = null;
        document.getElementById('taskForm').reset();
        document.getElementById('cancelEdit').style.display = 'none';
        
        // Reset form button text
        const submitBtn = document.querySelector('#taskForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Tarefa';
        
        // Reset to default values
        document.getElementById('taskStartDate').value = this.formatDateInput(new Date());
        document.getElementById('taskEndDate').value = this.formatDateInput(new Date(Date.now() + 86400000));
        document.getElementById('taskColor').value = '#3498db';
        document.getElementById('taskProgress').value = '0';
        document.getElementById('taskPriority').value = 'medium';
    }

    deleteSelectedTask() {
        if (!this.selectedTask) return;
        
        // Create custom confirmation dialog
        this.showConfirmDialog(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a tarefa "${this.selectedTask.name}"?`,
            'Esta ação não pode ser desfeita.',
            () => {
                // Delete confirmed
                this.tasks = this.tasks.filter(task => task.id !== this.selectedTask.id);
                this.selectedTask = null;
                this.updateDateRange();
                this.renderGanttChart();
                this.updateStatistics();
                this.hideTaskModal();
                
                this.showNotification('Tarefa excluída com sucesso!', 'success');
            }
        );
    }

    // View Controls
    changeView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Adjust zoom level for different views
        this.adjustZoomForView(view);
        
        // Update date range based on view
        this.updateDateRangeForView(view);
        
        this.renderGanttChart();
    }

    adjustZoomForView(view) {
        switch (view) {
            case 'day':
                this.zoomLevel = 2.0; // Maior zoom para dias
                break;
            case 'week':
                this.zoomLevel = 1.0; // Zoom padrão para semanas
                break;
            case 'month':
                this.zoomLevel = 0.5; // Menor zoom para meses
                break;
        }
        this.updateZoomLevel();
    }

    updateDateRangeForView(view) {
        if (this.tasks.length === 0) {
            this.startDate = new Date();
            this.endDate = new Date();
            
            switch (view) {
                case 'day':
                    this.endDate.setDate(this.startDate.getDate() + 30); // 30 dias
                    break;
                case 'week':
                    this.endDate.setDate(this.startDate.getDate() + 84); // 12 semanas
                    break;
                case 'month':
                    this.endDate.setMonth(this.startDate.getMonth() + 12); // 12 meses
                    break;
            }
            return;
        }

        // Find the earliest start date and latest end date from all tasks
        const minDate = new Date(Math.min(...this.tasks.map(task => task.startDate)));
        const maxDate = new Date(Math.max(...this.tasks.map(task => task.endDate)));

        // Calculate with generous padding to ensure all tasks are visible
        switch (view) {
            case 'day':
                this.startDate = new Date(minDate);
                this.startDate.setDate(this.startDate.getDate() - 14); // 2 semanas antes
                this.endDate = new Date(maxDate);
                this.endDate.setDate(this.endDate.getDate() + 21); // 3 semanas depois
                break;
            case 'week':
                this.startDate = new Date(minDate);
                this.startDate.setDate(this.startDate.getDate() - 21); // 3 semanas antes
                this.endDate = new Date(maxDate);
                this.endDate.setDate(this.endDate.getDate() + 42); // 6 semanas depois
                break;
            case 'month':
                this.startDate = new Date(minDate);
                this.startDate.setMonth(this.startDate.getMonth() - 3); // 3 meses antes
                this.endDate = new Date(maxDate);
                this.endDate.setMonth(this.endDate.getMonth() + 6); // 6 meses depois
                break;
        }

        // Update date range display
        const dateRangeElement = document.getElementById('dateRange');
        if (dateRangeElement) {
            dateRangeElement.textContent = `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
        }
    }

    zoomIn() {
        if (this.zoomLevel < 3.0) {
            this.zoomLevel += 0.25;
            this.updateZoomLevel();
            this.renderGanttChart();
        }
    }

    zoomOut() {
        if (this.zoomLevel > 0.5) {
            this.zoomLevel -= 0.25;
            this.updateZoomLevel();
            this.renderGanttChart();
        }
    }

    updateZoomLevel() {
        document.getElementById('zoomLevel').textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    goToToday() {
        const ganttMain = document.getElementById('ganttMain');
        const today = new Date();
        let scrollLeft = 0;
        let cellWidth;

        switch (this.currentView) {
            case 'day':
                const todayDays = this.getDaysBetweenDates(this.startDate, today).length;
                cellWidth = 80 * this.zoomLevel;
                scrollLeft = todayDays * cellWidth - ganttMain.clientWidth / 2;
                break;
            case 'week':
                const weeks = this.getWeeksBetweenDates(this.startDate, this.endDate);
                const currentWeekIndex = weeks.findIndex(week => 
                    today >= week.start && today <= week.end
                );
                cellWidth = 120 * this.zoomLevel;
                scrollLeft = currentWeekIndex * cellWidth - ganttMain.clientWidth / 2;
                break;
            case 'month':
                const months = this.getMonthsBetweenDates(this.startDate, this.endDate);
                const currentMonthIndex = months.findIndex(month => 
                    today.getFullYear() === month.getFullYear() && 
                    today.getMonth() === month.getMonth()
                );
                cellWidth = 150 * this.zoomLevel;
                scrollLeft = currentMonthIndex * cellWidth - ganttMain.clientWidth / 2;
                break;
        }
        
        ganttMain.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
        });
    }

    fitToScreen() {
        const ganttMain = document.getElementById('ganttMain');
        const availableWidth = ganttMain.clientWidth - 50;
        let totalUnits, baseCellWidth;

        switch (this.currentView) {
            case 'day':
                totalUnits = this.getDaysBetweenDates(this.startDate, this.endDate).length;
                baseCellWidth = 80;
                break;
            case 'week':
                totalUnits = this.getWeeksBetweenDates(this.startDate, this.endDate).length;
                baseCellWidth = 120;
                break;
            case 'month':
                totalUnits = this.getMonthsBetweenDates(this.startDate, this.endDate).length;
                baseCellWidth = 150;
                break;
        }

        const optimalCellWidth = availableWidth / totalUnits;
        this.zoomLevel = Math.max(0.5, Math.min(3.0, optimalCellWidth / baseCellWidth));
        this.updateZoomLevel();
        this.renderGanttChart();
    }

    resetView() {
        this.zoomLevel = 1.0;
        this.updateZoomLevel();
        this.updateDateRange();
        this.renderGanttChart();
        
        const ganttMain = document.getElementById('ganttMain');
        ganttMain.scrollTo({ left: 0, top: 0 });
    }

    // Filtering
    applyFilters() {
        this.renderTaskList();
        this.renderChartBars();
        this.updateStatistics();
    }

    getFilteredTasks() {
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;

        return this.tasks.filter(task => {
            if (statusFilter !== 'all' && task.status !== statusFilter) return false;
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
            return true;
        });
    }

    // Statistics
    updateStatistics() {
        const filteredTasks = this.getFilteredTasks();
        const completed = filteredTasks.filter(task => task.status === 'completed').length;
        const totalProgress = filteredTasks.reduce((sum, task) => sum + task.progress, 0);
        const avgProgress = filteredTasks.length > 0 ? Math.round(totalProgress / filteredTasks.length) : 0;
        
        // Calculate days remaining
        const projectEndDate = filteredTasks.length > 0 ? 
            new Date(Math.max(...filteredTasks.map(task => task.endDate))) : new Date();
        const today = new Date();
        const daysRemaining = Math.max(0, Math.ceil((projectEndDate - today) / (1000 * 60 * 60 * 24)));

        document.getElementById('totalTasks').textContent = filteredTasks.length;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('progressPercent').textContent = `${avgProgress}%`;
        document.getElementById('daysRemaining').textContent = daysRemaining > 0 ? daysRemaining : 'Concluído';
    }

    // Theme Management
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = this.theme;
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        localStorage.setItem('gantt-theme', this.theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('gantt-theme');
        if (savedTheme) {
            this.theme = savedTheme;
            document.body.dataset.theme = this.theme;
            
            const icon = document.querySelector('#themeToggle i');
            icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Modal Management
    showTaskModal(task) {
        this.selectedTask = task;
        
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const body = document.getElementById('taskModalBody');
        
        title.textContent = task.name;
        
        // Calculate duration and remaining days
        const duration = this.getDaysBetweenDates(task.startDate, task.endDate).length + 1;
        const today = new Date();
        const endDate = new Date(task.endDate);
        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        body.innerHTML = `
            <div class="task-details">
                <div class="detail-row">
                    <strong>Descrição:</strong>
                    <p>${task.description || 'Nenhuma descrição'}</p>
                </div>
                <div class="detail-row">
                    <strong>Período:</strong>
                    <p>${this.formatDate(task.startDate)} - ${this.formatDate(task.endDate)}</p>
                </div>
                <div class="detail-row">
                    <strong>Duração:</strong>
                    <p>${duration} ${duration === 1 ? 'dia' : 'dias'}</p>
                </div>
                <div class="detail-row">
                    <strong>Progresso:</strong>
                    <p>${task.progress}% concluído</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%; background-color: ${task.color};"></div>
                    </div>
                </div>
                <div class="detail-row">
                    <strong>Status:</strong>
                    <span class="task-status ${task.status}">${this.getStatusLabel(task.status)}</span>
                </div>
                <div class="detail-row">
                    <strong>Prioridade:</strong>
                    <span class="priority-${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                </div>
                <div class="detail-row">
                    <strong>Responsável:</strong>
                    <p>${task.assignee || 'Não atribuído'}</p>
                </div>
                ${remainingDays >= 0 ? `
                <div class="detail-row">
                    <strong>Tempo Restante:</strong>
                    <p>${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}</p>
                </div>` : `
                <div class="detail-row">
                    <strong>Status Temporal:</strong>
                    <p style="color: var(--danger-color);">Prazo expirado há ${Math.abs(remainingDays)} ${Math.abs(remainingDays) === 1 ? 'dia' : 'dias'}</p>
                </div>`}
                ${task.milestone ? '<div class="detail-row"><strong>Tipo:</strong><p><i class="fas fa-flag"></i> Marco do Projeto</p></div>' : ''}
            </div>
        `;
        
        modal.classList.add('active');
    }

    hideTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
    }

    showExportModal() {
        document.getElementById('exportModal').classList.add('active');
    }

    hideExportModal() {
        document.getElementById('exportModal').classList.remove('active');
    }

    // Export Functionality
    selectExportFormat(format) {
        document.querySelectorAll('[data-format]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-format="${format}"]`).classList.add('active');
    }

    setExportSize(size) {
        const [width, height] = size.split('x');
        document.getElementById('exportWidth').value = width;
        document.getElementById('exportHeight').value = height;
    }

    updateExportSizePresets() {
        const fullPageLayout = document.getElementById('fullPageLayout').checked;
        const sizePresets = document.querySelector('.size-presets');
        
        if (fullPageLayout) {
            // Update presets for full page layout
            sizePresets.innerHTML = `
                <button class="btn btn-small" data-size="1920x1080">Full HD</button>
                <button class="btn btn-small" data-size="2560x1440">2K</button>
                <button class="btn btn-small" data-size="3840x2160">4K</button>
                <button class="btn btn-small" data-size="1366x768">Laptop</button>
            `;
            
            // Set default size for full page
            document.getElementById('exportWidth').value = '1920';
            document.getElementById('exportHeight').value = '1080';
        } else {
            // Original presets for chart only
            sizePresets.innerHTML = `
                <button class="btn btn-small" data-size="1920x1080">Full HD</button>
                <button class="btn btn-small" data-size="1366x768">HD</button>
                <button class="btn btn-small" data-size="2560x1440">2K</button>
                <button class="btn btn-small" data-size="3840x2160">4K</button>
            `;
        }
        
        // Re-add event listeners
        sizePresets.querySelectorAll('[data-size]').forEach(btn => {
            btn.addEventListener('click', () => this.setExportSize(btn.dataset.size));
        });
    }

    async exportChart() {
        const format = document.querySelector('[data-format].active').dataset.format;
        const width = parseInt(document.getElementById('exportWidth').value);
        const height = parseInt(document.getElementById('exportHeight').value);
        const includeGrid = document.getElementById('includeGrid').checked;
        const includeToday = document.getElementById('includeToday').checked;
        const includeLabels = document.getElementById('includeLabels').checked;
        const fullPageLayout = document.getElementById('fullPageLayout').checked;

        try {
            if (fullPageLayout) {
                // Export full page layout
                await this.exportFullPageLayout(format, width, height);
            } else {
                // Export only the Gantt chart
                if (format === 'png') {
                    await this.exportToPNG(width, height, includeGrid, includeToday, includeLabels);
                } else if (format === 'svg') {
                    await this.exportToSVG(width, height, includeGrid, includeToday, includeLabels);
                } else if (format === 'pdf') {
                    await this.exportToPDF(width, height, includeGrid, includeToday, includeLabels);
                }
            }
            
            this.hideExportModal();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Erro ao exportar: ' + error.message);
        }
    }

    async exportToPNG(width, height, includeGrid, includeToday, includeLabels) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim();
        ctx.fillRect(0, 0, width, height);

        await this.drawGanttToCanvas(ctx, width, height, includeGrid, includeToday, includeLabels);

        // Download
        const link = document.createElement('a');
        link.download = `gantt-chart-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    async exportFullPageLayout(format, width, height) {
        // Hide modal temporarily
        this.hideExportModal();
        
        // Add export optimization class
        document.body.classList.add('export-optimized');
        
        // Wait for UI updates
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            // Configure html2canvas options for better quality
            const options = {
                width: width,
                height: height,
                useCORS: true,
                allowTaint: false,
                scale: Math.min(2, window.devicePixelRatio), // Better quality
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-primary').trim(),
                scrollX: 0,
                scrollY: 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                ignoreElements: (element) => {
                    // Ignore modals and context menus
                    return element.classList.contains('modal') || 
                           element.classList.contains('context-menu') ||
                           element.classList.contains('confirm-dialog');
                }
            };

            // Show loading notification
            this.showNotification('Capturando layout da página...', 'info');

            // Capture the full page
            const canvas = await html2canvas(document.body, options);

            // Resize canvas to requested dimensions if needed
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = width;
            finalCanvas.height = height;
            const ctx = finalCanvas.getContext('2d');
            
            // Draw captured image scaled to fit
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);

            if (format === 'png') {
                // Download PNG
                const link = document.createElement('a');
                link.download = `gantt-layout-${new Date().toISOString().split('T')[0]}.png`;
                link.href = finalCanvas.toDataURL('image/png', 1.0);
                link.click();
            } else if (format === 'pdf') {
                // Convert to PDF
                const { jsPDF } = window.jspdf;
                const orientation = width > height ? 'landscape' : 'portrait';
                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'px',
                    format: [width, height]
                });

                const imgData = finalCanvas.toDataURL('image/png', 1.0);
                pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                pdf.save(`gantt-layout-${new Date().toISOString().split('T')[0]}.pdf`);
            } else if (format === 'svg') {
                // For SVG, embed the image
                const imgData = finalCanvas.toDataURL('image/png', 1.0);
                const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Gantt Professional - Layout Completo</title>
    <description>Layout completo do sistema Gantt Professional capturado em ${new Date().toLocaleDateString('pt-BR')}</description>
    <image width="${width}" height="${height}" xlink:href="${imgData}"/>
</svg>`;

                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const link = document.createElement('a');
                link.download = `gantt-layout-${new Date().toISOString().split('T')[0]}.svg`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            }

            this.showNotification('Layout exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Full page export failed:', error);
            this.showNotification('Erro ao exportar layout completo: ' + error.message, 'error');
            throw error;
        } finally {
            // Remove export optimization class
            document.body.classList.remove('export-optimized');
        }
    }

    async exportToSVG(width, height, includeGrid, includeToday, includeLabels) {
        const svg = this.createSVGElement(width, height, includeGrid, includeToday, includeLabels);
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = `gantt-chart-${new Date().toISOString().split('T')[0]}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    async exportToPDF(width, height, includeGrid, includeToday, includeLabels) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: width > height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [width, height]
        });

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        await this.drawGanttToCanvas(ctx, width, height, includeGrid, includeToday, includeLabels);

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`gantt-chart-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    async drawGanttToCanvas(ctx, width, height, includeGrid, includeToday, includeLabels) {
        const filteredTasks = this.getFilteredTasks();
        let timeUnits = [];
        let cellWidth = 60;
        
        // Get time units based on current view
        switch (this.currentView) {
            case 'day':
                timeUnits = this.getDaysBetweenDates(this.startDate, this.endDate);
                cellWidth = width / timeUnits.length;
                break;
            case 'week':
                timeUnits = this.getWeeksBetweenDates(this.startDate, this.endDate);
                cellWidth = width / timeUnits.length;
                break;
            case 'month':
                timeUnits = this.getMonthsBetweenDates(this.startDate, this.endDate);
                cellWidth = width / timeUnits.length;
                break;
        }
        
        const taskHeight = Math.max(35, (height - 120) / Math.max(filteredTasks.length, 1));
        const headerHeight = 120; // Increased header height for better text visibility

        // Clear canvas with background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw header background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, headerHeight);

        // Draw header border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, headerHeight);
        ctx.lineTo(width, headerHeight);
        ctx.stroke();

        // Configure text for better readability
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw timeline headers with improved visibility
        timeUnits.forEach((unit, index) => {
            const x = index * cellWidth + cellWidth / 2;
            const isCurrentPeriod = this.isCurrentPeriod(unit);
            
            // Set text color
            if (isCurrentPeriod && includeToday) {
                ctx.fillStyle = '#2563eb'; // Primary color for current period
            } else {
                ctx.fillStyle = '#1e293b'; // Dark text for better contrast
            }
            
            // Draw based on current view
            switch (this.currentView) {
                case 'day':
                    // Primary line: Month/Day
                    ctx.font = 'bold 14px Inter, Arial, sans-serif';
                    const primaryText = this.formatDayPrimary(unit);
                    ctx.fillText(primaryText, x, 30);
                    
                    // Secondary line: Weekday
                    ctx.font = '12px Inter, Arial, sans-serif';
                    ctx.fillStyle = '#64748b';
                    const secondaryText = this.formatDaySecondary(unit);
                    ctx.fillText(secondaryText, x, 55);
                    break;
                    
                case 'week':
                    // Primary line: Week number
                    ctx.font = 'bold 14px Inter, Arial, sans-serif';
                    const weekPrimary = this.formatWeekPrimary(unit);
                    ctx.fillText(weekPrimary, x, 30);
                    
                    // Secondary line: Date range
                    ctx.font = '11px Inter, Arial, sans-serif';
                    ctx.fillStyle = '#64748b';
                    const weekSecondary = this.formatWeekSecondary(unit);
                    ctx.fillText(weekSecondary, x, 55);
                    break;
                    
                case 'month':
                    // Primary line: Month/Year
                    ctx.font = 'bold 16px Inter, Arial, sans-serif';
                    const monthPrimary = this.formatMonthPrimary(unit);
                    ctx.fillText(monthPrimary, x, 30);
                    
                    // Secondary line: Year
                    ctx.font = '12px Inter, Arial, sans-serif';
                    ctx.fillStyle = '#64748b';
                    const monthSecondary = this.formatMonthSecondary(unit);
                    ctx.fillText(monthSecondary, x, 55);
                    break;
            }
        });

        // Draw vertical grid lines
        if (includeGrid) {
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 1;

            for (let i = 0; i <= timeUnits.length; i++) {
                const x = i * cellWidth;
                ctx.beginPath();
                ctx.moveTo(x, headerHeight);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        // Draw today line (if applicable)
        if (includeToday && this.currentView === 'day') {
            const today = new Date();
            const todayIndex = timeUnits.findIndex(date => this.isToday(date));
            if (todayIndex >= 0) {
                const x = todayIndex * cellWidth + cellWidth / 2;
                ctx.strokeStyle = '#2563eb';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, headerHeight);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        // Draw task bars
        filteredTasks.forEach((task, index) => {
            let startIndex, duration;
            
            switch (this.currentView) {
                case 'day':
                    startIndex = this.getDaysFromDate(this.startDate, task.startDate);
                    const endIndex = this.getDaysFromDate(this.startDate, task.endDate);
                    duration = Math.max(1, endIndex - startIndex + 1);
                    break;
                case 'week':
                    startIndex = this.getWeeksFromDate(this.startDate, task.startDate);
                    const endWeekIndex = this.getWeeksFromDate(this.startDate, task.endDate);
                    duration = Math.max(1, endWeekIndex - startIndex + 1);
                    break;
                case 'month':
                    startIndex = this.getMonthsFromDate(this.startDate, task.startDate);
                    const endMonthIndex = this.getMonthsFromDate(this.startDate, task.endDate);
                    duration = Math.max(1, endMonthIndex - startIndex + 1);
                    break;
            }
            
            const x = Math.max(0, startIndex * cellWidth);
            const y = headerHeight + index * taskHeight + 8;
            const barWidth = Math.max(24, duration * cellWidth - 4);
            const barHeight = taskHeight - 16;

            // Draw task bar
            ctx.fillStyle = task.color;
            if (task.milestone) {
                // Draw diamond shape for milestone
                ctx.save();
                ctx.translate(x + 12, y + barHeight / 2);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-10, -10, 20, 20);
                ctx.restore();
            } else {
                // Draw rounded rectangle
                this.drawRoundedRect(ctx, x, y, barWidth, barHeight, 4);
                ctx.fill();
                
                // Draw progress bar
                if (task.progress > 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    this.drawRoundedRect(ctx, x, y, (barWidth * task.progress) / 100, barHeight, 4);
                    ctx.fill();
                }
            }

            // Draw task label
            if (includeLabels && !task.milestone && barWidth > 50) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Inter, Arial, sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                
                // Add text shadow for better readability
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                
                const maxWidth = barWidth - 10;
                const truncatedText = this.truncateText(ctx, task.name, maxWidth);
                ctx.fillText(truncatedText, x + 8, y + barHeight / 2);
                
                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
        });
    }

    // Helper method to draw rounded rectangles
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Helper method to truncate text if too long
    truncateText(ctx, text, maxWidth) {
        let width = ctx.measureText(text).width;
        if (width <= maxWidth) return text;
        
        const ellipsis = '...';
        const ellipsisWidth = ctx.measureText(ellipsis).width;
        
        while (width > maxWidth - ellipsisWidth && text.length > 0) {
            text = text.slice(0, -1);
            width = ctx.measureText(text).width;
        }
        
        return text + ellipsis;
    }

    createSVGElement(width, height, includeGrid, includeToday, includeLabels) {
        const filteredTasks = this.getFilteredTasks();
        const days = this.getDaysBetweenDates(this.startDate, this.endDate);
        const cellWidth = width / days.length;
        const taskHeight = Math.max(30, (height - 100) / filteredTasks.length);
        const headerHeight = 80;

        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Background
        svg += `<rect width="${width}" height="${height}" fill="#ffffff"/>`;
        
        // Header background
        svg += `<rect width="${width}" height="${headerHeight}" fill="#f8fafc"/>`;
        
        // Timeline
        days.forEach((date, index) => {
            const x = index * cellWidth + cellWidth / 2;
            const isToday = this.isToday(date);
            const textColor = isToday && includeToday ? '#2563eb' : '#1e293b';
            
            svg += `<text x="${x}" y="25" text-anchor="middle" font-family="Inter" font-size="12" fill="${textColor}">${this.formatMonth(date)}</text>`;
            svg += `<text x="${x}" y="45" text-anchor="middle" font-family="Inter" font-size="12" fill="${textColor}">${date.getDate()}</text>`;
        });

        // Grid
        if (includeGrid) {
            for (let i = 0; i <= days.length; i++) {
                const x = i * cellWidth;
                svg += `<line x1="${x}" y1="${headerHeight}" x2="${x}" y2="${height}" stroke="#f1f5f9" stroke-width="1"/>`;
            }
        }

        // Today line
        if (includeToday) {
            const today = new Date();
            const todayIndex = days.findIndex(date => this.isToday(date));
            if (todayIndex >= 0) {
                const x = todayIndex * cellWidth + cellWidth / 2;
                svg += `<line x1="${x}" y1="${headerHeight}" x2="${x}" y2="${height}" stroke="#2563eb" stroke-width="2"/>`;
            }
        }

        // Task bars
        filteredTasks.forEach((task, index) => {
            const startDays = this.getDaysBetweenDates(this.startDate, task.startDate).length;
            const duration = this.getDaysBetweenDates(task.startDate, task.endDate).length + 1;
            
            const x = startDays * cellWidth;
            const y = headerHeight + index * taskHeight + 10;
            const barWidth = duration * cellWidth - 4;
            const barHeight = taskHeight - 20;

            if (task.milestone) {
                // Milestone diamond
                const centerX = x + 12;
                const centerY = y + barHeight / 2;
                svg += `<rect x="${centerX - 8}" y="${centerY - 8}" width="16" height="16" fill="${task.color}" transform="rotate(45 ${centerX} ${centerY})"/>`;
            } else {
                // Task bar
                svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${task.color}" rx="4"/>`;
                
                // Progress
                if (task.progress > 0) {
                    const progressWidth = (barWidth * task.progress) / 100;
                    svg += `<rect x="${x}" y="${y}" width="${progressWidth}" height="${barHeight}" fill="rgba(255,255,255,0.3)" rx="4"/>`;
                }

                // Label
                if (includeLabels) {
                    svg += `<text x="${x + 5}" y="${y + barHeight / 2 + 4}" font-family="Inter" font-size="11" fill="white">${task.name}</text>`;
                }
            }
        });

        svg += '</svg>';
        return svg;
    }

    // Project Management
    // Project Management
    showNewProjectModal() {
        const modal = document.getElementById('newProjectModal');
        
        // Set default dates
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        
        document.getElementById('newProjectStartDate').value = this.formatDateInput(today);
        document.getElementById('newProjectEndDate').value = this.formatDateInput(nextMonth);
        document.getElementById('saveCurrentProject').checked = this.hasUnsavedChanges;
        
        modal.classList.add('active');
        document.getElementById('newProjectName').focus();
    }

    hideNewProjectModal() {
        document.getElementById('newProjectModal').classList.remove('active');
        // Reset form
        document.getElementById('newProjectName').value = '';
        document.getElementById('newProjectDescription').value = '';
        document.getElementById('newProjectTemplate').value = 'empty';
    }

    createNewProject() {
        const name = document.getElementById('newProjectName').value.trim();
        const description = document.getElementById('newProjectDescription').value.trim();
        const startDate = new Date(document.getElementById('newProjectStartDate').value);
        const endDate = new Date(document.getElementById('newProjectEndDate').value);
        const template = document.getElementById('newProjectTemplate').value;
        const saveCurrentProject = document.getElementById('saveCurrentProject').checked;

        if (!name) {
            this.showNotification('Por favor, insira um nome para o projeto.', 'warning');
            return;
        }

        if (startDate >= endDate) {
            this.showNotification('A data de término deve ser posterior à data de início.', 'warning');
            return;
        }

        // Save current project if requested
        if (saveCurrentProject && this.hasUnsavedChanges) {
            this.saveProject();
        }

        // Create new project
        this.projectInfo = {
            name: name,
            description: description,
            startDate: startDate,
            endDate: endDate,
            created: new Date(),
            modified: new Date()
        };

        // Load template
        this.loadProjectTemplate(template);
        
        // Update UI
        document.getElementById('projectName').value = name;
        this.hasUnsavedChanges = false;
        this.updateProjectStatus();
        
        this.hideNewProjectModal();
        this.updateDateRange();
        this.renderGanttChart();
        this.updateStatistics();
        
        this.showNotification(`Projeto "${name}" criado com sucesso!`, 'success');
    }

    loadProjectTemplate(template) {
        switch (template) {
            case 'empty':
                this.tasks = [];
                break;
            case 'sample':
                this.loadSampleData();
                break;
            case 'software':
                this.loadSoftwareTemplate();
                break;
            case 'marketing':
                this.loadMarketingTemplate();
                break;
            case 'construction':
                this.loadConstructionTemplate();
                break;
        }
    }

    loadSoftwareTemplate() {
        const today = new Date();
        this.tasks = [
            {
                id: 1,
                name: 'Análise de Requisitos',
                description: 'Levantamento e documentação dos requisitos do sistema',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
                priority: 'high',
                progress: 0,
                assignee: 'Analista de Sistemas',
                color: '#e74c3c',
                status: 'not-started',
                milestone: false
            },
            {
                id: 2,
                name: 'Design da Arquitetura',
                description: 'Definição da arquitetura e padrões do sistema',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
                priority: 'high',
                progress: 0,
                assignee: 'Arquiteto de Software',
                color: '#3498db',
                status: 'not-started',
                milestone: false
            },
            {
                id: 3,
                name: 'Desenvolvimento Backend',
                description: 'Implementação das APIs e lógica de negócio',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
                priority: 'high',
                progress: 0,
                assignee: 'Desenvolvedor Backend',
                color: '#2ecc71',
                status: 'not-started',
                milestone: false
            },
            {
                id: 4,
                name: 'Marco: MVP Pronto',
                description: 'Produto Mínimo Viável concluído',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45),
                priority: 'high',
                progress: 0,
                assignee: 'Equipe',
                color: '#f39c12',
                status: 'not-started',
                milestone: true
            }
        ];
    }

    loadMarketingTemplate() {
        const today = new Date();
        this.tasks = [
            {
                id: 1,
                name: 'Pesquisa de Mercado',
                description: 'Análise do público-alvo e concorrência',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
                priority: 'high',
                progress: 0,
                assignee: 'Analista de Marketing',
                color: '#9b59b6',
                status: 'not-started',
                milestone: false
            },
            {
                id: 2,
                name: 'Criação de Conteúdo',
                description: 'Desenvolvimento de materiais promocionais',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
                priority: 'medium',
                progress: 0,
                assignee: 'Designer',
                color: '#1abc9c',
                status: 'not-started',
                milestone: false
            },
            {
                id: 3,
                name: 'Lançamento da Campanha',
                description: 'Início oficial da campanha de marketing',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 25),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 25),
                priority: 'high',
                progress: 0,
                assignee: 'Gerente de Marketing',
                color: '#e74c3c',
                status: 'not-started',
                milestone: true
            }
        ];
    }

    loadConstructionTemplate() {
        const today = new Date();
        this.tasks = [
            {
                id: 1,
                name: 'Projeto Arquitetônico',
                description: 'Elaboração dos desenhos e plantas',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
                priority: 'high',
                progress: 0,
                assignee: 'Arquiteto',
                color: '#34495e',
                status: 'not-started',
                milestone: false
            },
            {
                id: 2,
                name: 'Fundação',
                description: 'Escavação e construção da fundação',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 35),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 50),
                priority: 'high',
                progress: 0,
                assignee: 'Engenheiro Civil',
                color: '#8b4513',
                status: 'not-started',
                milestone: false
            },
            {
                id: 3,
                name: 'Marco: Estrutura Concluída',
                description: 'Finalização da estrutura principal',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 90),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 90),
                priority: 'high',
                progress: 0,
                assignee: 'Equipe',
                color: '#f39c12',
                status: 'not-started',
                milestone: true
            }
        ];
    }

    openProject() {
        document.getElementById('fileInput').click();
    }

    handleFileOpen(file) {
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            this.showNotification('Por favor, selecione um arquivo JSON válido.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);
                this.loadProject(projectData);
            } catch (error) {
                this.showNotification('Erro ao carregar o projeto: arquivo inválido.', 'error');
                console.error('Error loading project:', error);
            }
        };
        reader.readAsText(file);
    }

    loadProject(projectData) {
        if (!projectData.tasks || !Array.isArray(projectData.tasks)) {
            this.showNotification('Arquivo de projeto inválido.', 'error');
            return;
        }

        // Load project info
        if (projectData.projectInfo) {
            this.projectInfo = {
                ...projectData.projectInfo,
                modified: new Date()
            };
            document.getElementById('projectName').value = this.projectInfo.name;
        }

        // Load tasks
        this.tasks = projectData.tasks.map(task => ({
            ...task,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate)
        }));

        // Load settings
        if (projectData.settings) {
            this.theme = projectData.settings.theme || 'light';
            this.currentView = projectData.settings.currentView || 'week';
            this.zoomLevel = projectData.settings.zoomLevel || 1.0;
            this.autoSave = projectData.settings.autoSave !== false;
        }

        // Apply loaded settings
        document.body.dataset.theme = this.theme;
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';

        // Update view
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${this.currentView}"]`).classList.add('active');

        this.hasUnsavedChanges = false;
        this.updateProjectStatus();
        this.updateZoomLevel();
        this.updateDateRange();
        this.renderGanttChart();
        this.updateStatistics();

        this.showNotification(`Projeto "${this.projectInfo.name}" carregado com sucesso!`, 'success');
    }

    saveProject() {
        const projectData = {
            projectInfo: this.projectInfo,
            tasks: this.tasks,
            settings: {
                theme: this.theme,
                currentView: this.currentView,
                zoomLevel: this.zoomLevel,
                autoSave: this.autoSave
            },
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `${this.projectInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);

        this.projectInfo.modified = new Date();
        this.hasUnsavedChanges = false;
        this.updateProjectStatus();
        this.showNotification('Projeto salvo com sucesso!', 'success');
    }

    saveProjectAs() {
        const newName = prompt('Digite o nome do projeto:', this.projectInfo.name);
        if (newName && newName.trim()) {
            const originalName = this.projectInfo.name;
            this.projectInfo.name = newName.trim();
            document.getElementById('projectName').value = this.projectInfo.name;
            this.saveProject();
            this.showNotification(`Projeto salvo como "${newName}"!`, 'success');
        }
        this.closeSaveDropdown();
    }

    saveAsTemplate() {
        const templateName = prompt('Nome do template:', `Template_${this.projectInfo.name}`);
        if (templateName && templateName.trim()) {
            const templateData = {
                name: templateName.trim(),
                description: `Template baseado no projeto ${this.projectInfo.name}`,
                tasks: this.tasks.map(task => ({
                    ...task,
                    progress: 0,
                    status: 'not-started',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + (task.endDate - task.startDate))
                })),
                type: 'template',
                created: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.download = `template_${templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);

            this.showNotification(`Template "${templateName}" salvo com sucesso!`, 'success');
        }
        this.closeSaveDropdown();
    }

    toggleAutoSave() {
        this.autoSave = !this.autoSave;
        document.getElementById('autoSaveStatus').textContent = this.autoSave ? 'Ativo' : 'Inativo';
        this.showNotification(`Auto-salvamento ${this.autoSave ? 'ativado' : 'desativado'}!`, 'info');
        this.closeSaveDropdown();
    }

    toggleSaveDropdown() {
        const dropdown = document.getElementById('saveDropdownMenu');
        dropdown.classList.toggle('active');
    }

    closeSaveDropdown() {
        document.getElementById('saveDropdownMenu').classList.remove('active');
    }

    markAsUnsaved() {
        this.hasUnsavedChanges = true;
        this.projectInfo.modified = new Date();
        this.updateProjectStatus();
        
        // Auto-save if enabled
        if (this.autoSave) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                this.performAutoSave();
            }, 30000); // Auto-save after 30 seconds of inactivity
        }
    }

    performAutoSave() {
        if (this.hasUnsavedChanges && this.autoSave) {
            // Save to localStorage as backup
            const projectData = {
                projectInfo: this.projectInfo,
                tasks: this.tasks,
                settings: {
                    theme: this.theme,
                    currentView: this.currentView,
                    zoomLevel: this.zoomLevel,
                    autoSave: this.autoSave
                },
                timestamp: new Date().toISOString(),
                autoSaved: true
            };
            
            localStorage.setItem('gantt_autosave', JSON.stringify(projectData));
            this.showAutoSaveIndicator();
        }
    }

    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = '<i class="fas fa-save"></i> Salvo automaticamente';
        document.body.appendChild(indicator);
        
        indicator.style.display = 'block';
        setTimeout(() => {
            indicator.remove();
        }, 2000);
    }

    updateProjectStatus() {
        // Add visual indicator for unsaved changes
        const projectName = document.getElementById('projectName');
        if (this.hasUnsavedChanges) {
            projectName.style.borderLeft = '3px solid var(--warning-color)';
            projectName.title = 'Projeto com alterações não salvas';
        } else {
            projectName.style.borderLeft = '3px solid var(--success-color)';
            projectName.title = 'Projeto salvo';
        }
    }

    saveProject() {
        const projectData = {
            tasks: this.tasks,
            settings: {
                theme: this.theme,
                currentView: this.currentView,
                zoomLevel: this.zoomLevel
            },
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `projeto-gantt-${new Date().toISOString().split('T')[0]}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Add close event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    showConfirmDialog(title, message, subtitle, onConfirm) {
        // Remove existing dialogs
        const existingDialogs = document.querySelectorAll('.confirm-dialog');
        existingDialogs.forEach(d => d.remove());

        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog modal active';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <div class="confirm-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <p><strong>${message}</strong></p>
                            <p class="confirm-subtitle">${subtitle}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary confirm-cancel">Cancelar</button>
                    <button class="btn btn-danger confirm-ok">Excluir</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Add events
        dialog.querySelector('.confirm-cancel').addEventListener('click', () => {
            dialog.remove();
        });

        dialog.querySelector('.confirm-ok').addEventListener('click', () => {
            onConfirm();
            dialog.remove();
        });

        // Close on backdrop click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    showContextMenu(event, task) {
        // Remove existing context menus
        const existingMenus = document.querySelectorAll('.context-menu');
        existingMenus.forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;

        menu.innerHTML = `
            <div class="context-menu-item" data-action="view">
                <i class="fas fa-eye"></i>
                Ver Detalhes
            </div>
            <div class="context-menu-item" data-action="edit">
                <i class="fas fa-edit"></i>
                Editar
            </div>
            <div class="context-menu-item" data-action="duplicate">
                <i class="fas fa-copy"></i>
                Duplicar
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item context-menu-danger" data-action="delete">
                <i class="fas fa-trash"></i>
                Excluir
            </div>
        `;

        document.body.appendChild(menu);

        // Add events
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextMenuAction(action, task);
                menu.remove();
            }
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', () => {
                menu.remove();
            }, { once: true });
        }, 0);

        // Position menu within viewport
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${event.pageX - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${event.pageY - rect.height}px`;
        }
    }

    handleContextMenuAction(action, task) {
        this.selectTask(task);
        
        switch (action) {
            case 'view':
                this.showTaskModal(task);
                break;
            case 'edit':
                this.editSelectedTask();
                break;
            case 'duplicate':
                this.duplicateTask(task);
                break;
            case 'delete':
                this.deleteSelectedTask();
                break;
        }
    }

    duplicateTask(task) {
        const newTask = {
            ...task,
            id: Date.now(),
            name: `${task.name} (Cópia)`,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate),
            progress: 0,
            status: 'not-started'
        };

        // Adjust dates to start tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const duration = this.getDaysBetweenDates(task.startDate, task.endDate).length;
        
        newTask.startDate = new Date(tomorrow);
        newTask.endDate = new Date(tomorrow);
        newTask.endDate.setDate(newTask.endDate.getDate() + duration);

        this.tasks.push(newTask);
        this.markAsUnsaved();
        this.updateDateRange();
        this.renderGanttChart();
        this.updateStatistics();
        
        this.showNotification('Tarefa duplicada com sucesso!', 'success');
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Handle Ctrl+key combinations
        if (e.ctrlKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.showNewProjectModal();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openProject();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveProject();
                    break;
            }
            return;
        }

        switch (e.key) {
            case 'Delete':
                if (this.selectedTask) {
                    e.preventDefault();
                    this.deleteSelectedTask();
                }
                break;
            case 'F2':
                if (this.selectedTask) {
                    e.preventDefault();
                    this.editSelectedTask();
                }
                break;
            case 'Enter':
                if (this.selectedTask) {
                    e.preventDefault();
                    this.showTaskModal(this.selectedTask);
                }
                break;
            case 'Escape':
                // Close modals and cancel edit
                if (this.editingTask) {
                    this.cancelEdit();
                }
                this.hideTaskModal();
                this.hideExportModal();
                this.hideNewProjectModal();
                this.closeSaveDropdown();
                // Remove context menus
                const existingMenus = document.querySelectorAll('.context-menu');
                existingMenus.forEach(m => m.remove());
                break;
        }
    }

    getDaysBetweenDates(startDate, endDate) {
        const days = [];
        const currentDate = new Date(startDate);
        
        console.log(`Gerando dias entre ${startDate.toLocaleDateString('pt-BR')} e ${endDate.toLocaleDateString('pt-BR')}`);
        
        // Garantir que incluímos o dia onde está o endDate
        const extendedEndDate = new Date(endDate);
        extendedEndDate.setDate(extendedEndDate.getDate() + 7); // Add one more week buffer
        
        while (currentDate <= extendedEndDate) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`Total de dias gerados: ${days.length}`);
        return days;
    }

    getWeeksBetweenDates(startDate, endDate) {
        const weeks = [];
        const currentDate = new Date(startDate);
        
        // Ajustar para o início da semana (Segunda-feira)
        const dayOfWeek = currentDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        currentDate.setDate(currentDate.getDate() - daysToMonday);
        
        // Garantir que incluímos a semana onde está o endDate
        const extendedEndDate = new Date(endDate);
        extendedEndDate.setDate(extendedEndDate.getDate() + 7); // Add one more week buffer
        
        while (currentDate <= extendedEndDate) {
            const weekStart = new Date(currentDate);
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            weeks.push({
                start: weekStart,
                end: weekEnd,
                weekNumber: this.getWeekNumber(weekStart)
            });
            
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        return weeks;
    }

    getMonthsBetweenDates(startDate, endDate) {
        const months = [];
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        // Garantir que incluímos o mês onde está o endDate
        const extendedEndDate = new Date(endDate);
        extendedEndDate.setMonth(extendedEndDate.getMonth() + 2); // Add two more months buffer
        
        while (currentDate <= extendedEndDate) {
            months.push(new Date(currentDate));
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        return months;
    }

    getWeekNumber(date) {
        // Calcular número da semana baseado no ano
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - startOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    }

    getWeeksFromDate(startDate, targetDate) {
        // Calcular diferença em semanas entre duas datas
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const startWeek = new Date(startDate);
        
        // Ajustar para início da semana (segunda-feira)
        const dayOfWeek = startWeek.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startWeek.setDate(startWeek.getDate() - daysToMonday);
        startWeek.setHours(0, 0, 0, 0);
        
        const targetWeek = new Date(targetDate);
        const targetDayOfWeek = targetWeek.getDay();
        const targetDaysToMonday = targetDayOfWeek === 0 ? 6 : targetDayOfWeek - 1;
        targetWeek.setDate(targetWeek.getDate() - targetDaysToMonday);
        targetWeek.setHours(0, 0, 0, 0);
        
        return Math.floor((targetWeek - startWeek) / msPerWeek);
    }

    getMonthsFromDate(startDate, targetDate) {
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
        
        return (targetYear - startYear) * 12 + (targetMonth - startMonth);
    }

    isCurrentPeriod(unit) {
        const today = new Date();
        
        switch (this.currentView) {
            case 'day':
                return unit.toDateString() === today.toDateString();
            case 'week':
                return today >= unit.start && today <= unit.end;
            case 'month':
                return today.getFullYear() === unit.getFullYear() && 
                       today.getMonth() === unit.getMonth();
            default:
                return false;
        }
    }

    // Formatação para diferentes visualizações
    formatDayPrimary(date) {
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short' 
        });
    }

    formatDaySecondary(date) {
        return date.toLocaleDateString('pt-BR', { 
            weekday: 'short' 
        });
    }

    formatWeekPrimary(week) {
        return `Sem ${week.weekNumber}`;
    }

    formatWeekSecondary(week) {
        return `${week.start.getDate()}/${week.start.getMonth() + 1} - ${week.end.getDate()}/${week.end.getMonth() + 1}`;
    }

    formatMonthPrimary(date) {
        return date.toLocaleDateString('pt-BR', { 
            month: 'long' 
        });
    }

    formatMonthSecondary(date) {
        return date.getFullYear().toString();
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    formatDate(date) {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateInput(date) {
        return date.toISOString().split('T')[0];
    }

    formatMonth(date) {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        });
    }

    getStatusLabel(status) {
        const labels = {
            'not-started': 'Não Iniciado',
            'in-progress': 'Em Progresso',
            'completed': 'Concluído',
            'delayed': 'Atrasado'
        };
        return labels[status] || status;
    }

    getPriorityLabel(priority) {
        const labels = {
            'low': 'Baixa',
            'medium': 'Média',
            'high': 'Alta'
        };
        return labels[priority] || priority;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ganttApp = new GanttProfessional();
    
    // Set default dates in form
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    document.getElementById('taskStartDate').value = window.ganttApp.formatDateInput(today);
    document.getElementById('taskEndDate').value = window.ganttApp.formatDateInput(tomorrow);
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.ganttApp) {
        setTimeout(() => {
            window.ganttApp.renderGanttChart();
        }, 100);
    }
});

// Handle file drop for project loading
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0 && files[0].name.endsWith('.json')) {
        window.ganttApp.handleFileOpen(files[0]);
    }
});