// System Notification Engine for Web/Mobile Browsers

// Initialize EmailJS if configured
if (typeof EMAILJS_CONFIG !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY") {
    emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
}

document.addEventListener("DOMContentLoaded", () => {
    // Register Service Worker for PWA setup and Mobile Background Push
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered!'))
            .catch(err => console.error('Service Worker Registration Failed!', err));
    }
});

// Called when adding a new medicine or explicitly testing
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop/mobile notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    } 
    
    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

async function testMobileNotification() {
    const granted = await requestNotificationPermission();
    if (granted) {
        sendOSNotification('MedAlert System ✅', 'Success! Your mobile background notifications are fully active and working.');
    } else {
        alert("Notification permissions were denied! Please allow them in your browser/device settings.");
    }
}

async function checkNotifications() {
    // Prevent spamming. We'll only notify once per session per drug.
    const notifiedMeds = JSON.parse(sessionStorage.getItem('notifiedMeds')) || [];
    const allMeds = JSON.parse(localStorage.getItem('medicines')) || [];
    const currentUser = sessionStorage.getItem('activeUser');
    const userMeds = allMeds.filter(m => m.user === currentUser);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Only send actual notices if they already allowed them earlier
    if (Notification.permission === "granted") {
        for(const med of userMeds) {
            if(notifiedMeds.includes(med.id)) continue;
            
            const expDate = new Date(med.expiry);
            const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0 && diffDays > -3) {
                sendOSNotification("Medicine Expired 🚨", `${med.name} has expired! Please safely dispose of it.`);
                notifiedMeds.push(med.id);
            } else if (diffDays === 7 || diffDays === 3 || diffDays === 1) {
                sendOSNotification("Expiring Soon ⚠️", `${med.name} will expire in ${diffDays} day(s).`);
                notifiedMeds.push(med.id);
                
                // Trigger formal automated Email 3 Days prior!
                if (diffDays === 3 && typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY") {
                    emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
                        to_name: sessionStorage.getItem('activeName'),
                        user_email: currentUser,
                        medicine_name: med.name,
                        expiry_date: med.expiry,
                        days_left: diffDays
                    }).then(() => {
                        console.log("3-Day Expiry Alert securely sent via EmailJS!");
                    }).catch((err) => {
                        console.error("EmailJS failed to deliver alert:", err);
                    });
                }
            } else if (diffDays === 0) {
                sendOSNotification("Expiring Today 🚨", `${med.name} expires TODAY.`);
                notifiedMeds.push(med.id);
            }
        }
        sessionStorage.setItem('notifiedMeds', JSON.stringify(notifiedMeds));
    }
}

function sendOSNotification(title, body) {
    if (Notification.permission === "granted") {
        const options = {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
            vibrate: [200, 100, 200]
        };
        
        try {
            // Service Worker is required for Mobile Push Notifications in some mobile browsers (like Chrome Android)
            navigator.serviceWorker.ready.then(function(reg) {
                reg.showNotification(title, options);
            }).catch(e => {
                new Notification(title, options);
            });
        } catch (e) {
            new Notification(title, options);
        }
    }
}
