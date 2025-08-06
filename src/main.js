const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('show-message', async (event, type, title, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: type,
    title: title,
    message: message,
    buttons: type === 'question' ? ['Yes', 'No'] : ['OK']
  });
  
  return result.response;
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return true;
  } catch (error) {
    console.error('Error opening folder:', error);
    return false;
  }
});

ipcMain.handle('organize-files', async (event, sourceDir, destinationDir, prefix) => {
  try {
    const result = await organizeFiles(sourceDir, destinationDir, prefix);
    return result;
  } catch (error) {
    console.error('Error organizing files:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('organize-multi-files', async (event, sourceDirs, destinationDir, prefix) => {
  try {
    const result = await organizeMultiFiles(sourceDirs, destinationDir, prefix);
    return result;
  } catch (error) {
    console.error('Error organizing multi files:', error);
    return { success: false, error: error.message };
  }
});

// File organization functions
async function organizeFiles(sourceDir, destinationDir, prefix = '') {
  if (!fs.existsSync(sourceDir) || !fs.lstatSync(sourceDir).isDirectory()) {
    throw new Error('Source directory does not exist or is not a directory');
  }

  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  const errors = [];
  let movedCount = 0;

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const stats = fs.lstatSync(filePath);

    if (stats.isFile()) {
      const extension = getFileExtension(file);
      if (extension) {
        const folderName = prefix ? `${prefix}${extension}` : extension;
        const targetDir = path.join(destinationDir, folderName);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetPath = path.join(targetDir, file);
        
        try {
          if (fs.existsSync(targetPath)) {
            errors.push(`File already exists: ${file}`);
          } else {
            fs.renameSync(filePath, targetPath);
            movedCount++;
          }
        } catch (error) {
          errors.push(`Error moving ${file}: ${error.message}`);
        }
      }
    }
  }

  return {
    success: true,
    movedCount,
    errors
  };
}

async function organizeMultiFiles(sourceDirs, destinationDir, prefix = '') {
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  const allErrors = [];
  let totalMoved = 0;

  for (const sourceDir of sourceDirs) {
    if (!fs.existsSync(sourceDir) || !fs.lstatSync(sourceDir).isDirectory()) {
      allErrors.push(`Source directory does not exist: ${sourceDir}`);
      continue;
    }

    try {
      const result = await organizeFiles(sourceDir, destinationDir, prefix);
      totalMoved += result.movedCount;
      allErrors.push(...result.errors);
    } catch (error) {
      allErrors.push(`Error processing ${sourceDir}: ${error.message}`);
    }
  }

  return {
    success: true,
    movedCount: totalMoved,
    errors: allErrors
  };
}

function getFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex < fileName.length - 1) {
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  }
  return null;
}