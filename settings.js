// TravelWhiz Settings JavaScript
class TravelWhizSettings {
    constructor() {
        this.settings = {};
        this.passengerData = {};
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.populateForm();
        this.updateVersionInfo();
    }
    
    async loadSettings() {
        try {
            // Load all settings from storage
            const result = await chrome.storage.sync.get([
                'notificationsEnabled',
                'voiceEnabled', 
                'autoOpenTatkal',
                'affiliateTracking',
                'passengerData',
                'quotaPreferences',
                'alertSettings',
                'dataRetentionDays'
            ]);
            
            this.settings = result;
            this.passengerData = result.passengerData || {};
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    setupEventListeners() {
        // General settings toggles
        const toggles = [
            'notificationsEnabled',
            'voiceEnabled',
            'autoOpenTatkal',
            'affiliateTracking',
            'seniorCitizenQuota',
            'ladiesQuota',
            'divyangjanQuota',
            'tatkalQuota',
            'pnrStatusAlerts',
            'tatkalAlerts',
            'alternativeAlerts',
            'priceDropAlerts'
        ];
        
        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', () => {
                    this.handleToggleChange(toggleId, toggle.checked);
                });
            }
        });
        
        // Passenger form inputs
        const passengerInputs = [
            'passengerName',
            'passengerAge',
            'passengerGender',
            'berthPreference',
            'mobileNumber',
            'emailAddress',
            'idProof'
        ];
        
        passengerInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', () => {
                    this.handlePassengerDataChange(inputId, input.value);
                });
            }
        });
        
        // Data retention dropdown
        const dataRetention = document.getElementById('dataRetention');
        if (dataRetention) {
            dataRetention.addEventListener('change', () => {
                this.handleSettingChange('dataRetentionDays', parseInt(dataRetention.value));
            });
        }
        
        // Save passenger data button
        const saveBtn = document.getElementById('savePassengerData');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.savePassengerData();
            });
        }
        
        // Privacy action buttons
        const exportBtn = document.getElementById('exportData');
        const clearBtn = document.getElementById('clearData');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportUserData();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }
        
        // About links
        const helpLink = document.getElementById('helpLink');
        const privacyLink = document.getElementById('privacyLink');
        const feedbackLink = document.getElementById('feedbackLink');
        
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openHelpPage();
            });
        }
        
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openPrivacyPolicy();
            });
        }
        
        if (feedbackLink) {
            feedbackLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openFeedbackForm();
            });
        }
    }
    
    populateForm() {
        // Populate general settings
        this.setToggleValue('notificationsEnabled', this.settings.notificationsEnabled !== false);
        this.setToggleValue('voiceEnabled', this.settings.voiceEnabled !== false);
        this.setToggleValue('autoOpenTatkal', this.settings.autoOpenTatkal === true);
        this.setToggleValue('affiliateTracking', this.settings.affiliateTracking !== false);
        
        // Populate passenger data
        if (this.passengerData) {
            this.setInputValue('passengerName', this.passengerData.name || '');
            this.setInputValue('passengerAge', this.passengerData.age || '');
            this.setInputValue('passengerGender', this.passengerData.gender || '');
            this.setInputValue('berthPreference', this.passengerData.berthPreference || '');
            this.setInputValue('mobileNumber', this.passengerData.mobile || '');
            this.setInputValue('emailAddress', this.passengerData.email || '');
            this.setInputValue('idProof', this.passengerData.idProof || '');
        }
        
        // Populate quota preferences
        const quotaPrefs = this.settings.quotaPreferences || {};
        this.setToggleValue('seniorCitizenQuota', quotaPrefs.seniorCitizen === true);
        this.setToggleValue('ladiesQuota', quotaPrefs.ladies === true);
        this.setToggleValue('divyangjanQuota', quotaPrefs.divyangjan === true);
        this.setToggleValue('tatkalQuota', quotaPrefs.tatkal !== false);
        
        // Populate alert settings
        const alertSettings = this.settings.alertSettings || {};
        this.setToggleValue('pnrStatusAlerts', alertSettings.pnrStatus !== false);
        this.setToggleValue('tatkalAlerts', alertSettings.tatkal !== false);
        this.setToggleValue('alternativeAlerts', alertSettings.alternatives !== false);
        this.setToggleValue('priceDropAlerts', alertSettings.priceDrop === true);
        
        // Populate data retention
        this.setSelectValue('dataRetention', this.settings.dataRetentionDays || 30);
    }
    
    setToggleValue(id, value) {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.checked = value;
        }
    }
    
    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value;
        }
    }
    
    setSelectValue(id, value) {
        const select = document.getElementById(id);
        if (select) {
            select.value = value;
        }
    }
    
    async handleToggleChange(settingName, value) {
        // Handle quota and alert settings specially
        if (settingName.includes('Quota')) {
            await this.handleQuotaChange(settingName, value);
        } else if (settingName.includes('Alerts')) {
            await this.handleAlertChange(settingName, value);
        } else {
            await this.handleSettingChange(settingName, value);
        }
    }
    
    async handleSettingChange(settingName, value) {
        try {
            await chrome.storage.sync.set({ [settingName]: value });
            this.settings[settingName] = value;
            this.showSaveNotification();
            
            // Handle special cases
            if (settingName === 'notificationsEnabled') {
                await this.updateNotificationPermissions(value);
            }
        } catch (error) {
            console.error('Failed to save setting:', error);
            this.showErrorNotification('Failed to save setting');
        }
    }
    
    async handleQuotaChange(quotaName, value) {
        const quotaKey = quotaName.replace('Quota', '').toLowerCase();
        const quotaPrefs = this.settings.quotaPreferences || {};
        
        quotaPrefs[quotaKey] = value;
        
        try {
            await chrome.storage.sync.set({ quotaPreferences: quotaPrefs });
            this.settings.quotaPreferences = quotaPrefs;
            this.showSaveNotification();
        } catch (error) {
            console.error('Failed to save quota preference:', error);
            this.showErrorNotification('Failed to save quota preference');
        }
    }
    
    async handleAlertChange(alertName, value) {
        const alertKey = alertName.replace('Alerts', '').toLowerCase();
        const alertSettings = this.settings.alertSettings || {};
        
        // Convert camelCase to snake_case for storage
        const storageKey = alertKey.replace(/([A-Z])/g, '_$1').toLowerCase();
        alertSettings[storageKey] = value;
        
        try {
            await chrome.storage.sync.set({ alertSettings: alertSettings });
            this.settings.alertSettings = alertSettings;
            this.showSaveNotification();
        } catch (error) {
            console.error('Failed to save alert setting:', error);
            this.showErrorNotification('Failed to save alert setting');
        }
    }
    
    handlePassengerDataChange(fieldName, value) {
        // Map form field names to storage keys
        const fieldMap = {
            'passengerName': 'name',
            'passengerAge': 'age',
            'passengerGender': 'gender',
            'berthPreference': 'berthPreference',
            'mobileNumber': 'mobile',
            'emailAddress': 'email',
            'idProof': 'idProof'
        };
        
        const storageKey = fieldMap[fieldName] || fieldName;
        this.passengerData[storageKey] = value;
    }
    
    async savePassengerData() {
        try {
            // Validate required fields
            if (!this.passengerData.name || !this.passengerData.age || !this.passengerData.gender) {
                this.showErrorNotification('Please fill in all required fields (Name, Age, Gender)');
                return;
            }
            
            // Validate age
            const age = parseInt(this.passengerData.age);
            if (isNaN(age) || age < 1 || age > 120) {
                this.showErrorNotification('Please enter a valid age (1-120)');
                return;
            }
            
            // Validate mobile number
            if (this.passengerData.mobile && !/^\d{10}$/.test(this.passengerData.mobile)) {
                this.showErrorNotification('Please enter a valid 10-digit mobile number');
                return;
            }
            
            // Validate email
            if (this.passengerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.passengerData.email)) {
                this.showErrorNotification('Please enter a valid email address');
                return;
            }
            
            await chrome.storage.sync.set({ passengerData: this.passengerData });
            this.settings.passengerData = this.passengerData;
            
            this.showSaveNotification('Passenger information saved successfully!');
            
            // Auto-enable quota preferences based on passenger data
            await this.autoConfigureQuotas();
            
        } catch (error) {
            console.error('Failed to save passenger data:', error);
            this.showErrorNotification('Failed to save passenger information');
        }
    }
    
    async autoConfigureQuotas() {
        const quotaPrefs = this.settings.quotaPreferences || {};
        let updated = false;
        
        // Auto-enable senior citizen quota if applicable
        const age = parseInt(this.passengerData.age);
        const gender = this.passengerData.gender;
        
        if ((gender === 'Male' && age >= 60) || (gender === 'Female' && age >= 58)) {
            if (!quotaPrefs.seniorcitizen) {
                quotaPrefs.seniorcitizen = true;
                this.setToggleValue('seniorCitizenQuota', true);
                updated = true;
            }
        }
        
        // Auto-enable ladies quota for female passengers
        if (gender === 'Female' && !quotaPrefs.ladies) {
            quotaPrefs.ladies = true;
            this.setToggleValue('ladiesQuota', true);
            updated = true;
        }
        
        if (updated) {
            await chrome.storage.sync.set({ quotaPreferences: quotaPrefs });
            this.settings.quotaPreferences = quotaPrefs;
            this.showSaveNotification('Quota preferences auto-configured based on your profile!');
        }
    }
    
    async updateNotificationPermissions(enabled) {
        if (enabled) {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    this.showErrorNotification('Notification permission denied. Please enable in browser settings.');
                }
            } catch (error) {
                console.error('Failed to request notification permission:', error);
            }
        }
    }
    
    async exportUserData() {
        try {
            // Collect all user data
            const allData = await chrome.storage.sync.get(null);
            const localData = await chrome.storage.local.get(null);
            
            const exportData = {
                settings: allData,
                localData: localData,
                exportDate: new Date().toISOString(),
                version: chrome.runtime.getManifest().version
            };
            
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `travelwhiz-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showSaveNotification('Data exported successfully!');
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showErrorNotification('Failed to export data');
        }
    }
    
    async clearAllData() {
        const confirmed = confirm(
            'Are you sure you want to clear all TravelWhiz data? This action cannot be undone.\n\n' +
            'This will remove:\n' +
            '• All passenger information\n' +
            '• Settings and preferences\n' +
            '• Activity history\n' +
            '• Saved predictions'
        );
        
        if (!confirmed) return;
        
        try {
            // Clear all storage
            await chrome.storage.sync.clear();
            await chrome.storage.local.clear();
            await chrome.storage.session.clear();
            
            // Reset form to defaults
            this.settings = {};
            this.passengerData = {};
            this.populateForm();
            
            this.showSaveNotification('All data cleared successfully!');
        } catch (error) {
            console.error('Failed to clear data:', error);
            this.showErrorNotification('Failed to clear data');
        }
    }
    
    updateVersionInfo() {
        const versionElement = document.getElementById('versionNumber');
        if (versionElement) {
            versionElement.textContent = chrome.runtime.getManifest().version;
        }
    }
    
    openHelpPage() {
        chrome.tabs.create({
            url: 'https://travelwhiz.help/support'
        });
    }
    
    openPrivacyPolicy() {
        chrome.tabs.create({
            url: 'https://travelwhiz.help/privacy'
        });
    }
    
    openFeedbackForm() {
        chrome.tabs.create({
            url: 'https://travelwhiz.help/feedback'
        });
    }
    
    showSaveNotification(message = 'Settings saved successfully!') {
        const notification = document.getElementById('saveNotification');
        const textElement = notification.querySelector('.notification-text');
        
        textElement.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    showErrorNotification(message) {
        const notification = document.getElementById('saveNotification');
        const iconElement = notification.querySelector('.notification-icon');
        const textElement = notification.querySelector('.notification-text');
        
        // Change to error styling
        iconElement.textContent = '❌';
        textElement.textContent = message;
        notification.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            // Reset to success styling
            setTimeout(() => {
                iconElement.textContent = '✅';
                notification.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            }, 300);
        }, 4000);
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TravelWhizSettings();
});