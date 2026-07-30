/* ==========================================================================
   SentiMind JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // API Endpoint Detection
    const getApiUrls = () => {
        // If running from local file protocol or served on a different port than the backend
        if (window.location.protocol === 'file:' || 
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return [
                'http://127.0.0.1:8000/predict',
                'http://127.0.0.1:8001/predict'
            ];
        }
        return ['/predict'];
    };

    // DOM Elements
    const form = document.getElementById('predictionForm');
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step4')
    ];
    const progressLineFill = document.getElementById('progressLineFill');
    const stepNodes = [
        document.getElementById('stepNode1'),
        document.getElementById('stepNode2'),
        document.getElementById('stepNode3'),
        document.getElementById('stepNode4')
    ];

    // Navigation Buttons
    const btnNext1 = document.getElementById('btnNext1');
    const btnNext2 = document.getElementById('btnNext2');
    const btnBack2 = document.getElementById('btnBack2');
    const btnBack3 = document.getElementById('btnBack3');
    const btnSubmit = document.getElementById('btnSubmit');

    // UI Interactive Triggers
    const btnShowMorePlatforms = document.getElementById('btnShowMorePlatforms');
    const optLine = document.getElementById('optLine');
    const optKakao = document.getElementById('optKakao');
    const optVK = document.getElementById('optVK');

    // State Cards
    const apiLoader = document.getElementById('apiLoader');
    const apiErrorCard = document.getElementById('apiErrorCard');
    const apiResultCard = document.getElementById('apiResultCard');
    const btnRetry = document.getElementById('btnRetry');
    const btnRestart = document.getElementById('btnRestart');
    const btnShare = document.getElementById('btnShare');

    // Result Card Elements
    const scoreVal = document.getElementById('scoreVal');
    const scoreCircle = document.getElementById('scoreCircle');
    const statusBadge = document.getElementById('statusBadge');
    const assessmentTitle = document.getElementById('assessmentTitle');
    const assessmentDesc = document.getElementById('assessmentDesc');
    const recommendationList = document.getElementById('recommendationList');
    const gradStop1 = document.getElementById('gradStop1');
    const gradStop2 = document.getElementById('gradStop2');

    // Toast Elements
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const toastIcon = document.getElementById('toastIcon');
    const toastClose = document.getElementById('toastClose');

    // State Variable
    let currentStep = 1;

    // Platform Selector toggle logic
    let showAllPlatforms = false;
    btnShowMorePlatforms.addEventListener('click', () => {
        showAllPlatforms = !showAllPlatforms;
        if (showAllPlatforms) {
            optLine.classList.remove('flex-hide');
            optKakao.classList.remove('flex-hide');
            optVK.classList.remove('flex-hide');
            btnShowMorePlatforms.innerHTML = '<span>Show fewer options</span> <i class="fa-solid fa-chevron-up"></i>';
        } else {
            optLine.classList.add('flex-hide');
            optKakao.classList.add('flex-hide');
            optVK.classList.add('flex-hide');
            btnShowMorePlatforms.innerHTML = '<span>Show all options</span> <i class="fa-solid fa-chevron-down"></i>';
        }
    });

    // Slider Event Listeners for Live Badge updates
    const sliders = [
        { id: 'dailyUsage', valId: 'dailyUsageVal', unit: ' hrs' },
        { id: 'studyHours', valId: 'studyHoursVal', unit: ' hrs' },
        { id: 'sleepHours', valId: 'sleepHoursVal', unit: ' hrs' },
        { id: 'activityHours', valId: 'activityHoursVal', unit: ' hrs' }
    ];

    sliders.forEach(slider => {
        const inputEl = document.getElementById(slider.id);
        const valEl = document.getElementById(slider.valId);
        
        inputEl.addEventListener('input', (e) => {
            valEl.textContent = parseFloat(e.target.value).toFixed(1) + slider.unit;
        });
    });

    // Step navigation controller
    const setStep = (stepNumber) => {
        // Range validation
        if (stepNumber < 1 || stepNumber > 4) return;
        currentStep = stepNumber;

        // Update step form visibility
        steps.forEach((step, idx) => {
            if (idx + 1 === stepNumber) {
                step.classList.add('active-step');
            } else {
                step.classList.remove('active-step');
            }
        });

        // Update indicators
        stepNodes.forEach((node, idx) => {
            const nodeStep = idx + 1;
            if (nodeStep < stepNumber) {
                node.classList.add('completed');
                node.classList.remove('active');
            } else if (nodeStep === stepNumber) {
                node.classList.add('active');
                node.classList.remove('completed');
            } else {
                node.classList.remove('active', 'completed');
            }
        });

        // Update progress line fill width
        const fillPercentage = ((stepNumber - 1) / (stepNodes.length - 1)) * 100;
        progressLineFill.style.width = `${fillPercentage}%`;
    };

    // Validation helpers
    const showError = (formGroupId, errorMsgId, show = true) => {
        const group = document.getElementById(formGroupId);
        if (group) {
            if (show) {
                group.classList.add('invalid');
            } else {
                group.classList.remove('invalid');
            }
        }
    };

    const validateStep1 = () => {
        let isValid = true;

        // Age: 10 to 100
        const ageVal = parseInt(document.getElementById('age').value);
        if (isNaN(ageVal) || ageVal < 10 || ageVal > 100) {
            showError('ageError', null, true);
            document.getElementById('age').parentElement.classList.add('invalid');
            isValid = false;
        } else {
            document.getElementById('age').parentElement.classList.remove('invalid');
        }

        // Country
        const countryVal = document.getElementById('country').value;
        if (!countryVal) {
            document.getElementById('country').parentElement.classList.add('invalid');
            isValid = false;
        } else {
            document.getElementById('country').parentElement.classList.remove('invalid');
        }

        // Gender
        const genderChecked = document.querySelector('input[name="Gender"]:checked');
        if (!genderChecked) {
            document.getElementById('genderError').parentElement.classList.add('invalid');
            isValid = false;
        } else {
            document.getElementById('genderError').parentElement.classList.remove('invalid');
        }

        // Academic Level
        const academicChecked = document.querySelector('input[name="Academic_Level"]:checked');
        if (!academicChecked) {
            document.getElementById('academicError').parentElement.classList.add('invalid');
            isValid = false;
        } else {
            document.getElementById('academicError').parentElement.classList.remove('invalid');
        }

        if (!isValid) {
            showToast('Form Error', 'Please correct the highlighed fields before proceeding.', false);
        }

        return isValid;
    };

    const validateStep2 = () => {
        let isValid = true;

        // Platform
        const platformChecked = document.querySelector('input[name="Most_Used_Platform"]:checked');
        if (!platformChecked) {
            document.getElementById('platformError').parentElement.classList.add('invalid');
            isValid = false;
        } else {
            document.getElementById('platformError').parentElement.classList.remove('invalid');
        }

        // Purpose of Use
        const purposeChecked = document.querySelector('input[name="Purpose_Of_Use"]:checked');
        if (!purposeChecked) {
            document.getElementById('purposeError').parentElement.classList.add('invalid');
            isValid = false;
        } else {
            document.getElementById('purposeError').parentElement.classList.remove('invalid');
        }

        // Daily Unlocks >= 0
        const unlocksVal = parseInt(document.getElementById('unlocks').value);
        if (isNaN(unlocksVal) || unlocksVal < 0) {
            document.getElementById('unlocks').parentElement.classList.add('invalid');
            isValid = false;
        } else {
            document.getElementById('unlocks').parentElement.classList.remove('invalid');
        }

        if (!isValid) {
            showToast('Form Error', 'Please fill in all social media habits fields.', false);
        }

        return isValid;
    };

    const validateStep3 = () => {
        // Stress Level checked
        const stressChecked = document.querySelector('input[name="Stress_Level"]:checked');
        if (!stressChecked) {
            document.getElementById('stressError').parentElement.classList.add('invalid');
            showToast('Form Error', 'Please select a stress level.', false);
            return false;
        } else {
            document.getElementById('stressError').parentElement.classList.remove('invalid');
        }
        return true;
    };

    // Navigation buttons binding
    btnNext1.addEventListener('click', () => {
        if (validateStep1()) {
            setStep(2);
        }
    });

    btnNext2.addEventListener('click', () => {
        if (validateStep2()) {
            setStep(3);
        }
    });

    btnBack2.addEventListener('click', () => {
        setStep(1);
    });

    btnBack3.addEventListener('click', () => {
        setStep(2);
    });

    // Allow navigation nodes clicks but only to steps already filled
    stepNodes.forEach((node, index) => {
        node.addEventListener('click', () => {
            const targetStep = index + 1;
            if (targetStep === 1) {
                setStep(1);
            } else if (targetStep === 2 && validateStep1()) {
                setStep(2);
            } else if (targetStep === 3 && validateStep1() && validateStep2()) {
                setStep(3);
            }
        });
    });

    // Score radial ring calculator
    const updateProgressRing = (scoreVal) => {
        const radius = scoreCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        // Map 0-10 score to circle completion percentage (circumference to 0 offset)
        const percentage = Math.min(Math.max(scoreVal, 0), 10) / 10;
        const offset = circumference - (percentage * circumference);
        
        scoreCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        scoreCircle.style.strokeDashoffset = offset;
    };

    // Counter animation for score
    const animateScoreText = (targetScore) => {
        let current = 0.0;
        const duration = 1500; // 1.5s
        const stepsCount = 60;
        const stepTime = duration / stepsCount;
        const increment = targetScore / stepsCount;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetScore) {
                clearInterval(timer);
                scoreVal.textContent = targetScore.toFixed(1);
            } else {
                scoreVal.textContent = current.toFixed(1);
            }
        }, stepTime);
    };

    // Assessment categorization and theme color updater
    const renderResults = (score) => {
        let badgeText, title, desc, tips, theme;

        if (score >= 7.5) {
            badgeText = "Excellent Well-being";
            title = "Digital Flourishing";
            desc = "Your social media usage and lifestyle inputs indicate a highly balanced, positive mental state with strong boundaries.";
            theme = {
                color1: '#10b981', // green
                color2: '#059669',
                bg: 'rgba(16, 185, 129, 0.15)',
                glow: 'rgba(16, 185, 129, 0.25)',
                class: 'excel-theme'
            };
            tips = [
                "Maintain your current digital boundaries. Your balance of screen time and physical activity is ideal.",
                "Continue securing 7-9 hours of nightly sleep—this is a key biological driver of your score.",
                "Foster this resilience by engaging in screen-free outdoor activities and offline social circles."
            ];
        } else if (score >= 6.5) {
            badgeText = "Good / Balanced";
            title = "Moderate Balance";
            desc = "You maintain a reasonably healthy relationship with digital platforms, but minor tweaks can optimize your well-being.";
            theme = {
                color1: '#06b6d4', // cyan
                color2: '#0891b2',
                bg: 'rgba(6, 182, 212, 0.15)',
                glow: 'rgba(6, 182, 212, 0.25)',
                class: 'good-theme'
            };
            tips = [
                "Install brief app timers for your most used platforms to prevent mindless scrolling.",
                "Target adding just 15-30 minutes of daily physical exercise to further reduce cognitive fatigue.",
                "Establish a 'digital curfew'—turn off alerts 30 minutes before sleep to optimize sleep depth."
            ];
        } else if (score >= 5.5) {
            badgeText = "Moderate Stress";
            title = "Digital Fatigue";
            desc = "Your inputs show elevated social media interaction or sub-optimal daily habits. Minor digital exhaustion is present.";
            theme = {
                color1: '#f59e0b', // orange
                color2: '#d97706',
                bg: 'rgba(245, 158, 11, 0.15)',
                glow: 'rgba(245, 158, 11, 0.25)',
                class: 'mod-theme'
            };
            tips = [
                "Consciously reduce daily hours. Aim to restrict social media usage to under 3 hours daily.",
                "Counter screen fatigue with active focus breaks (using techniques like the Pomodoro system).",
                "Integrate stress management protocols like deep breathing, journaling, or short walks during stress spikes."
            ];
        } else {
            badgeText = "High Stress / Risk";
            title = "Digital Exhaustion";
            desc = "Your patterns indicate potential risk of digital burn-out, high stress levels, or sleep deprivation due to screen dependency.";
            theme = {
                color1: '#ef4444', // red
                color2: '#dc2626',
                bg: 'rgba(239, 68, 68, 0.15)',
                glow: 'rgba(239, 68, 68, 0.25)',
                class: 'risk-theme'
            };
            tips = [
                "Execute an immediate digital detox. Reduce phone unlocks by using dedicated launcher blocker apps.",
                "Prioritize sleep restoration immediately. Consistently low sleep is highly correlated with severe stress.",
                "Implement strict device-free zones (e.g. bed, study desk) to build physical separation from notification loops.",
                "Consider talking to a counselor or advisor if stress levels feel persistently unmanageable."
            ];
        }

        // Apply theme color styling dynamically to SVG and Badge
        gradStop1.setAttribute('stop-color', theme.color1);
        gradStop2.setAttribute('stop-color', theme.color2);
        scoreCircle.style.filter = `drop-shadow(0 0 10px ${theme.glow})`;
        
        statusBadge.textContent = badgeText;
        statusBadge.style.backgroundColor = theme.bg;
        statusBadge.style.color = theme.color1;
        statusBadge.style.border = `1px solid rgba(${parseInt(theme.color1.slice(1,3), 16)}, ${parseInt(theme.color1.slice(3,5), 16)}, ${parseInt(theme.color1.slice(5,7), 16)}, 0.3)`;

        assessmentTitle.textContent = title;
        assessmentDesc.textContent = desc;

        // Render recommendation items
        recommendationList.innerHTML = '';
        tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            // Apply theme color variables to the list items custom bullets
            li.style.setProperty('--bullet-color', theme.color1);
            recommendationList.appendChild(li);
        });

        // Set score circle visual progress
        updateProgressRing(score);
        animateScoreText(score);
    };

    // Form Submit API Handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateStep1() || !validateStep2() || !validateStep3()) {
            return;
        }

        // Advance to step 4 (Loader)
        setStep(4);
        
        // Hide result and error cards, show loader
        apiLoader.classList.remove('hidden');
        apiErrorCard.classList.add('hidden');
        apiResultCard.classList.add('hidden');

        // Gather Form Data
        const formData = new FormData(form);
        const payload = {
            Age: parseInt(formData.get('Age')),
            Gender: formData.get('Gender'),
            Country: formData.get('Country'),
            Academic_Level: formData.get('Academic_Level'),
            Most_Used_Platform: formData.get('Most_Used_Platform'),
            Purpose_Of_Use: formData.get('Purpose_Of_Use'),
            Avg_Daily_Usage_Hours: parseFloat(formData.get('Avg_Daily_Usage_Hours')),
            Daily_Unlocks: parseInt(formData.get('Daily_Unlocks')),
            Study_Hours: parseFloat(formData.get('Study_Hours')),
            Physical_Activity_Hours: parseFloat(formData.get('Physical_Activity_Hours')),
            Sleep_Hours_Per_Night: parseFloat(formData.get('Sleep_Hours_Per_Night')),
            Stress_Level: formData.get('Stress_Level')
        };

        const apiUrls = getApiUrls();
        
        const performInference = (urlIndex = 0) => {
            if (urlIndex >= apiUrls.length) {
                handleErrorDisplay(new Error('Failed to connect to the prediction server. Please verify that the backend is running locally at http://127.0.0.1:8000 or http://127.0.0.1:8001'));
                return;
            }

            const currentUrl = apiUrls[urlIndex];
            
            fetch(currentUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(async (response) => {
                if (!response.ok) {
                    let errDetails = `Server returned status code ${response.status}`;
                    try {
                        const errData = await response.json();
                        if (errData && errData.detail) {
                            if (Array.isArray(errData.detail)) {
                                errDetails = errData.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
                            } else {
                                errDetails = errData.detail;
                            }
                        }
                    } catch(e) {}
                    throw new Error(errDetails);
                }
                return response.json();
            })
            .then((data) => {
                // Success response
                setTimeout(() => {
                    apiLoader.classList.add('hidden');
                    apiResultCard.classList.remove('hidden');
                    renderResults(data.Predicted_Mental_Health_Score);
                    showToast('Analysis Completed', 'SentiMind AI has generated your personal well-being metrics.', true);
                }, 800);
            })
            .catch((error) => {
                // Connection/fetch failover
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message === 'Failed to fetch') {
                    console.warn(`Connection failed to ${currentUrl}. Trying next fallback URL if available...`);
                    performInference(urlIndex + 1);
                } else {
                    handleErrorDisplay(error);
                }
            });
        };

        const handleErrorDisplay = (error) => {
            setTimeout(() => {
                apiLoader.classList.add('hidden');
                errorMessage.textContent = error.message.includes('Failed to fetch') || error.message.includes('connect to the prediction server')
                    ? 'Failed to connect to the prediction server. Please verify that the backend is running locally at http://127.0.0.1:8000 or http://127.0.0.1:8001'
                    : `Error: ${error.message}`;
                apiErrorCard.classList.remove('hidden');
                showToast('Inference Error', 'SentiMind failed to compute the prediction score.', false);
            }, 800);
        };

        performInference(0);
    });

    // Retry and Reset bindings
    btnRetry.addEventListener('click', () => {
        setStep(3);
    });

    const resetForm = () => {
        form.reset();
        
        // Reset slider displays
        document.getElementById('dailyUsageVal').textContent = '4.0 hrs';
        document.getElementById('studyHoursVal').textContent = '3.0 hrs';
        document.getElementById('sleepHoursVal').textContent = '7.0 hrs';
        document.getElementById('activityHoursVal').textContent = '1.0 hrs';
        
        // Uncheck all custom styled radio items
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        // Hide any active validations
        document.querySelectorAll('.invalid').forEach(el => {
            el.classList.remove('invalid');
        });

        // Retract Platform expander
        showAllPlatforms = false;
        optLine.classList.add('flex-hide');
        optKakao.classList.add('flex-hide');
        optVK.classList.add('flex-hide');
        btnShowMorePlatforms.innerHTML = '<span>Show all options</span> <i class="fa-solid fa-chevron-down"></i>';

        setStep(1);
    };

    btnRestart.addEventListener('click', resetForm);

    // Share results handler (copies score and generic link)
    btnShare.addEventListener('click', () => {
        const score = scoreVal.textContent;
        const badge = statusBadge.textContent;
        const text = `SentiMind AI predicted my Mental Health Well-being Score as ${score}/10 (${badge}) based on my digital habits. Take your own analysis here!`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    showToast('Copied to Clipboard', 'Your results summary has been copied!', true);
                })
                .catch(() => {
                    showToast('Sharing Failed', 'Could not copy automatically.', false);
                });
        } else {
            showToast('Sharing Not Supported', 'Clipboard writing is not supported by your browser.', false);
        }
    });

    // Toast notification controller
    let toastTimeout;
    const showToast = (title, message, isSuccess = true) => {
        clearTimeout(toastTimeout);
        toastTitle.textContent = title;
        toastBody.textContent = message;
        
        if (isSuccess) {
            toastIcon.className = 'fa-solid fa-circle-check toast-icon success';
        } else {
            toastIcon.className = 'fa-solid fa-triangle-exclamation toast-icon';
        }

        toast.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 5000); // Hides toast after 5 seconds
    };

    toastClose.addEventListener('click', () => {
        toast.classList.remove('show');
    });

    // Initialize with Step 1
    setStep(1);
});
