const { Notification } = require('electron');

class NotificationManager {
  constructor() {
    this.isSupported = Notification.isSupported();
    this.notifications = new Map();
  }

  start() {
    if (!this.isSupported) {
      console.warn('Desktop notifications are not supported on this platform');
    }
  }

  showNotification(title, body, options = {}) {
    if (!this.isSupported) {
      console.log(`Notification: ${title} - ${body}`);
      return;
    }

    const notification = new Notification({
      title: title || 'Xero Desktop',
      body: body,
      icon: options.icon || 'assets/icon.png',
      silent: options.silent || false,
      timeoutType: options.timeoutType || 'default',
      urgency: options.urgency || 'normal',
      ...options
    });

    // Store notification reference
    const notificationId = this.generateNotificationId();
    this.notifications.set(notificationId, notification);

    // Handle notification events
    notification.on('click', () => {
      this.handleNotificationClick(notificationId, options);
    });

    notification.on('close', () => {
      this.notifications.delete(notificationId);
    });

    notification.on('action', (event, index) => {
      this.handleNotificationAction(notificationId, index, options);
    });

    // Show the notification
    notification.show();

    return notificationId;
  }

  generateNotificationId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  handleNotificationClick(notificationId, options) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    // Focus the main window
    if (options.focusWindow) {
      options.focusWindow();
    }

    // Handle custom click action
    if (options.onClick) {
      options.onClick(notificationId);
    }

    // Close the notification
    notification.close();
  }

  handleNotificationAction(notificationId, actionIndex, options) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    // Handle custom action
    if (options.actions && options.actions[actionIndex] && options.actions[actionIndex].onClick) {
      options.actions[actionIndex].onClick(notificationId);
    }

    // Close the notification
    notification.close();
  }

  // Predefined notification types
  showPaymentReceived(invoiceNumber, amount) {
    return this.showNotification(
      'Payment Received',
      `Payment of $${amount} received for invoice ${invoiceNumber}`,
      {
        urgency: 'high',
        icon: 'assets/payment-icon.png'
      }
    );
  }

  showInvoiceOverdue(invoiceNumber, daysOverdue) {
    return this.showNotification(
      'Invoice Overdue',
      `Invoice ${invoiceNumber} is ${daysOverdue} days overdue`,
      {
        urgency: 'high',
        icon: 'assets/warning-icon.png'
      }
    );
  }

  showSyncComplete(successCount, errorCount) {
    const message = errorCount > 0 
      ? `Sync completed with ${successCount} successful and ${errorCount} failed items`
      : `Sync completed successfully with ${successCount} items`;

    return this.showNotification(
      'Sync Complete',
      message,
      {
        urgency: errorCount > 0 ? 'high' : 'normal',
        icon: errorCount > 0 ? 'assets/error-icon.png' : 'assets/success-icon.png'
      }
    );
  }

  showConnectionRestored() {
    return this.showNotification(
      'Connection Restored',
      'Internet connection restored. Syncing offline changes...',
      {
        urgency: 'normal',
        icon: 'assets/connection-icon.png'
      }
    );
  }

  showConnectionLost() {
    return this.showNotification(
      'Connection Lost',
      'Internet connection lost. Working in offline mode.',
      {
        urgency: 'normal',
        icon: 'assets/offline-icon.png'
      }
    );
  }

  showNewInvoiceCreated(invoiceNumber) {
    return this.showNotification(
      'Invoice Created',
      `New invoice ${invoiceNumber} has been created`,
      {
        urgency: 'normal',
        icon: 'assets/invoice-icon.png'
      }
    );
  }

  showNewBillReceived(billNumber, amount) {
    return this.showNotification(
      'New Bill Received',
      `New bill ${billNumber} for $${amount} has been received`,
      {
        urgency: 'normal',
        icon: 'assets/bill-icon.png'
      }
    );
  }

  showExpenseClaimSubmitted(claimId) {
    return this.showNotification(
      'Expense Claim Submitted',
      `Expense claim ${claimId} has been submitted for approval`,
      {
        urgency: 'normal',
        icon: 'assets/expense-icon.png'
      }
    );
  }

  showExpenseClaimApproved(claimId) {
    return this.showNotification(
      'Expense Claim Approved',
      `Expense claim ${claimId} has been approved`,
      {
        urgency: 'normal',
        icon: 'assets/approval-icon.png'
      }
    );
  }

  showBankReconciliationComplete(accountName) {
    return this.showNotification(
      'Bank Reconciliation Complete',
      `Bank reconciliation for ${accountName} has been completed`,
      {
        urgency: 'normal',
        icon: 'assets/bank-icon.png'
      }
    );
  }

  showReportReady(reportName) {
    return this.showNotification(
      'Report Ready',
      `Report "${reportName}" is ready for viewing`,
      {
        urgency: 'low',
        icon: 'assets/report-icon.png'
      }
    );
  }

  showUpdateAvailable(version) {
    return this.showNotification(
      'Update Available',
      `Xero Desktop ${version} is available for download`,
      {
        urgency: 'normal',
        icon: 'assets/update-icon.png',
        actions: [
          {
            type: 'button',
            text: 'Download Now'
          },
          {
            type: 'button',
            text: 'Remind Later'
          }
        ]
      }
    );
  }

  showUpdateDownloaded() {
    return this.showNotification(
      'Update Downloaded',
      'Update has been downloaded and is ready to install',
      {
        urgency: 'normal',
        icon: 'assets/update-icon.png',
        actions: [
          {
            type: 'button',
            text: 'Install Now'
          },
          {
            type: 'button',
            text: 'Install Later'
          }
        ]
      }
    );
  }

  // Close all active notifications
  closeAll() {
    this.notifications.forEach(notification => {
      notification.close();
    });
    this.notifications.clear();
  }

  // Close a specific notification
  close(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.close();
      this.notifications.delete(notificationId);
    }
  }

  // Get notification count
  getNotificationCount() {
    return this.notifications.size;
  }

  // Check if notifications are supported
  isNotificationSupported() {
    return this.isSupported;
  }
}

module.exports = NotificationManager;
