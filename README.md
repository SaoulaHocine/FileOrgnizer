# File Organizer - Electron Desktop App

A modern, cross-platform desktop application for organizing files by their extensions. Built with Electron, this app provides an intuitive interface for sorting files from single or multiple source folders into organized destination directories.

## Features

### 🗂️ Single Link Organizer
- Select a source folder containing files to organize
- Choose a destination folder for organized files
- Add optional prefix to organized folder names
- Files are automatically sorted by extension (e.g., `.pdf`, `.jpg`, `.txt`)

### 🔗 Multi-Link Organizer
- Add multiple source folders to organize simultaneously
- Manage source folders with an easy-to-use table interface
- Remove unwanted folders from the list
- Organize files from all selected folders into a single destination

### ✨ Key Benefits
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Modern UI**: Clean, responsive interface with smooth animations
- **Safe Operations**: Prevents data loss with duplicate file handling
- **Visual Feedback**: Progress indicators and success/error messages
- **File Explorer Integration**: Open organized folders directly from the app

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup
1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Run the app in development mode:
```bash
npm run dev
```

### Building
Create distributable packages:

**For Windows:**
```bash
npm run build-win
```

**For macOS:**
```bash
npm run build-mac
```

**For Linux:**
```bash
npm run build-linux
```

**For all platforms:**
```bash
npm run build
```

## How It Works

### File Organization Process
1. **Scan**: The app scans selected source folders for files
2. **Categorize**: Files are grouped by their extensions
3. **Create Folders**: Destination folders are created based on file extensions
4. **Move Files**: Files are safely moved to their corresponding folders
5. **Report**: Success/error summary is displayed

### Folder Structure Example
```
Destination Folder/
├── [Prefix]pdf/
│   ├── document1.pdf
│   └── report.pdf
├── [Prefix]jpg/
│   ├── photo1.jpg
│   └── image.jpg
└── [Prefix]txt/
    ├── notes.txt
    └── readme.txt
```

## Technology Stack

- **Electron**: Cross-platform desktop app framework
- **Node.js**: Backend runtime for file operations
- **HTML/CSS/JavaScript**: Modern web technologies for the UI
- **IPC (Inter-Process Communication)**: Secure communication between main and renderer processes

## Security Features

- **Context Isolation**: Renderer process is isolated from Node.js APIs
- **Preload Scripts**: Secure exposure of necessary APIs to the frontend
- **No Direct File System Access**: All file operations go through the main process

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include your operating system and Node.js version

---

**Original JavaFX Version**: This Electron app is a modern web-based conversion of the original JavaFX file organizer application, maintaining all core functionality while providing a more accessible and cross-platform experience.