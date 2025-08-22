# Xero Desktop Application

A native desktop application for Xero users, providing enhanced performance, offline capabilities, and a user interface optimized for desktop workflows. The application supports both API integration and web interface modes.

## Features

### Core Functionality
- **Hybrid Application**: Combines real-time data synchronization with offline capabilities
- **Dual Mode Support**: Works with both Xero API and Xero web interface
- **Native Desktop Experience**: Optimized for Windows and macOS
- **Performance**: Faster loading times and responsive UI compared to web application

### Dual Mode Operation
- **API Mode**: Full integration with Xero API for data synchronization and offline capabilities
- **Web Mode**: Webview wrapper around Xero web interface when API is not available
- **Automatic Fallback**: Automatically switches to web mode if API is unavailable
- **Mode Toggle**: Users can manually switch between API and web modes

### Offline Mode
- **Read-Only Access**: View all Xero data (invoices, bills, contacts, bank transactions, reports)
- **Create and Edit**: Create and edit invoices, bills, contacts, and expense claims offline
- **Data Synchronization**: Automatic sync when internet connection is restored
- **Conflict Resolution**: Handle data conflicts between offline and online versions

### Navigation Features
- **Left Navigation Bar**: Persistent sidebar with quick access to key areas
- **Recently Used URLs**: Track and display most recently visited Xero pages
- **Custom Shortcuts**: Add custom shortcuts to frequently used reports and pages
- **Web Navigation**: Full browser-like navigation in web mode

### User Interface
- **Native Look and Feel**: Platform-specific design for Windows and macOS
- **Keyboard Shortcuts**: Efficient shortcuts for common tasks
- **Desktop Notifications**: Native notifications for important events
- **Responsive Design**: Optimized for different screen sizes

## Technology Stack

- **Electron**: Desktop application framework
- **React**: Frontend UI library
- **WebView**: Embedded web browser for Xero web interface
- **SQLite**: Local database for offline data storage
- **CryptoJS**: Data encryption for security
- **Lucide React**: Icon library
- **Webpack**: Build tool and bundler

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xero-desktop-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## Development

### Development Mode
```bash
npm run dev
```
This will start the application in development mode with hot reloading.

### Building for Production
```bash
npm run build
npm run dist
```

### Platform-Specific Builds
```bash
# For macOS
npm run dist:mac

# For Windows
npm run dist:win
```

## Project Structure

```
xero-desktop-app/
├── main.js                 # Main Electron process
├── preload.js             # Preload script for secure IPC
├── package.json           # Project configuration
├── webpack.config.js      # Webpack configuration
├── src/
│   ├── database/
│   │   └── database.js    # SQLite database operations
│   ├── services/
│   │   ├── syncManager.js # Data synchronization
│   │   └── notificationManager.js # Desktop notifications
│   └── renderer/
│       ├── index.js       # React entry point
│       ├── App.js         # Main React component
│       ├── components/    # Reusable UI components
│       │   ├── Sidebar.js # Navigation sidebar
│       │   ├── Header.js  # Application header
│       │   └── WebView.js # Webview component for web mode
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       └── styles/        # CSS styles
└── dist/                  # Built application files
```

## Configuration

### Environment Variables
- `NODE_ENV`: Set to 'development' for development mode
- `XERO_CLIENT_ID`: Your Xero application client ID (optional for web mode)
- `XERO_CLIENT_SECRET`: Your Xero application client secret (optional for web mode)

### Database Configuration
The application uses SQLite for local data storage. The database file is automatically created in the user's application data directory:
- **Windows**: `%APPDATA%\.xero-desktop\xero.db`
- **macOS**: `~/Library/Application Support/.xero-desktop/xero.db`

## Operating Modes

### API Mode
- **Full Integration**: Direct access to Xero API
- **Offline Capabilities**: Full offline functionality with data sync
- **Real-time Sync**: Automatic synchronization with Xero servers
- **Data Encryption**: Encrypted local storage of sensitive data

### Web Mode
- **Web Interface**: Embedded Xero web application
- **Full Functionality**: Access to all Xero web features
- **Navigation**: Browser-like navigation with back/forward buttons
- **No API Required**: Works without API credentials
- **Fallback Option**: Automatic fallback when API is unavailable

### Mode Switching
- **Automatic**: App detects API availability and switches modes
- **Manual**: Users can toggle between modes using the header button
- **Persistent**: Mode preference is saved between sessions

## Security Features

- **Data Encryption**: All sensitive data is encrypted using AES encryption
- **Secure IPC**: Context isolation between main and renderer processes
- **HTTPS Communication**: Secure communication with Xero servers
- **Input Validation**: Comprehensive input validation and sanitization
- **WebView Security**: Secure webview configuration for web mode

## Offline Capabilities

### Supported Offline Operations (API Mode)
- View all existing data (invoices, bills, contacts, etc.)
- Create new invoices, bills, contacts, and expense claims
- Edit existing records
- View cached reports

### Sync Behavior
- Automatic sync when connection is restored
- Conflict resolution for conflicting changes
- Queue-based sync for failed operations
- Retry mechanism for failed sync attempts

## Web Mode Features

### Navigation
- **Browser Controls**: Back, forward, refresh, and home buttons
- **URL Display**: Current URL shown in navigation bar
- **External Links**: Opens external links in default browser
- **Loading Indicators**: Visual feedback during page loads

### Integration
- **Sidebar Navigation**: Quick access to Xero sections
- **Recent URLs**: Track and access recently visited pages
- **Custom Shortcuts**: Add shortcuts to frequently used pages
- **Mode Indicators**: Clear indication of current operating mode

## Keyboard Shortcuts

- `Cmd/Ctrl + N`: New Invoice
- `Cmd/Ctrl + Shift + N`: New Bill
- `Cmd/Ctrl + S`: Sync Now (API mode)
- `Cmd/Ctrl + Q`: Quit Application

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check Node.js version (requires v16+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Database errors**
   - Check file permissions in application data directory
   - Delete database file to reset: Remove `.xero-desktop` folder

3. **Sync issues**
   - Check internet connection
   - Verify Xero API credentials
   - Check sync queue in database

4. **Web mode issues**
   - Check internet connection
   - Verify Xero web interface is accessible
   - Clear webview cache if needed

### Debug Mode
Enable debug mode by setting `NODE_ENV=development` and running:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the Xero API documentation

## Roadmap

### Future Features
- **Expanded Offline Functionality**: Bank reconciliation and payroll support
- **Deeper OS Integration**: System-wide search and file drag-and-drop
- **Plugin Architecture**: Third-party developer extensions
- **Advanced Reporting**: Custom report builder
- **Multi-tenant Support**: Multiple Xero organization support
- **Enhanced Web Mode**: Better integration with Xero web interface

### Performance Improvements
- **Lazy Loading**: Load data on demand
- **Caching Strategy**: Improved data caching
- **Background Sync**: Non-blocking sync operations
- **Memory Optimization**: Reduced memory footprint

## Version History

### v1.0.0 (Current)
- Initial release
- Dual mode support (API + Web)
- Basic offline functionality
- Core Xero features
- Desktop notifications
- Native UI/UX

---

**Note**: This application can work with or without Xero API credentials. In web mode, it provides a native desktop wrapper around the Xero web interface. For full offline capabilities, API credentials are required.
