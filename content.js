// TravelWhiz Content Script - Smart Railway Booking Assistant
class TravelWhizAssistant {
    constructor() {
        this.currentSite = this.detectSite();
        this.isActive = true;
        this.floatingWidget = null;
        this.currentPrediction = null;
        this.tatkalTimer = null;
        this.voiceRecognition = null;
        
        this.init();
    }
    
    detectSite() {
        const hostname = window.location.hostname.toLowerCase();
        if (hostname.includes('irctc.co.in')) return 'irctc';
        if (hostname.includes('ixigo.com')) return 'ixigo';
        if (hostname.includes('makemytrip.com')) return 'makemytrip';
        if (hostname.includes('goibibo.com')) return 'goibibo';
        return 'other';
    }
    
    init() {
        this.injectStyles();
        this.createFloatingWidget();
        this.setupEventListeners();
        this.monitorPageChanges();
        this.setupVoiceRecognition();
        
        // Site-specific initialization
        if (this.currentSite === 'irctc') {
            this.initIRCTC();
        } else if (this.currentSite === 'ixigo') {
            this.initIxigo();
        }
        
        console.log('🚂 TravelWhiz Assistant activated on', this.currentSite);
    }
    
    injectStyles() {
        if (document.getElementById('travelwhiz-styles')) return;
        
        const link = document.createElement('link');
        link.id = 'travelwhiz-styles';
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('content.css');
        document.head.appendChild(link);
    }
    
    createFloatingWidget() {
        this.floatingWidget = document.createElement('div');
        this.floatingWidget.id = 'travelwhiz-widget';
        this.floatingWidget.className = 'travelwhiz-floating-widget';
        this.floatingWidget.innerHTML = `
            <div class="widget-button" id="widgetButton">
                <div class="widget-icon">🚂</div>
                <div class="widget-pulse"></div>
            </div>
            <div class="widget-panel" id="widgetPanel">
                <div class="panel-header">
                    <div class="panel-title">
                        <span class="panel-icon">🚂</span>
                        TravelWhiz
                    </div>
                    <button class="panel-close" id="panelClose">×</button>
                </div>
                <div class="panel-content">
                    <div class="feature-tabs">
                        <div class="tab active" data-tab="predict">📊 Predict</div>
                        <div class="tab" data-tab="chat">💬 Chat</div>
                        <div class="tab" data-tab="autofill">📝 Auto</div>
                    </div>
                    
                    <div class="tab-content active" id="predict-tab">
                        <div class="prediction-container">
                            <div class="prediction-header">PNR Confirmation Predictor</div>
                            <input type="text" id="pnrInputWidget" placeholder="Enter PNR or detect from page" maxlength="10" />
                            <button id="predictBtn" class="predict-btn">Predict Confirmation</button>
                            <div class="prediction-result" id="predictionResult"></div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="chat-tab">
                        <div class="chat-container">
                            <div class="chat-messages-widget" id="chatMessagesWidget">
                                <div class="bot-message-widget">
                                    <span>🤖</span>
                                    <p>Ask me anything about train bookings!</p>
                                </div>
                            </div>
                            <div class="chat-input-widget">
                                <input type="text" id="chatInputWidget" placeholder="Type your travel query..." />
                                <button id="voiceInputBtn" class="voice-btn">🎤</button>
                                <button id="sendChatBtn" class="send-btn">Send</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="autofill-tab">
                        <div class="autofill-container">
                            <div class="autofill-header">Smart Auto-Fill</div>
                            <div class="autofill-options">
                                <button id="fillPassengerBtn" class="autofill-btn">
                                    <span>👥</span>
                                    Fill Passenger Details
                                </button>
                                <button id="selectQuotaBtn" class="autofill-btn">
                                    <span>🎯</span>
                                    Optimize Quota Selection
                                </button>
                                <button id="tatkalPrepBtn" class="autofill-btn">
                                    <span>⏰</span>
                                    Prepare Tatkal Booking
                                </button>
                            </div>
                            <div class="tatkal-timer-widget" id="tatkalTimerWidget">
                                <div class="timer-display-widget">
                                    <div class="timer-value" id="timerValueWidget">--:--:--</div>
                                    <div class="timer-label-widget">Until Tatkal Opens</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.floatingWidget);
        this.setupWidgetEvents();
    }
    
    setupWidgetEvents() {
        const widgetButton = document.getElementById('widgetButton');
        const widgetPanel = document.getElementById('widgetPanel');
        const panelClose = document.getElementById('panelClose');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Toggle panel
        widgetButton.addEventListener('click', () => {
            widgetPanel.classList.toggle('active');
        });
        
        // Close panel
        panelClose.addEventListener('click', () => {
            widgetPanel.classList.remove('active');
        });
        
        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
        
        // PNR Prediction
        document.getElementById('predictBtn').addEventListener('click', () => {
            this.handlePNRPrediction();
        });
        
        // Chat functionality
        document.getElementById('sendChatBtn').addEventListener('click', () => {
            this.handleChatMessage();
        });
        
        document.getElementById('chatInputWidget').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleChatMessage();
            }
        });
        
        // Voice input
        document.getElementById('voiceInputBtn').addEventListener('click', () => {
            this.startVoiceRecognition();
        });
        
        // Auto-fill buttons
        document.getElementById('fillPassengerBtn').addEventListener('click', () => {
            this.fillPassengerDetails();
        });
        
        document.getElementById('selectQuotaBtn').addEventListener('click', () => {
            this.optimizeQuotaSelection();
        });
        
        document.getElementById('tatkalPrepBtn').addEventListener('click', () => {
            this.prepareTatkalBooking();
        });
    }
    
    // Core Features Implementation
    
    async handlePNRPrediction() {
        const pnrInput = document.getElementById('pnrInputWidget');
        const pnr = pnrInput.value.trim() || this.detectPNRFromPage();
        
        if (!pnr || pnr.length !== 10) {
            this.showPredictionResult('Please enter a valid 10-digit PNR number', 'error');
            return;
        }
        
        this.showPredictionResult('Analyzing PNR with AI...', 'loading');
        
        try {
            const prediction = await this.calculateConfirmationProbability(pnr);
            this.displayPredictionResult(prediction);
            this.logActivity('pnr_prediction', { pnr, prediction });
        } catch (error) {
            this.showPredictionResult('Failed to analyze PNR. Please try again.', 'error');
        }
    }
    
    async calculateConfirmationProbability(pnr) {
        // Simulate AI-based prediction calculation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock prediction logic (in real implementation, this would call your AI service)
        const mockFactors = {
            routePopularity: Math.random() * 0.3 + 0.4, // 0.4-0.7
            seasonalDemand: Math.random() * 0.2 + 0.3,  // 0.3-0.5
            historicalData: Math.random() * 0.3 + 0.5,  // 0.5-0.8
            waitlistPosition: Math.random() * 0.4 + 0.2 // 0.2-0.6
        };
        
        const probability = Math.min(0.95, 
            (mockFactors.routePopularity + mockFactors.seasonalDemand + 
             mockFactors.historicalData + mockFactors.waitlistPosition) / 4 + 
            (Math.random() * 0.2 - 0.1)
        );
        
        return {
            pnr,
            probability: Math.round(probability * 100),
            factors: mockFactors,
            recommendations: this.generateRecommendations(probability),
            alternativeRoutes: this.findAlternativeRoutes(),
            estimatedConfirmationTime: this.estimateConfirmationTime(probability)
        };
    }
    
    displayPredictionResult(prediction) {
        const resultContainer = document.getElementById('predictionResult');
        const probabilityColor = this.getProbabilityColor(prediction.probability);
        
        resultContainer.innerHTML = `
            <div class="prediction-card">
                <div class="probability-circle" style="border-color: ${probabilityColor}">
                    <div class="probability-value" style="color: ${probabilityColor}">
                        ${prediction.probability}%
                    </div>
                    <div class="probability-label">Confirmation Chance</div>
                </div>
                
                <div class="prediction-details">
                    <div class="detail-item">
                        <span class="detail-label">Route Popularity:</span>
                        <div class="detail-bar">
                            <div class="detail-fill" style="width: ${prediction.factors.routePopularity * 100}%"></div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Seasonal Demand:</span>
                        <div class="detail-bar">
                            <div class="detail-fill" style="width: ${prediction.factors.seasonalDemand * 100}%"></div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Historical Success:</span>
                        <div class="detail-bar">
                            <div class="detail-fill" style="width: ${prediction.factors.historicalData * 100}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="prediction-recommendations">
                    <h4>💡 Smart Recommendations:</h4>
                    <ul>
                        ${prediction.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="alternative-routes">
                    <h4>🛤️ Alternative Routes:</h4>
                    <div class="routes-list">
                        ${prediction.alternativeRoutes.map(route => `
                            <div class="route-item">
                                <span class="route-name">${route.name}</span>
                                <span class="route-probability">${route.probability}% chance</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="prediction-actions">
                    <button class="action-btn-small" onclick="travelWhizAssistant.bookAlternative('${prediction.pnr}')">
                        Book Alternative
                    </button>
                    <button class="action-btn-small" onclick="travelWhizAssistant.setAlert('${prediction.pnr}')">
                        Set Alert
                    </button>
                </div>
            </div>
        `;
        
        resultContainer.style.display = 'block';
        this.currentPrediction = prediction;
    }
    
    async handleChatMessage() {
        const chatInput = document.getElementById('chatInputWidget');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        this.addChatMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        this.addChatMessage('AI is thinking...', 'bot', true);
        
        try {
            const response = await this.processAIQuery(message);
            this.removeChatMessage(); // Remove typing indicator
            this.addChatMessage(response.text, 'bot');
            
            // Execute any actions
            if (response.actions) {
                response.actions.forEach(action => this.executeAction(action));
            }
        } catch (error) {
            this.removeChatMessage(); // Remove typing indicator
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }
    
    async processAIQuery(message) {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const lowerMessage = message.toLowerCase();
        
        // Intent recognition
        if (lowerMessage.includes('find train') || lowerMessage.includes('search train')) {
            return this.handleTrainSearch(message);
        } else if (lowerMessage.includes('pnr') || lowerMessage.includes('check status')) {
            return this.handlePNRQuery(message);
        } else if (lowerMessage.includes('tatkal') || lowerMessage.includes('booking open')) {
            return this.handleTatkalQuery(message);
        } else if (lowerMessage.includes('alternative') || lowerMessage.includes('other route')) {
            return this.handleAlternativeQuery(message);
        } else {
            return {
                text: "I can help you with:\n• Finding trains and routes\n• Checking PNR status and predictions\n• Tatkal booking timers\n• Alternative route suggestions\n• Auto-filling booking forms\n\nWhat would you like to do?"
            };
        }
    }
    
    handleTrainSearch(message) {
        // Extract route information from message
        const routePattern = /from\s+(\w+)\s+to\s+(\w+)/i;
        const datePattern = /(tomorrow|today|(\d{1,2}[\/\-]\d{1,2}))/i;
        
        const routeMatch = message.match(routePattern);
        const dateMatch = message.match(datePattern);
        
        if (routeMatch) {
            const from = routeMatch[1];
            const to = routeMatch[2];
            const date = dateMatch ? dateMatch[1] : 'tomorrow';
            
            return {
                text: `🔍 Searching for trains from ${from} to ${to} for ${date}...\n\nI found several options with good confirmation chances. Would you like me to show the booking page with auto-filled details?`,
                actions: [
                    { type: 'search_trains', from, to, date },
                    { type: 'show_suggestions' }
                ]
            };
        }
        
        return {
            text: "Please specify your journey details like: 'Find trains from Delhi to Mumbai for tomorrow'"
        };
    }
    
    handlePNRQuery(message) {
        const pnrPattern = /\b\d{10}\b/;
        const pnrMatch = message.match(pnrPattern);
        
        if (pnrMatch) {
            const pnr = pnrMatch[0];
            return {
                text: `📊 Analyzing PNR ${pnr} with AI...\n\nI'll check the confirmation probability and suggest alternatives if needed.`,
                actions: [
                    { type: 'check_pnr', pnr }
                ]
            };
        }
        
        return {
            text: "Please provide your 10-digit PNR number for status checking and confirmation prediction."
        };
    }
    
    handleTatkalQuery(message) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tatkalTime = new Date(tomorrow);
        tatkalTime.setHours(10, 0, 0, 0); // 10 AM tomorrow
        
        const timeUntil = tatkalTime - new Date();
        const hours = Math.floor(timeUntil / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            text: `⏰ Next Tatkal booking opens in ${hours}h ${minutes}m\n\nI can:\n• Set up countdown timer\n• Prepare auto-fill forms\n• Alert you 5 minutes before opening\n• Show fastest booking strategies`,
            actions: [
                { type: 'setup_tatkal_timer' },
                { type: 'prepare_autofill' }
            ]
        };
    }
    
    executeAction(action) {
        switch (action.type) {
            case 'search_trains':
                this.searchTrains(action.from, action.to, action.date);
                break;
            case 'check_pnr':
                document.getElementById('pnrInputWidget').value = action.pnr;
                this.handlePNRPrediction();
                break;
            case 'setup_tatkal_timer':
                this.setupTatkalTimer();
                break;
            case 'prepare_autofill':
                this.showAutoFillPanel();
                break;
        }
    }
    
    searchTrains(from, to, date) {
        // Auto-fill search form if on booking site
        if (this.currentSite === 'irctc') {
            this.fillIRCTCSearchForm(from, to, date);
        } else if (this.currentSite === 'ixigo') {
            this.fillIxigoSearchForm(from, to, date);
        }
    }
    
    fillPassengerDetails() {
        chrome.storage.sync.get(['passengerData'], (result) => {
            const passengerData = result.passengerData;
            if (!passengerData) {
                this.showNotification('No saved passenger data found. Please add details in extension settings.', 'warning');
                return;
            }
            
            // Site-specific form filling
            if (this.currentSite === 'irctc') {
                this.fillIRCTCPassengerForm(passengerData);
            } else if (this.currentSite === 'ixigo') {
                this.fillIxigoPassengerForm(passengerData);
            }
            
            this.showNotification('Passenger details filled automatically!', 'success');
            this.logActivity('autofill_passenger', { site: this.currentSite });
        });
    }
    
    optimizeQuotaSelection() {
        chrome.storage.sync.get(['userProfile'], (result) => {
            const profile = result.userProfile || {};
            const recommendations = this.analyzeQuotaEligibility(profile);
            
            if (recommendations.length > 0) {
                this.applyQuotaRecommendations(recommendations);
                this.showNotification(`Applied ${recommendations.length} quota optimizations`, 'success');
            } else {
                this.showNotification('No quota optimizations available for your profile', 'info');
            }
        });
    }
    
    prepareTatkalBooking() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        
        const timeUntil = tomorrow - now;
        
        if (timeUntil > 0) {
            this.startTatkalCountdown(timeUntil);
            this.preloadForms();
            this.showNotification('Tatkal booking preparation started!', 'success');
        } else {
            this.showNotification('Tatkal booking is currently open!', 'info');
        }
    }
    
    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.voiceRecognition = new SpeechRecognition();
        
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.interimResults = false;
        this.voiceRecognition.lang = 'en-US';
        
        const voiceBtn = document.getElementById('voiceInputBtn');
        voiceBtn.classList.add('listening');
        voiceBtn.innerHTML = '🔴';
        
        this.voiceRecognition.onstart = () => {
            this.showNotification('Listening... Speak your travel query', 'info');
        };
        
        this.voiceRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatInputWidget').value = transcript;
            this.handleChatMessage();
        };
        
        this.voiceRecognition.onerror = (event) => {
            this.showNotification('Voice recognition error. Please try again.', 'error');
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '🎤';
        };
        
        this.voiceRecognition.onend = () => {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '🎤';
        };
        
        this.voiceRecognition.start();
    }
    
    // Site-specific implementations
    
    initIRCTC() {
        this.monitorIRCTCForms();
        this.injectIRCTCSuggestions();
        this.setupIRCTCAutoFill();
    }
    
    monitorIRCTCForms() {
        // Watch for IRCTC form changes and provide smart suggestions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.checkForIRCTCOpportunities();
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    checkForIRCTCOpportunities() {
        // Check for search results and inject suggestions
        const trainList = document.querySelector('.trains-list, .search-results');
        if (trainList && !trainList.querySelector('.travelwhiz-suggestions')) {
            this.injectTrainSuggestions(trainList);
        }
        
        // Check for booking form and offer auto-fill
        const bookingForm = document.querySelector('.booking-form, .passenger-form');
        if (bookingForm && !bookingForm.querySelector('.travelwhiz-autofill')) {
            this.injectAutoFillSuggestion(bookingForm);
        }
    }
    
    injectTrainSuggestions(container) {
        const suggestionBanner = document.createElement('div');
        suggestionBanner.className = 'travelwhiz-suggestions';
        suggestionBanner.innerHTML = `
            <div class="suggestion-banner">
                <div class="suggestion-icon">🚂</div>
                <div class="suggestion-content">
                    <h3>TravelWhiz Smart Suggestions</h3>
                    <p>I found 3 alternative routes with better confirmation chances!</p>
                    <button class="suggestion-btn" onclick="travelWhizAssistant.showAlternatives()">
                        View Alternatives
                    </button>
                </div>
            </div>
        `;
        
        container.insertBefore(suggestionBanner, container.firstChild);
    }
    
    fillIRCTCSearchForm(from, to, date) {
        // Fill IRCTC search form
        const fromInput = document.querySelector('#from, [name="from"], .from-station input');
        const toInput = document.querySelector('#to, [name="to"], .to-station input');
        const dateInput = document.querySelector('#date, [name="date"], .journey-date input');
        
        if (fromInput) {
            fromInput.value = from;
            fromInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (toInput) {
            toInput.value = to;
            toInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (dateInput && date !== 'today') {
            const dateValue = date === 'tomorrow' ? this.getTomorrowDate() : date;
            dateInput.value = dateValue;
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Auto-click search if available
        setTimeout(() => {
            const searchBtn = document.querySelector('#search, [name="search"], .search-btn, .btn-search');
            if (searchBtn) {
                searchBtn.click();
            }
        }, 1000);
    }
    
    fillIRCTCPassengerForm(passengerData) {
        // Fill passenger details in IRCTC booking form
        const nameInput = document.querySelector('[name="passengerName"], #passengerName, .passenger-name input');
        const ageInput = document.querySelector('[name="passengerAge"], #passengerAge, .passenger-age input');
        const genderSelect = document.querySelector('[name="passengerGender"], #passengerGender, .passenger-gender select');
        const berthSelect = document.querySelector('[name="berthPreference"], #berthPreference, .berth-preference select');
        
        if (nameInput && passengerData.name) {
            nameInput.value = passengerData.name;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (ageInput && passengerData.age) {
            ageInput.value = passengerData.age;
            ageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (genderSelect && passengerData.gender) {
            genderSelect.value = passengerData.gender;
            genderSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (berthSelect && passengerData.berthPreference) {
            berthSelect.value = passengerData.berthPreference;
            berthSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    // Utility functions
    
    addChatMessage(message, sender, isTemporary = false) {
        const chatContainer = document.getElementById('chatMessagesWidget');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message-widget ${isTemporary ? 'temporary' : ''}`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `<span>🤖</span><p>${message}</p>`;
        } else {
            messageDiv.innerHTML = `<span>👤</span><p>${message}</p>`;
        }
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    removeChatMessage() {
        const tempMessage = document.querySelector('.temporary');
        if (tempMessage) {
            tempMessage.remove();
        }
    }
    
    showPredictionResult(message, type) {
        const resultContainer = document.getElementById('predictionResult');
        resultContainer.className = `prediction-result ${type}`;
        resultContainer.innerHTML = `<p>${message}</p>`;
        resultContainer.style.display = 'block';
    }
    
    getProbabilityColor(probability) {
        if (probability >= 80) return '#10b981'; // Green
        if (probability >= 60) return '#f59e0b'; // Yellow
        if (probability >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Red
    }
    
    generateRecommendations(probability) {
        const recommendations = [];
        
        if (probability < 0.5) {
            recommendations.push('Consider booking alternative routes with higher confirmation chances');
            recommendations.push('Try different travel dates for better availability');
            recommendations.push('Book multiple tickets and cancel extras after confirmation');
        } else if (probability < 0.8) {
            recommendations.push('Monitor PNR status regularly for updates');
            recommendations.push('Keep backup travel options ready');
        } else {
            recommendations.push('High confirmation probability - good choice!');
            recommendations.push('Consider upgrading to higher class if available');
        }
        
        return recommendations;
    }
    
    findAlternativeRoutes() {
        // Mock alternative routes (would be fetched from API in real implementation)
        return [
            { name: 'Express Route via Junction A', probability: 85 },
            { name: 'Mail Train Route', probability: 72 },
            { name: 'Superfast Alternative', probability: 68 }
        ];
    }
    
    estimateConfirmationTime(probability) {
        if (probability > 0.8) return 'Within 24 hours';
        if (probability > 0.6) return '1-3 days';
        if (probability > 0.4) return '3-7 days';
        return 'Unlikely to confirm';
    }
    
    detectPNRFromPage() {
        // Try to detect PNR from current page content
        const pnrPattern = /\b\d{10}\b/g;
        const matches = document.body.innerText.match(pnrPattern);
        return matches ? matches[0] : null;
    }
    
    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    
    showNotification(message, type = 'info') {
        // Create floating notification
        const notification = document.createElement('div');
        notification.className = `travelwhiz-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    logActivity(type, data) {
        // Log activity for analytics and improvement
        chrome.storage.local.get(['activityLog'], (result) => {
            const log = result.activityLog || [];
            log.push({
                type,
                data,
                timestamp: Date.now(),
                site: this.currentSite
            });
            
            // Keep only last 100 activities
            if (log.length > 100) {
                log.shift();
            }
            
            chrome.storage.local.set({ activityLog: log });
        });
    }
    
    setupEventListeners() {
        // Listen for extension messages
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'toggleWidget') {
                const widgetPanel = document.getElementById('widgetPanel');
                widgetPanel.classList.toggle('active');
            } else if (request.action === 'fillForm') {
                this.fillPassengerDetails();
            } else if (request.action === 'predictPNR') {
                if (request.pnr) {
                    document.getElementById('pnrInputWidget').value = request.pnr;
                    this.handlePNRPrediction();
                }
            }
            
            sendResponse({ success: true });
        });
    }
    
    monitorPageChanges() {
        // Monitor URL changes for SPA navigation
        let currentUrl = location.href;
        
        const observer = new MutationObserver(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                this.onPageChange();
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    onPageChange() {
        // Handle page navigation
        setTimeout(() => {
            this.checkForIRCTCOpportunities();
        }, 1000);
    }
}

// Initialize TravelWhiz Assistant
const travelWhizAssistant = new TravelWhizAssistant();

// Make it globally accessible for onclick handlers
window.travelWhizAssistant = travelWhizAssistant;