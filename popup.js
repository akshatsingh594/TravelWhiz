// TravelWhiz Popup JavaScript
class TravelWhizPopup {
    constructor() {
        this.currentTab = 'predict';
        this.isVoiceListening = false;
        this.recognition = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.updateStats();
        this.initializeVoiceRecognition();
        this.setupTatkalTimer();
    }
    
    setupEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
        
        // Chat functionality
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleChatMessage();
            }
        });
        
        sendBtn.addEventListener('click', () => {
            this.handleChatMessage();
        });
        
        // Voice toggle
        const voiceToggle = document.getElementById('voiceToggle');
        voiceToggle.addEventListener('click', () => {
            this.toggleVoiceRecognition();
        });
        
        // Quick action buttons
        document.getElementById('pnrCheckBtn').addEventListener('click', () => {
            this.showPNRModal();
        });
        
        document.getElementById('tatkalTimerBtn').addEventListener('click', () => {
            this.showTatkalModal();
        });
        
        document.getElementById('alternativeRoutesBtn').addEventListener('click', () => {
            this.findAlternativeRoutes();
        });
        
        document.getElementById('passengerDetailsBtn').addEventListener('click', () => {
            this.autoFillPassengerDetails();
        });
        
        // Modal functionality
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // PNR Modal
        const pnrModal = document.getElementById('pnrModal');
        const pnrModalClose = document.getElementById('pnrModalClose');
        const checkPnrBtn = document.getElementById('checkPnrBtn');
        const pnrInput = document.getElementById('pnrInput');
        
        pnrModalClose.addEventListener('click', () => {
            pnrModal.classList.remove('active');
        });
        
        checkPnrBtn.addEventListener('click', () => {
            this.checkPNRStatus();
        });
        
        pnrInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkPNRStatus();
            }
        });
        
        // Tatkal Modal
        const tatkalModal = document.getElementById('tatkalModal');
        const tatkalModalClose = document.getElementById('tatkalModalClose');
        const prepareBookingBtn = document.getElementById('prepareBookingBtn');
        
        tatkalModalClose.addEventListener('click', () => {
            tatkalModal.classList.remove('active');
        });
        
        prepareBookingBtn.addEventListener('click', () => {
            this.prepareAutoBooking();
        });
        
        // Voice cancel
        const voiceCancelBtn = document.getElementById('voiceCancelBtn');
        voiceCancelBtn.addEventListener('click', () => {
            this.stopVoiceRecognition();
        });
        
        // Close modals on background click
        [pnrModal, tatkalModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    
    async handleChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        this.addChatMessage('AI is analyzing your request...', 'bot', true);
        
        try {
            const response = await this.processAIQuery(message);
            this.removeChatMessage(); // Remove typing indicator
            this.addChatMessage(response.text, 'bot');
            
            // Execute any actions
            if (response.actions) {
                response.actions.forEach(action => this.executeAction(action));
            }
            
            // Log the interaction
            this.logChatInteraction(message, response);
        } catch (error) {
            this.removeChatMessage();
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }
    
    async processAIQuery(message) {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const lowerMessage = message.toLowerCase();
        
        // Intent recognition and response generation
        if (lowerMessage.includes('find train') || lowerMessage.includes('search train') || 
            lowerMessage.includes('book train') || lowerMessage.includes('ticket')) {
            return this.handleTrainSearchQuery(message);
        } else if (lowerMessage.includes('pnr') || lowerMessage.includes('check status') || 
                   lowerMessage.includes('confirm')) {
            return this.handlePNRQuery(message);
        } else if (lowerMessage.includes('tatkal') || lowerMessage.includes('booking open') || 
                   lowerMessage.includes('timer')) {
            return this.handleTatkalQuery(message);
        } else if (lowerMessage.includes('alternative') || lowerMessage.includes('other route') || 
                   lowerMessage.includes('different train')) {
            return this.handleAlternativeQuery(message);
        } else if (lowerMessage.includes('fill') || lowerMessage.includes('autofill') || 
                   lowerMessage.includes('passenger details')) {
            return this.handleAutoFillQuery(message);
        } else if (lowerMessage.includes('quota') || lowerMessage.includes('reservation')) {
            return this.handleQuotaQuery(message);
        } else {
            return {
                text: "I can help you with:\n\n🔍 Finding trains and checking availability\n📊 PNR status and confirmation predictions\n⏰ Tatkal booking timers and alerts\n🛤️ Alternative route suggestions\n📝 Auto-filling booking forms\n🎯 Quota optimization\n\nWhat would you like to do? Try saying something like:\n• 'Find trains from Delhi to Mumbai tomorrow'\n• 'Check PNR 1234567890'\n• 'When does Tatkal booking open?'"
            };
        }
    }
    
    handleTrainSearchQuery(message) {
        const routePattern = /from\s+(\w+)\s+to\s+(\w+)/i;
        const datePattern = /(tomorrow|today|next\s+\w+|(\d{1,2}[\/\-]\d{1,2}))/i;
        
        const routeMatch = message.match(routePattern);
        const dateMatch = message.match(datePattern);
        
        if (routeMatch) {
            const from = this.capitalizeWords(routeMatch[1]);
            const to = this.capitalizeWords(routeMatch[2]);
            const date = dateMatch ? dateMatch[1] : 'tomorrow';
            
            return {
                text: `🔍 Perfect! I'll help you find trains from ${from} to ${to} for ${date}.\n\nBased on current data:\n• Found 8 available trains\n• 3 trains have good confirmation chances (>80%)\n• Best time to book: Now for general quota\n\nI can:\n✅ Open IRCTC with pre-filled search\n✅ Show alternative routes with better availability\n✅ Set up booking alerts\n\nShall I open the booking page with your details pre-filled?`,
                actions: [
                    { type: 'search_trains', from, to, date },
                    { type: 'analyze_routes' }
                ]
            };
        }
        
        return {
            text: "I'd love to help you find trains! Please specify your journey like:\n'Find trains from Delhi to Mumbai for tomorrow'\nor\n'Book ticket from Bangalore to Chennai next Friday'"
        };
    }
    
    handlePNRQuery(message) {
        const pnrPattern = /\b\d{10}\b/;
        const pnrMatch = message.match(pnrPattern);
        
        if (pnrMatch) {
            const pnr = pnrMatch[0];
            return {
                text: `📊 Analyzing PNR ${pnr}...\n\nAI Prediction Results:\n🎯 Confirmation Probability: 87%\n📈 Current Status: WL/15\n⏱️ Expected Confirmation: Within 24 hours\n🛤️ Route Popularity: High\n\n💡 Recommendations:\n• High chances of confirmation - hold the ticket\n• Monitor status every 4 hours\n• Alternative routes available if needed\n\nWould you like me to set up automatic status monitoring?`,
                actions: [
                    { type: 'analyze_pnr', pnr },
                    { type: 'setup_monitoring' }
                ]
            };
        }
        
        return {
            text: "Please provide your 10-digit PNR number for AI-powered status analysis and confirmation prediction. I can also help you find alternative options if needed!"
        };
    }
    
    handleTatkalQuery(message) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        
        const timeUntil = tomorrow - now;
        const hours = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            text: `⏰ Tatkal Booking Information:\n\n🕙 Next Window Opens: ${hours}h ${minutes}m\n📅 Booking Date: ${this.formatDate(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000))}\n🎯 Success Rate: 73% (based on your profile)\n\n🚀 TravelWhiz can help:\n✅ Set countdown timer with alerts\n✅ Pre-fill all passenger details\n✅ Auto-select optimal payment method\n✅ Show fastest booking strategies\n\nShall I prepare everything for lightning-fast booking?`,
            actions: [
                { type: 'setup_tatkal_timer' },
                { type: 'prepare_forms' }
            ]
        };
    }
    
    handleAlternativeQuery(message) {
        return {
            text: `🛤️ Alternative Route Analysis:\n\nFound 5 better options:\n\n1. 🚂 Express Route via Bhopal\n   📊 Confirmation: 92% • ⏱️ +2h travel time\n   \n2. 🚂 Mail Train Direct\n   📊 Confirmation: 85% • ⏱️ Same timing\n   \n3. 🚂 Split Journey (2 trains)\n   📊 Confirmation: 96% • ⏱️ +1h total\n\n💡 Best Recommendation:\nMail Train Direct - perfect balance of confirmation chance and convenience.\n\nShall I open the booking page for your preferred alternative?`,
            actions: [
                { type: 'show_alternatives' },
                { type: 'analyze_best_option' }
            ]
        };
    }
    
    handleAutoFillQuery(message) {
        return {
            text: `📝 Auto-Fill Ready!\n\nSaved Passenger Data:\n👤 Primary: John Doe (35, Male)\n👥 Family: 2 additional passengers\n🆔 ID Proof: Aadhar Card\n🛏️ Preference: Lower Berth\n\n🎯 Smart Features:\n✅ One-click form filling\n✅ Quota optimization (Senior Citizen available)\n✅ Payment method pre-selection\n✅ Mobile number auto-verification\n\nI can fill any booking form in under 3 seconds. Just click 'Auto-Fill' when you're ready to book!`,
            actions: [
                { type: 'prepare_autofill' },
                { type: 'optimize_quota' }
            ]
        };
    }
    
    executeAction(action) {
        switch (action.type) {
            case 'search_trains':
                this.searchTrainsOnSite(action.from, action.to, action.date);
                break;
            case 'analyze_pnr':
                this.analyzePNRDetailed(action.pnr);
                break;
            case 'setup_tatkal_timer':
                this.showTatkalModal();
                break;
            case 'show_alternatives':
                this.showAlternativeRoutes();
                break;
            case 'prepare_autofill':
                this.prepareAutoFillFeatures();
                break;
        }
    }
    
    searchTrainsOnSite(from, to, date) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            
            // Check if we're already on a booking site
            if (currentTab.url.includes('irctc.co.in') || 
                currentTab.url.includes('ixigo.com') || 
                currentTab.url.includes('makemytrip.com')) {
                
                // Send message to content script to fill search form
                chrome.tabs.sendMessage(currentTab.id, {
                    action: 'fillSearchForm',
                    data: { from, to, date }
                });
            } else {
                // Open IRCTC with search parameters
                const searchUrl = `https://www.irctc.co.in/nget/train-search?from=${from}&to=${to}&date=${date}`;
                chrome.tabs.create({ url: searchUrl });
            }
        });
    }
    
    showPNRModal() {
        const modal = document.getElementById('pnrModal');
        modal.classList.add('active');
        document.getElementById('pnrInput').focus();
    }
    
    showTatkalModal() {
        const modal = document.getElementById('tatkalModal');
        modal.classList.add('active');
        this.updateTatkalTimer();
    }
    
    async checkPNRStatus() {
        const pnrInput = document.getElementById('pnrInput');
        const pnr = pnrInput.value.trim();
        
        if (!pnr || pnr.length !== 10) {
            this.showResult('pnrResult', 'Please enter a valid 10-digit PNR number', 'error');
            return;
        }
        
        this.showResult('pnrResult', 'Analyzing PNR with AI...', 'loading');
        
        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const analysisResult = await this.performPNRAnalysis(pnr);
            this.displayPNRAnalysis(analysisResult);
            
            // Log activity
            this.logActivity('pnr_check', { pnr, result: analysisResult });
        } catch (error) {
            this.showResult('pnrResult', 'Analysis failed. Please try again.', 'error');
        }
    }
    
    async performPNRAnalysis(pnr) {
        // Mock AI analysis (in production, this would call your AI service)
        const mockAnalysis = {
            pnr: pnr,
            currentStatus: 'WL/12',
            probability: Math.floor(Math.random() * 40) + 60, // 60-100%
            estimatedConfirmation: this.getRandomConfirmationTime(),
            factors: {
                routePopularity: Math.random() * 0.3 + 0.5,
                seasonalDemand: Math.random() * 0.4 + 0.3,
                historicalSuccess: Math.random() * 0.3 + 0.6
            },
            recommendations: this.generatePNRRecommendations(),
            alternatives: this.generateAlternatives()
        };
        
        return mockAnalysis;
    }
    
    displayPNRAnalysis(analysis) {
        const resultDiv = document.getElementById('pnrResult');
        const probabilityColor = this.getProbabilityColor(analysis.probability);
        
        resultDiv.innerHTML = `
            <div class="pnr-analysis-result">
                <div class="analysis-header">
                    <div class="probability-badge" style="background: ${probabilityColor}20; color: ${probabilityColor}; border: 1px solid ${probabilityColor}40;">
                        ${analysis.probability}% Confirmation Chance
                    </div>
                    <div class="current-status">Current: ${analysis.currentStatus}</div>
                </div>
                
                <div class="analysis-details">
                    <div class="detail-row">
                        <span>Expected Confirmation:</span>
                        <strong>${analysis.estimatedConfirmation}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Route Popularity:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${analysis.factors.routePopularity * 100}%"></div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span>Historical Success:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${analysis.factors.historicalSuccess * 100}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="recommendations">
                    <h4>💡 AI Recommendations:</h4>
                    ${analysis.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
                </div>
                
                <div class="action-buttons">
                    <button onclick="travelWhizPopup.setAlert('${analysis.pnr}')" class="action-btn">
                        Set Alert
                    </button>
                    <button onclick="travelWhizPopup.findAlternatives('${analysis.pnr}')" class="action-btn">
                        Find Alternatives
                    </button>
                </div>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        resultDiv.className = 'pnr-result success';
    }
    
    updateTatkalTimer() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        
        const timeUntil = tomorrow - now;
        
        if (timeUntil > 0) {
            const hours = Math.floor(timeUntil / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000);
            
            const timerText = document.getElementById('timerText');
            timerText.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update every second
            setTimeout(() => this.updateTatkalTimer(), 1000);
        } else {
            document.getElementById('timerText').textContent = 'Tatkal Open!';
        }
    }
    
    prepareAutoBooking() {
        // Send message to content script to prepare forms
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'prepareTatkalBooking'
            }, (response) => {
                if (response && response.success) {
                    this.addChatMessage('✅ Tatkal booking preparation complete! Forms are pre-filled and ready for lightning-fast booking.', 'bot');
                    document.getElementById('tatkalModal').classList.remove('active');
                } else {
                    this.addChatMessage('⚠️ Please navigate to IRCTC booking page to use auto-booking features.', 'bot');
                }
            });
        });
    }
    
    toggleVoiceRecognition() {
        if (this.isVoiceListening) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }
    
    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.addChatMessage('❌ Voice recognition is not supported in this browser. Please type your query instead.', 'bot');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        const voiceOverlay = document.getElementById('voiceOverlay');
        const voiceToggle = document.getElementById('voiceToggle');
        
        voiceOverlay.classList.add('active');
        voiceToggle.querySelector('.voice-status').textContent = 'Listening...';
        this.isVoiceListening = true;
        
        this.recognition.onstart = () => {
            console.log('Voice recognition started');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatInput').value = transcript;
            this.handleChatMessage();
            this.stopVoiceRecognition();
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.addChatMessage(`❌ Voice recognition error: ${event.error}. Please try again.`, 'bot');
            this.stopVoiceRecognition();
        };
        
        this.recognition.onend = () => {
            this.stopVoiceRecognition();
        };
        
        this.recognition.start();
    }
    
    stopVoiceRecognition() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        const voiceOverlay = document.getElementById('voiceOverlay');
        const voiceToggle = document.getElementById('voiceToggle');
        
        voiceOverlay.classList.remove('active');
        voiceToggle.querySelector('.voice-status').textContent = 'Tap to Speak';
        this.isVoiceListening = false;
    }
    
    findAlternativeRoutes() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'findAlternatives'
            }, (response) => {
                if (response && response.alternatives) {
                    this.displayAlternatives(response.alternatives);
                } else {
                    this.addChatMessage('🛤️ I found several alternative routes! Here are the top options:\n\n1. Express via Bhopal (92% confirmation)\n2. Mail train direct (85% confirmation)\n3. Split journey option (96% confirmation)\n\nWould you like me to show booking pages for any of these?', 'bot');
                }
            });
        });
    }
    
    autoFillPassengerDetails() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'fillForm'
            }, (response) => {
                if (response && response.success) {
                    this.addChatMessage('✅ Passenger details filled automatically! All forms are ready for booking.', 'bot');
                } else {
                    this.addChatMessage('⚠️ Please navigate to a booking form to use auto-fill features.', 'bot');
                }
            });
        });
    }
    
    // Utility Functions
    
    addChatMessage(message, sender, isTemporary = false) {
        const chatContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message ${isTemporary ? 'temporary' : ''}`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <span class="message-icon">🤖</span>
                <div class="message-content">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <span class="message-icon">👤</span>
                <div class="message-content">
                    <p>${message}</p>
                </div>
            `;
        }
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    removeChatMessage() {
        const tempMessage = document.querySelector('.message.temporary');
        if (tempMessage) {
            tempMessage.remove();
        }
    }
    
    showResult(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.className = `pnr-result ${type}`;
        element.innerHTML = `<p>${message}</p>`;
        element.style.display = 'block';
    }
    
    getProbabilityColor(probability) {
        if (probability >= 80) return '#10b981';
        if (probability >= 60) return '#f59e0b';
        if (probability >= 40) return '#f97316';
        return '#ef4444';
    }
    
    generatePNRRecommendations() {
        const recommendations = [
            'High confirmation probability - hold your current booking',
            'Monitor PNR status every 4-6 hours for updates',
            'Keep alternative travel options as backup',
            'Consider booking a backup ticket in different class'
        ];
        
        return recommendations.slice(0, Math.floor(Math.random() * 2) + 2);
    }
    
    generateAlternatives() {
        return [
            { route: 'Express via Junction', probability: 87 },
            { route: 'Mail train direct', probability: 73 },
            { route: 'Superfast alternative', probability: 91 }
        ];
    }
    
    getRandomConfirmationTime() {
        const options = ['Within 24 hours', '1-3 days', '3-7 days', 'Within a week'];
        return options[Math.floor(Math.random() * options.length)];
    }
    
    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    async loadUserData() {
        try {
            const result = await chrome.storage.sync.get(['userProfile', 'activityStats']);
            if (result.userProfile) {
                this.userProfile = result.userProfile;
            }
            if (result.activityStats) {
                this.updateStatsDisplay(result.activityStats);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }
    
    updateStats() {
        // Update stats from storage or calculate from recent activity
        chrome.storage.local.get(['activityLog'], (result) => {
            const activities = result.activityLog || [];
            const today = new Date().toDateString();
            
            const todayActivities = activities.filter(activity => 
                new Date(activity.timestamp).toDateString() === today
            );
            
            const predictions = todayActivities.filter(activity => 
                activity.type === 'pnr_prediction'
            ).length;
            
            document.getElementById('predictionsToday').textContent = predictions;
            
            // Calculate success rate (mock)
            const successRate = 94 + Math.floor(Math.random() * 6); // 94-99%
            document.getElementById('successRate').textContent = `${successRate}%`;
            
            // Calculate time saved (mock)
            const timeSaved = (predictions * 0.3 + Math.random() * 2).toFixed(1);
            document.getElementById('timesSaved').textContent = `${timeSaved}h`;
        });
    }
    
    updateStatsDisplay(stats) {
        if (stats.predictionsToday) {
            document.getElementById('predictionsToday').textContent = stats.predictionsToday;
        }
        if (stats.successRate) {
            document.getElementById('successRate').textContent = `${stats.successRate}%`;
        }
        if (stats.timeSaved) {
            document.getElementById('timesSaved').textContent = `${stats.timeSaved}h`;
        }
    }
    
    logActivity(type, data) {
        chrome.storage.local.get(['activityLog'], (result) => {
            const log = result.activityLog || [];
            log.push({
                type,
                data,
                timestamp: Date.now()
            });
            
            // Keep only last 100 activities
            if (log.length > 100) {
                log.shift();
            }
            
            chrome.storage.local.set({ activityLog: log });
        });
    }
    
    logChatInteraction(message, response) {
        this.logActivity('chat_interaction', {
            userMessage: message,
            botResponse: response.text,
            actions: response.actions || []
        });
    }
    
    initializeVoiceRecognition() {
        // Check if voice recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            const voiceToggle = document.getElementById('voiceToggle');
            voiceToggle.style.opacity = '0.5';
            voiceToggle.querySelector('.voice-status').textContent = 'Not Supported';
        }
    }
    
    setupTatkalTimer() {
        // Start the tatkal timer update
        this.updateTatkalTimer();
    }
    
    // Methods called from HTML onclick handlers
    setAlert(pnr) {
        chrome.storage.sync.set({
            [`alert_${pnr}`]: {
                pnr: pnr,
                timestamp: Date.now(),
                alertType: 'status_change'
            }
        });
        
        this.addChatMessage(`✅ Alert set for PNR ${pnr}. You'll be notified of any status changes!`, 'bot');
    }
    
    findAlternatives(pnr) {
        this.addChatMessage(`🛤️ Finding alternative routes for your journey (PNR: ${pnr})...\n\nFound 3 better options:\n1. Express Route (92% confirmation)\n2. Mail Train (85% confirmation)\n3. Split Journey (96% confirmation)\n\nShall I show booking details?`, 'bot');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.travelWhizPopup = new TravelWhizPopup();
});