// TravelWhiz Background Service Worker
class TravelWhizBackgroundService {
    constructor() {
        this.alarms = new Map();
        this.notifications = new Map();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAlarms();
        this.initializeStorage();
    }
    
    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.onFirstInstall();
            } else if (details.reason === 'update') {
                this.onUpdate(details.previousVersion);
            }
        });
        
        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Indicates async response
        });
        
        // Handle alarms
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });
        
        // Handle notifications
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.handleNotificationClick(notificationId);
        });
        
        // Handle tab updates for affiliate tracking
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.handleTabUpdate(tab);
            }
        });
    }
    
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'predictPNR':
                    const prediction = await this.predictPNRStatus(request.pnr);
                    sendResponse({ success: true, prediction });
                    break;
                    
                case 'setTatkalAlert':
                    await this.setupTatkalAlert(request.data);
                    sendResponse({ success: true });
                    break;
                    
                case 'findAlternatives':
                    const alternatives = await this.findAlternativeRoutes(request.data);
                    sendResponse({ success: true, alternatives });
                    break;
                    
                case 'trackBooking':
                    await this.trackBookingAction(request.data, sender.tab);
                    sendResponse({ success: true });
                    break;
                    
                case 'logActivity':
                    await this.logUserActivity(request.data);
                    sendResponse({ success: true });
                    break;
                    
                case 'getStats':
                    const stats = await this.getUserStats();
                    sendResponse({ success: true, stats });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background service error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    async predictPNRStatus(pnr) {
        // Simulate AI-powered PNR prediction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock prediction algorithm (in production, this would call your AI service)
        const mockFactors = {
            routePopularity: this.getRoutePopularityScore(pnr),
            seasonalDemand: this.getSeasonalDemandScore(),
            historicalData: this.getHistoricalSuccessRate(pnr),
            waitlistPosition: this.extractWaitlistInfo(pnr),
            timeUntilDeparture: this.getTimeUntilDeparture(pnr)
        };
        
        const probability = this.calculateConfirmationProbability(mockFactors);
        
        const prediction = {
            pnr: pnr,
            probability: Math.round(probability * 100),
            confidence: this.calculateConfidence(mockFactors),
            factors: mockFactors,
            recommendations: this.generateRecommendations(probability),
            alternativeRoutes: await this.findAlternativeRoutes({ pnr }),
            estimatedConfirmationTime: this.estimateConfirmationTime(probability),
            riskAssessment: this.assessRisk(probability),
            timestamp: Date.now()
        };
        
        // Store prediction for tracking
        await this.storePrediction(prediction);
        
        return prediction;
    }
    
    getRoutePopularityScore(pnr) {
        // Mock route popularity calculation
        const routeHash = parseInt(pnr.substring(0, 3));
        return 0.4 + (routeHash % 30) / 100; // 0.4 to 0.69
    }
    
    getSeasonalDemandScore() {
        const month = new Date().getMonth();
        const highDemandMonths = [3, 4, 10, 11]; // Apr, May, Nov, Dec
        return highDemandMonths.includes(month) ? 0.7 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4;
    }
    
    getHistoricalSuccessRate(pnr) {
        // Mock historical data based on PNR pattern
        const pattern = parseInt(pnr.substring(3, 6));
        return 0.5 + (pattern % 40) / 100; // 0.5 to 0.89
    }
    
    extractWaitlistInfo(pnr) {
        // Mock waitlist position extraction
        return Math.floor(Math.random() * 50) + 1; // 1-50
    }
    
    getTimeUntilDeparture(pnr) {
        // Mock time calculation
        return Math.floor(Math.random() * 15) + 1; // 1-15 days
    }
    
    calculateConfirmationProbability(factors) {
        const weights = {
            routePopularity: 0.25,
            seasonalDemand: 0.20,
            historicalData: 0.30,
            waitlistPosition: 0.15,
            timeUntilDeparture: 0.10
        };
        
        let probability = 0;
        probability += factors.routePopularity * weights.routePopularity;
        probability += factors.seasonalDemand * weights.seasonalDemand;
        probability += factors.historicalData * weights.historicalData;
        probability += (1 - factors.waitlistPosition / 100) * weights.waitlistPosition;
        probability += (factors.timeUntilDeparture / 15) * weights.timeUntilDeparture;
        
        return Math.min(0.99, Math.max(0.10, probability));
    }
    
    calculateConfidence(factors) {
        // Calculate how confident we are in our prediction
        const variance = Object.values(factors).reduce((sum, val) => sum + Math.abs(val - 0.5), 0);
        return Math.max(0.7, 1 - variance / 10);
    }
    
    generateRecommendations(probability) {
        const recommendations = [];
        
        if (probability < 0.3) {
            recommendations.push('🚨 Low confirmation chances - consider alternative routes immediately');
            recommendations.push('💡 Book backup tickets in different classes');
            recommendations.push('📅 Try different travel dates if flexible');
        } else if (probability < 0.6) {
            recommendations.push('⚠️ Moderate chances - monitor closely and keep backup options');
            recommendations.push('🔄 Check for alternative routes with better availability');
            recommendations.push('⏰ Set up automatic status monitoring');
        } else if (probability < 0.8) {
            recommendations.push('✅ Good confirmation chances - likely to get confirmed');
            recommendations.push('📱 Enable push notifications for status updates');
            recommendations.push('🎯 Consider upgrading to higher class if available');
        } else {
            recommendations.push('🎉 Excellent confirmation probability!');
            recommendations.push('💺 Your preferred berth/seat likely to be available');
            recommendations.push('📈 This route has high historical success rate');
        }
        
        return recommendations;
    }
    
    async findAlternativeRoutes(data) {
        // Mock alternative route finding (would integrate with railway APIs)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const alternatives = [
            {
                trainNumber: '12951',
                trainName: 'Mumbai Rajdhani Express',
                route: 'Via Bhopal Junction',
                probability: 87,
                additionalTime: '+2h 30m',
                class: 'AC 2-Tier',
                fare: '₹2,850',
                availability: 'Available',
                recommendation: 'Best alternative with high confirmation rate'
            },
            {
                trainNumber: '12137',
                trainName: 'Punjab Mail',
                route: 'Direct Route',
                probability: 73,
                additionalTime: 'Same timing',
                class: 'AC 3-Tier',
                fare: '₹1,950',
                availability: 'WL/8',
                recommendation: 'Good option with reasonable wait list'
            },
            {
                trainNumber: '12615',
                trainName: 'Grand Trunk Express',
                route: 'Split Journey (2 trains)',
                probability: 94,
                additionalTime: '+1h 15m',
                class: 'AC 2-Tier + AC 3-Tier',
                fare: '₹2,450',
                availability: 'Confirmed',
                recommendation: 'Highest confirmation rate - recommended for urgent travel'
            }
        ];
        
        return alternatives;
    }
    
    estimateConfirmationTime(probability) {
        if (probability > 0.8) return 'Within 24 hours';
        if (probability > 0.6) return '1-3 days before departure';
        if (probability > 0.4) return '3-7 days before departure';
        if (probability > 0.2) return 'Unlikely to confirm';
        return 'Very low chances';
    }
    
    assessRisk(probability) {
        if (probability > 0.8) return { level: 'low', message: 'Very safe to proceed with this booking' };
        if (probability > 0.6) return { level: 'medium', message: 'Good chances, but keep backup ready' };
        if (probability > 0.4) return { level: 'high', message: 'Risky - strongly consider alternatives' };
        return { level: 'very-high', message: 'Not recommended - find alternative routes' };
    }
    
    async setupTatkalAlert(data) {
        const { trainNumber, journeyDate, alertTime } = data;
        
        // Calculate when to trigger the alert (5 minutes before Tatkal opens)
        const tatkalTime = new Date(journeyDate);
        tatkalTime.setDate(tatkalTime.getDate() - 1); // Day before journey
        tatkalTime.setHours(9, 55, 0, 0); // 9:55 AM (5 min before 10 AM)
        
        const alarmName = `tatkal_${trainNumber}_${journeyDate}`;
        
        // Create alarm
        chrome.alarms.create(alarmName, {
            when: tatkalTime.getTime()
        });
        
        // Store alarm data
        await chrome.storage.local.set({
            [alarmName]: {
                type: 'tatkal_alert',
                trainNumber,
                journeyDate,
                alertTime: tatkalTime.toISOString(),
                created: Date.now()
            }
        });
        
        this.alarms.set(alarmName, data);
    }
    
    async handleAlarm(alarm) {
        const alarmData = await chrome.storage.local.get(alarm.name);
        const data = alarmData[alarm.name];
        
        if (!data) return;
        
        switch (data.type) {
            case 'tatkal_alert':
                await this.handleTatkalAlert(data);
                break;
            case 'pnr_check':
                await this.handlePNRCheckAlert(data);
                break;
            case 'booking_reminder':
                await this.handleBookingReminder(data);
                break;
        }
    }
    
    async handleTatkalAlert(data) {
        const notificationId = `tatkal_${Date.now()}`;
        
        await chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '🚂 TravelWhiz Tatkal Alert',
            message: `Tatkal booking opens in 5 minutes for train ${data.trainNumber}! Click to prepare auto-booking.`,
            priority: 2,
            requireInteraction: true
        });
        
        // Store notification data for click handling
        this.notifications.set(notificationId, {
            type: 'tatkal_alert',
            action: 'open_booking_page',
            data: data
        });
        
        // Auto-open IRCTC if user has enabled this setting
        const settings = await chrome.storage.sync.get(['autoOpenTatkal']);
        if (settings.autoOpenTatkal) {
            chrome.tabs.create({
                url: 'https://www.irctc.co.in/nget/train-search'
            });
        }
    }
    
    async handleNotificationClick(notificationId) {
        const notificationData = this.notifications.get(notificationId);
        
        if (!notificationData) return;
        
        switch (notificationData.type) {
            case 'tatkal_alert':
                chrome.tabs.create({
                    url: 'https://www.irctc.co.in/nget/train-search'
                });
                break;
            case 'pnr_update':
                chrome.tabs.create({
                    url: `https://www.irctc.co.in/nget/train-search?pnr=${notificationData.data.pnr}`
                });
                break;
        }
        
        // Clean up notification data
        this.notifications.delete(notificationId);
        chrome.notifications.clear(notificationId);
    }
    
    async trackBookingAction(data, tab) {
        // Track user booking actions for analytics and affiliate revenue
        const trackingData = {
            action: data.action,
            site: this.extractSiteName(tab.url),
            timestamp: Date.now(),
            tabId: tab.id,
            url: tab.url,
            userAgent: navigator.userAgent
        };
        
        // Add affiliate tracking if applicable
        if (this.isBookingSite(tab.url) && data.action === 'booking_initiated') {
            await this.addAffiliateTracking(tab);
        }
        
        // Store tracking data
        await this.storeTrackingData(trackingData);
    }
    
    extractSiteName(url) {
        if (url.includes('irctc.co.in')) return 'irctc';
        if (url.includes('ixigo.com')) return 'ixigo';
        if (url.includes('makemytrip.com')) return 'makemytrip';
        if (url.includes('goibibo.com')) return 'goibibo';
        return 'other';
    }
    
    isBookingSite(url) {
        const bookingSites = ['irctc.co.in', 'ixigo.com', 'makemytrip.com', 'goibibo.com'];
        return bookingSites.some(site => url.includes(site));
    }
    
    async addAffiliateTracking(tab) {
        // Add affiliate parameters to booking URLs
        const affiliateId = await this.getAffiliateId();
        
        if (affiliateId) {
            chrome.tabs.executeScript(tab.id, {
                code: `
                    // Add affiliate tracking to booking links
                    document.querySelectorAll('a[href*="book"], button[onclick*="book"]').forEach(element => {
                        if (element.href) {
                            const url = new URL(element.href);
                            url.searchParams.set('affiliate_id', '${affiliateId}');
                            element.href = url.toString();
                        }
                    });
                `
            });
        }
    }
    
    async getAffiliateId() {
        const settings = await chrome.storage.sync.get(['affiliateId']);
        return settings.affiliateId || 'travelwhiz_default';
    }
    
    async storePrediction(prediction) {
        const predictions = await chrome.storage.local.get(['predictions']);
        const existingPredictions = predictions.predictions || [];
        
        existingPredictions.push(prediction);
        
        // Keep only last 50 predictions
        if (existingPredictions.length > 50) {
            existingPredictions.shift();
        }
        
        await chrome.storage.local.set({ predictions: existingPredictions });
    }
    
    async storeTrackingData(data) {
        const tracking = await chrome.storage.local.get(['trackingData']);
        const existingData = tracking.trackingData || [];
        
        existingData.push(data);
        
        // Keep only last 100 tracking entries
        if (existingData.length > 100) {
            existingData.shift();
        }
        
        await chrome.storage.local.set({ trackingData: existingData });
    }
    
    async logUserActivity(data) {
        const activity = {
            ...data,
            timestamp: Date.now(),
            sessionId: await this.getSessionId()
        };
        
        const activities = await chrome.storage.local.get(['userActivities']);
        const existingActivities = activities.userActivities || [];
        
        existingActivities.push(activity);
        
        // Keep only last 200 activities
        if (existingActivities.length > 200) {
            existingActivities.shift();
        }
        
        await chrome.storage.local.set({ userActivities: existingActivities });
    }
    
    async getSessionId() {
        let session = await chrome.storage.session.get(['sessionId']);
        
        if (!session.sessionId) {
            session.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            await chrome.storage.session.set({ sessionId: session.sessionId });
        }
        
        return session.sessionId;
    }
    
    async getUserStats() {
        const [predictions, activities, tracking] = await Promise.all([
            chrome.storage.local.get(['predictions']),
            chrome.storage.local.get(['userActivities']),
            chrome.storage.local.get(['trackingData'])
        ]);
        
        const today = new Date().toDateString();
        const thisWeek = this.getWeekStart();
        
        const stats = {
            predictionsToday: this.countTodayItems(predictions.predictions || [], today),
            predictionsThisWeek: this.countWeekItems(predictions.predictions || [], thisWeek),
            activitiesToday: this.countTodayItems(activities.userActivities || [], today),
            successRate: this.calculateSuccessRate(predictions.predictions || []),
            timeSaved: this.calculateTimeSaved(activities.userActivities || []),
            bookingsTracked: (tracking.trackingData || []).filter(t => t.action === 'booking_completed').length
        };
        
        return stats;
    }
    
    countTodayItems(items, today) {
        return items.filter(item => 
            new Date(item.timestamp).toDateString() === today
        ).length;
    }
    
    countWeekItems(items, weekStart) {
        return items.filter(item => 
            new Date(item.timestamp) >= weekStart
        ).length;
    }
    
    getWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    }
    
    calculateSuccessRate(predictions) {
        if (predictions.length === 0) return 95; // Default high rate
        
        const accuratePredictions = predictions.filter(p => p.probability > 70).length;
        return Math.round((accuratePredictions / predictions.length) * 100);
    }
    
    calculateTimeSaved(activities) {
        // Estimate time saved based on activities
        const timePerActivity = {
            'pnr_prediction': 5, // 5 minutes saved per prediction
            'autofill': 3,      // 3 minutes saved per autofill
            'alternative_search': 10, // 10 minutes saved per alternative search
            'tatkal_prep': 15   // 15 minutes saved per tatkal preparation
        };
        
        let totalMinutes = 0;
        activities.forEach(activity => {
            totalMinutes += timePerActivity[activity.type] || 2;
        });
        
        return (totalMinutes / 60).toFixed(1); // Return hours
    }
    
    setupAlarms() {
        // Set up recurring alarms for maintenance tasks
        chrome.alarms.create('dailyMaintenance', {
            delayInMinutes: 1,
            periodInMinutes: 24 * 60 // Daily
        });
        
        chrome.alarms.create('weeklyCleanup', {
            delayInMinutes: 60,
            periodInMinutes: 7 * 24 * 60 // Weekly
        });
    }
    
    async initializeStorage() {
        // Initialize default settings if not present
        const defaultSettings = {
            autoOpenTatkal: false,
            notificationsEnabled: true,
            voiceEnabled: true,
            affiliateTracking: true,
            dataRetentionDays: 30
        };
        
        const currentSettings = await chrome.storage.sync.get(Object.keys(defaultSettings));
        
        // Set defaults for missing settings
        const newSettings = {};
        Object.keys(defaultSettings).forEach(key => {
            if (!(key in currentSettings)) {
                newSettings[key] = defaultSettings[key];
            }
        });
        
        if (Object.keys(newSettings).length > 0) {
            await chrome.storage.sync.set(newSettings);
        }
    }
    
    onFirstInstall() {
        // Welcome new users
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
        
        // Set up initial data
        chrome.storage.sync.set({
            installDate: Date.now(),
            version: chrome.runtime.getManifest().version
        });
    }
    
    onUpdate(previousVersion) {
        // Handle extension updates
        console.log(`TravelWhiz updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`);
        
        // Perform any necessary data migrations
        this.performDataMigration(previousVersion);
    }
    
    async performDataMigration(previousVersion) {
        // Handle data structure changes between versions
        const currentVersion = chrome.runtime.getManifest().version;
        
        if (this.compareVersions(previousVersion, '1.0.0') < 0) {
            // Migration for versions before 1.0.0
            console.log('Performing migration for pre-1.0.0 data');
        }
    }
    
    compareVersions(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aPart = aParts[i] || 0;
            const bPart = bParts[i] || 0;
            
            if (aPart < bPart) return -1;
            if (aPart > bPart) return 1;
        }
        
        return 0;
    }
    
    async handleTabUpdate(tab) {
        // Handle affiliate tracking when users visit booking sites
        if (this.isBookingSite(tab.url)) {
            await this.trackBookingAction({
                action: 'site_visit',
                site: this.extractSiteName(tab.url)
            }, tab);
        }
    }
}

// Initialize the background service
const travelWhizBackground = new TravelWhizBackgroundService();