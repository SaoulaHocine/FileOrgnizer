class FileOrganizerApp {
    constructor() {
        this.urlList = [];
        this.selectedRowIndex = -1;
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupEventListeners();
        this.updateTable();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // Single Link Organizer
        document.getElementById('select-source').addEventListener('click', () => this.selectDirectory('source-path'));
        document.getElementById('select-destination').addEventListener('click', () => this.selectDirectory('destination-path'));
        document.getElementById('clear-single').addEventListener('click', () => this.clearSingle());
        document.getElementById('organize-single').addEventListener('click', () => this.organizeSingle());

        // Multi Link Organizer
        document.getElementById('add-link').addEventListener('click', () => this.addNewUrl());
        document.getElementById('delete-link').addEventListener('click', () => this.deleteSelectedUrl());
        document.getElementById('select-multi-destination').addEventListener('click', () => this.selectDirectory('multi-destination-path'));
        document.getElementById('clear-multi').addEventListener('click', () => this.clearMulti());
        document.getElementById('organize-multi').addEventListener('click', () => this.organizeMulti());

        // Table row selection
        document.getElementById('url-table-body').addEventListener('click', (e) => {
            if (e.target.tagName === 'TD') {
                this.selectTableRow(e.target.parentElement);
            }
        });
    }

    async selectDirectory(inputId) {
        try {
            const selectedPath = await window.electronAPI.selectDirectory();
            if (selectedPath) {
                document.getElementById(inputId).value = selectedPath;
                
                // Auto-fill destination if source is selected
                if (inputId === 'source-path') {
                    const destinationInput = document.getElementById('destination-path');
                    if (!destinationInput.value) {
                        destinationInput.value = selectedPath;
                    }
                }
            }
        } catch (error) {
            console.error('Error selecting directory:', error);
            await this.showAlert('error', 'Error', 'Failed to select directory');
        }
    }

    clearSingle() {
        document.getElementById('source-path').value = '';
        document.getElementById('destination-path').value = '';
        document.getElementById('prefix-single').value = '';
    }

    async organizeSingle() {
        const sourcePath = document.getElementById('source-path').value.trim();
        const destinationPath = document.getElementById('destination-path').value.trim();
        const prefix = document.getElementById('prefix-single').value.trim();

        if (!sourcePath || !destinationPath) {
            await this.showAlert('error', 'Error', 'Please select both source and destination folders');
            return;
        }

        if (prefix && !this.isValidFolderName(prefix)) {
            await this.showAlert('error', 'Error', 'Please enter a valid prefix (letters, numbers, spaces, hyphens, and underscores only)');
            return;
        }

        const organizeButton = document.getElementById('organize-single');
        organizeButton.classList.add('loading');

        try {
            const result = await window.electronAPI.organizeFiles(sourcePath, destinationPath, prefix);
            
            if (result.success) {
                let message = `Successfully organized ${result.movedCount} files.`;
                if (result.errors.length > 0) {
                    message += `\n\nWarnings:\n${result.errors.join('\n')}`;
                }
                
                const response = await this.showAlert('question', 'Success', `${message}\n\nWould you like to open the destination folder?`);
                if (response === 0) { // Yes button
                    await window.electronAPI.openFolder(destinationPath);
                }
            } else {
                await this.showAlert('error', 'Error', result.error || 'Failed to organize files');
            }
        } catch (error) {
            console.error('Error organizing files:', error);
            await this.showAlert('error', 'Error', 'An unexpected error occurred while organizing files');
        } finally {
            organizeButton.classList.remove('loading');
        }
    }

    async addNewUrl() {
        try {
            const selectedPath = await window.electronAPI.selectDirectory();
            if (selectedPath) {
                // Check for duplicates
                const isDuplicate = this.urlList.some(item => item.path === selectedPath);
                if (isDuplicate) {
                    await this.showAlert('warning', 'Warning', 'This folder is already in the list');
                    return;
                }

                const newItem = {
                    id: this.urlList.length + 1,
                    path: selectedPath
                };
                this.urlList.push(newItem);
                this.updateTable();
            }
        } catch (error) {
            console.error('Error adding new URL:', error);
            await this.showAlert('error', 'Error', 'Failed to add new folder');
        }
    }

    deleteSelectedUrl() {
        if (this.selectedRowIndex >= 0 && this.selectedRowIndex < this.urlList.length) {
            this.urlList.splice(this.selectedRowIndex, 1);
            // Reassign IDs
            this.urlList.forEach((item, index) => {
                item.id = index + 1;
            });
            this.selectedRowIndex = -1;
            this.updateTable();
        } else {
            this.showAlert('warning', 'Warning', 'Please select a row to delete');
        }
    }

    selectTableRow(row) {
        // Remove selection from all rows
        const allRows = document.querySelectorAll('#url-table-body tr');
        allRows.forEach(r => r.classList.remove('selected'));
        
        // Add selection to clicked row
        row.classList.add('selected');
        this.selectedRowIndex = parseInt(row.cells[0].textContent) - 1;
    }

    updateTable() {
        const tbody = document.getElementById('url-table-body');
        tbody.innerHTML = '';

        this.urlList.forEach((item, index) => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = item.id;
            row.insertCell(1).textContent = item.path;
            
            if (index === this.selectedRowIndex) {
                row.classList.add('selected');
            }
        });
    }

    clearMulti() {
        this.urlList = [];
        this.selectedRowIndex = -1;
        document.getElementById('multi-destination-path').value = '';
        document.getElementById('prefix-multi').value = '';
        this.updateTable();
    }

    async organizeMulti() {
        const destinationPath = document.getElementById('multi-destination-path').value.trim();
        const prefix = document.getElementById('prefix-multi').value.trim();

        if (this.urlList.length === 0) {
            await this.showAlert('error', 'Error', 'Please add at least one source folder');
            return;
        }

        if (!destinationPath) {
            await this.showAlert('error', 'Error', 'Please select a destination folder');
            return;
        }

        if (prefix && !this.isValidFolderName(prefix)) {
            await this.showAlert('error', 'Error', 'Please enter a valid prefix (letters, numbers, spaces, hyphens, and underscores only)');
            return;
        }

        const organizeButton = document.getElementById('organize-multi');
        organizeButton.classList.add('loading');

        try {
            const sourcePaths = this.urlList.map(item => item.path);
            const result = await window.electronAPI.organizeMultiFiles(sourcePaths, destinationPath, prefix);
            
            if (result.success) {
                let message = `Successfully organized ${result.movedCount} files from ${sourcePaths.length} folders.`;
                if (result.errors.length > 0) {
                    message += `\n\nWarnings:\n${result.errors.slice(0, 10).join('\n')}`;
                    if (result.errors.length > 10) {
                        message += `\n... and ${result.errors.length - 10} more warnings`;
                    }
                }
                
                const response = await this.showAlert('question', 'Success', `${message}\n\nWould you like to open the destination folder?`);
                if (response === 0) { // Yes button
                    await window.electronAPI.openFolder(destinationPath);
                }
            } else {
                await this.showAlert('error', 'Error', result.error || 'Failed to organize files');
            }
        } catch (error) {
            console.error('Error organizing multi files:', error);
            await this.showAlert('error', 'Error', 'An unexpected error occurred while organizing files');
        } finally {
            organizeButton.classList.remove('loading');
        }
    }

    async showAlert(type, title, message) {
        return await window.electronAPI.showMessage(type, title, message);
    }

    isValidFolderName(folderName) {
        // Allow letters, numbers, spaces, hyphens, and underscores
        const pattern = /^[a-zA-Z0-9_\- ]+$/;
        return pattern.test(folderName);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileOrganizerApp();
});