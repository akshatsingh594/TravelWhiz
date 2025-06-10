Here is the complete `README.md` snippet, including all the project details and the "All Rights Reserved" license at the very end, as you requested.

---

# TravelWhiz 🚀

## Your AI-Powered Indian Railway Booking Assistant ( Website + Chrome Extension )

TravelWhiz isn't just a website; it's a complete ecosystem designed to revolutionize your Indian railway booking experience. From a sleek, futuristic landing page to a powerful Chrome extension, TravelWhiz leverages AI and cutting-edge UI/UX to make train travel hassle-free, faster, and smarter. Whether you're looking for real-time Tatkal alerts or an AI-powered travel assistant, TravelWhiz has you covered.

---

## ✨ Features

TravelWhiz is packed with features to enhance your booking journey:

### 🎨 Stunning UI/UX
* **Futuristic Design:** A darker, more futuristic background with enhanced gradients sets a modern tone.
* **Dynamic Visuals:** Enjoy floating background tags that animate in smoothly, creating an immersive experience.
* **Seamless Navigation:** Smooth scrolling ensures proper navigation between all sections of the site.
* **Modern Aesthetics:** Experience modern transparency effects and a clear visual hierarchy for effortless interaction.
* **Mobile-Responsive:** Access TravelWhiz seamlessly on any device with its fully responsive design and hamburger menu.

### 🔐 Robust User Authentication
* **Easy Access:** A modern login/signup modal with a convenient Google authentication option.
* **Personalized Avatars:** Choose from 6 different themed avatars for a creative and personalized profile.
* **Profile Management:** Manage your user profile directly from the header.
* **Secure & Validated:** Benefit from secure form handling with proper validation for all user inputs.

### 👑 TravelWhiz Pro Features
Unlock the full potential of TravelWhiz with our Pro subscription:
* **Real-time Tatkal Timer:** Stay ahead with a live countdown to the next Tatkal booking window.
* **Affordable Subscription:** Get Pro access for just ₹99/month, with flexible UPI and card payment options (Stripe integration ready!).
* **Exclusive Access:** Pro-exclusive features are clearly indicated and redirect to the Pro page if you try to access them without a subscription.
* **Clear Benefits:** A feature comparison section clearly outlines the superior advantages of going Pro.
* **Tatkal Auto-Booking:** Pro users gain access to our Tatkal Auto-Booking feature via the Chrome extension.
* **Advanced AI Chatbot:** Enjoy a better model access with deeper routing logic within the extension.
* **Real-Time Live Alerts:** Receive instant alerts when a booking is made or fails through the extension.

### 🚀 Enhanced Functionality
* **Functional Navigation:** All navigation buttons now smoothly scroll to their correct sections (e.g., "Check PNR Status" scrolls to PNR Prediction Oracle, "Chat with Wizard" scrolls to AI Travel Assistant).
* **Pro Feature Locking:** Smart locking mechanisms with visual indicators guide users to the Pro subscription.
* **Seamless Animations:** Enjoy smooth, engaging animations throughout the entire site.
* **Improved Feedback:** Better visual feedback for all user interactions, ensuring a delightful experience.

### 👨‍💻 Creator & Community
* **Akshat Singh Attribution:** Find proper attribution in the footer.
* **Direct Contact:** Easily reach out via direct email.
* **Social Connectivity:** Connect on Instagram alongside other social media platforms.
* **User Feedback and Help is highly appreciated.

---

## 🧩 The TravelWhiz Chrome Extension 
TravelWhiz is a futuristic Chrome extension that extends its power directly into your browser, revolutionizing your train booking experience on sites like IRCTC, Paytm, and ixigo. With a modern, minimal UI and intelligent backend features, TravelWhiz aims to make your travel planning seamless, faster, and smarter.

## Features

### User Interface

* **Modern, Minimal Design:** Experience a sleek, floating, and animated UI with smooth cursor interactions, providing a delightful user experience.

* **Dark/Light Mode:** Toggle between dark and light themes to suit your preference.

* **Responsive Popup:** Enjoy a perfectly laid out and responsive popup window (480px width) designed for optimal usability on any screen.

### User Authentication & Database

* **Flexible Login Options:** Easily log in or sign up using your email or Google account.

* **Secure Data Storage:** Your travel history, booking preferences, and saved alerts are securely stored in a robust backend database (Firebase, Supabase, or Airtable).

* **Activity Tracking:** TravelWhiz tracks user activity and feature usage to provide valuable insights and improve the service.

### Core Functionality

* **Auto-Detection:** Automatically detects when you visit IRCTC or other train booking sites (IRCTC, Paytm, ixigo), seamlessly activating its features.

* **In-Page Integration:** Injects a floating chatbot and an overlay panel directly onto booking pages for integrated assistance.

* **Autofill Booking:** Accelerate your bookings by automatically filling essential booking fields.

* **Tatkal Alerts:** Receive precise alerts the moment Tatkal booking windows open, giving you an edge.

* **Data Sync:** Your inputs are saved locally or synced with your cloud database, ensuring your preferences are always available.

### Intelligent Backend

* **AI Chatbot:** An intelligent chatbot powered by NLP/AI (using ChatGPT API / OpenAI API) provides smart assistance and answers your queries.

* **Monitoring & Scheduling:** Utilizes webhooks or background scripts to vigilantly monitor Tatkal windows, schedule, and retry booking functions, increasing your chances of securing a ticket.

* **Real-time Alerts:** Get instant email or popup alerts for critical updates and booking status changes.

## Booking Intelligence Engine

TravelWhiz's advanced Booking Intelligence Engine offers a suite of powerful features designed to maximize your confirmation chances and optimize your booking strategy:

* **Live Confirmation Probability Engine (AI-driven):** Get real-time Waitlist (WL) / Reservation Against Cancellation (RAC) to Confirmed (CNF) probability predictions using Machine Learning, time-series analysis, and PNR history.

* **Multi-Route Optimizer:** Receive suggestions for alternate routes (via cities or zone-splits) that offer a higher likelihood of confirmation.

* **Fare Class Optimizer:** TravelWhiz intelligently detects the cheapest class with the highest confirmation rate (e.g., comparing 3AC vs. Sleeper Tatkal).

* **Quota Intelligence:** Benefit from deep analysis of all quotas (Senior Citizen, HO, Defence, Ladies) based on eligibility, guiding you to the best options.

* **Auto-Tatkal Watchdog:** Monitors the Tatkal window, alerts you when a seat becomes available, and provides instant recommendations or even automatic booking.

* **Dynamic Booking Timer:** Get suggestions on the ideal time to book your tickets to maximize your confirmation chances.

* **Blackout Date Warnings:** Be warned about IRCTC maintenance periods, rush periods, and festival surges that might impact your travel.

* **IRCTC Rules NLP Engine:** An NLP engine extracts complex rules from IRCTC circulars and PDFs, explaining them in simple, easy-to-understand language.

TravelWhiz is your ultimate companion for a smarter, faster, and more confident train booking experience.
---

## 🛠️ How to Build & Run (For Developers)

This project is structured for easy development and deployment. Here's a general overview of the tools and structure:

### ⚙️ Technologies Used 
* **UI/UX:** Figma, Framer, Tailwind CSS
* **Extension Build:** Plasmo, Bubble.io, Builder.ai
* **User Authentication & Database:** Firebase Auth + Firestore / Supabase / Airtable
* **Chatbot AI:** OpenAI API + JS SDK
* **Payments:** Razorpay (India) / Stripe
* **Analytics:** PostHog, Mixpanel, Firebase Analytics

### 📦 Project Structure (Chrome Extension Export)
The Chrome extension project exports with a clear structure, making it easy to manage:
* `/manifest.json`
* `/popup.html` (Handles the extension's UI)
* `/background.js` (Runs scripts in the background, handles logic)
* `/content.js` (Injects code into travel websites)
* `/firebaseConfig.js` or `supabaseClient.js` (Database connection and configuration)
* `/styles.css` (Contains all styling, including animation classes)

This setup includes:
* Firebase DB setup
* Login/authentication routes
* Payment success flow
* Local and cloud storage handling

**Frontend:**
* HTML/CSS + Tailwind
* JavaScript/React with Plasmo.js (for Chrome Extensions)

**Backend:**
* Firebase (for authentication and real-time database)
* Razorpay SDK (for ₹99/month payments)
* OpenAI API / Sonar (for chatbot integration)

---

## 🤝 Contributing

We welcome contributions to TravelWhiz! If you have suggestions for features, bug reports, or want to contribute code, please feel free to:

* Open an issue on the GitHub repository.
* Submit a pull request with your proposed changes.

---

## 📧 Contact

Have questions or feedback? Feel free to reach out to Akshat Singh directly:
* **Email:** thisisakshatsingh@gmail.com
* **Instagram:** akshatxsingh

---

## 📜 License

© 2025 Akshat Singh. All Rights Reserved.

This project, TravelWhiz, including all its code, assets, and documentation, is proprietary intellectual property. No part of this project may be reproduced, distributed, modified, or used for commercial purposes without explicit written permission from Akshat Singh. Users are permitted to view and interact with the public facing elements of the website and extension for personal use only.

---

**Thank you for exploring TravelWhiz! We're excited to help you simplify your travel bookings.**
