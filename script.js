document.addEventListener('DOMContentLoaded', () => {
    // === SHARED LOGIC ===
    const body = document.body;
    const darkToggle = document.getElementById('darkToggle');
    const darkToggleMobile = document.getElementById('darkToggleMobile');
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');

    // Dark Mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if(darkToggle) darkToggle.textContent = '☀️';
        if(darkToggleMobile) darkToggleMobile.textContent = '☀️ Light Mode';
    }

    const toggleDark = () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const icon = isDark ? '☀️' : '🌙';
        if(darkToggle) darkToggle.textContent = icon;
        if(darkToggleMobile) darkToggleMobile.textContent = icon + (isDark ? ' Light Mode' : ' Dark Mode');
    };

    if(darkToggle) darkToggle.addEventListener('click', toggleDark);
    if(darkToggleMobile) darkToggleMobile.addEventListener('click', toggleDark);

    // Mobile Hamburger
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileDrawer.classList.toggle('active');
        });
    }

    // Visibility Observer for Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // === TIMELINE LOGIC ===
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineDetail = document.getElementById('timelineDetail');
    if (timelineTrack) {
        const stageData = {
            registration: {
                title: "Voter Registration",
                date: "Ongoing / Varying deadlines",
                desc: "The critical first step in democratic participation. Most states require registration 15–30 days before election day. Millions of new voters join the rolls every cycle, ensuring their voice is ready for the ballot box.",
                facts: ["Must be 18+", "U.S. Citizen", "State Residency"],
                color: "#2196F3"
            },
            primaries: {
                title: "Primary Elections",
                date: "February - June",
                desc: "Parties select their champions. Through caucus or primary voting, selected delegates represent the will of party members at the national conventions, narrowing the field of candidates.",
                facts: ["Open vs Closed", "Delegates", "Caucuses"],
                color: "#9C27B0"
            },
            campaigns: {
                title: "Campaigns & Debates",
                date: "July - October",
                desc: "The battle for hearts and minds. Candidates travel across battleground states, participating in televised debates and town halls to share their visions for the nation's future.",
                facts: ["Policy Platforms", "Public Finance", "Swing States"],
                color: "#FF9800"
            },
            electionday: {
                title: "Election Day",
                date: "Tuesday after first Monday in Nov",
                desc: "The culmination of the process. Millions cast ballots in person, joining the mail-in votes already tallied. The highest authority in the land—the voter—decides the direction of government.",
                facts: ["Poll Hours", "Ballot Measures", "Voter Privacy"],
                color: "#E53935"
            },
            counting: {
                title: "Vote Counting",
                date: "Election Night & Beyond",
                desc: "Ensuring every legal vote counts. Bipartisan observers track the tallying of paper and digital ballots, while audits verify the integrity of the technology and reporting systems.",
                facts: ["Absentee Tally", "Audit Logs", "Bipartisan Review"],
                color: "#00897B"
            },
            certification: {
                title: "Certification",
                date: "Late Nov - December",
                desc: "Making the results official. Local and state boards verify counts and resolve any disputes before formally declaring the winners and appointing electors to the Electoral College.",
                facts: ["Electoral College", "State Boards", "Legal Finality"],
                color: "#43A047"
            },
            inauguration: {
                title: "Inauguration",
                date: "January 20",
                desc: "A peaceful transfer of power. The President-elect takes the oath of office on the Capitol steps, marking the official beginning of a new four-year term of service to the people.",
                facts: ["Oath of Office", "Capitol Ceremony", "Presidential Term"],
                color: "#FFB300"
            }
        };

        const timelineCards = timelineTrack.querySelectorAll('.timeline-card');
        
        const closeTimeline = () => {
            timelineDetail.classList.remove('active');
            setTimeout(() => { timelineDetail.innerHTML = ''; }, 300);
            timelineCards.forEach(c => c.classList.remove('active'));
        };

        timelineCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const stage = card.dataset.stage;
                const data = stageData[stage];

                timelineCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Update Detail as Modal Content
                timelineDetail.innerHTML = `
                    <div class="modal-card" style="border-top: 6px solid ${data.color}">
                        <button class="modal-close" id="modalClose"><span class="material-symbols-outlined">close</span></button>
                        <div class="tl-dates">${data.date}</div>
                        <h3 class="text-h2">${data.title}</h3>
                        <p class="tl-desc">${data.desc}</p>
                        <div class="timeline-facts">
                            ${data.facts.map(f => `<span class="timeline-fact"><span class="material-symbols-outlined" style="font-size:14px;color:${data.color}">check_circle</span> ${f}</span>`).join('')}
                        </div>
                    </div>
                `;
                timelineDetail.classList.add('active');

                const modalClose = document.getElementById('modalClose');
                if(modalClose) modalClose.addEventListener('click', closeTimeline);
            });
        });

        // Close on backdrop click
        timelineDetail.addEventListener('click', (e) => {
            if(e.target === timelineDetail) closeTimeline();
        });
    }

    // === STEPS EXPLORER LOGIC ===
    const filterBtns = document.querySelectorAll('.filter-btn');
    const stepCards = document.querySelectorAll('.step-card');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                stepCards.forEach(card => {
                    const cats = card.dataset.category.split(' ');
                    if (filter === 'all' || cats.includes(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => card.style.opacity = '1', 50);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });

        // Accordion functionality
        stepCards.forEach(card => {
            const moreBtn = card.querySelector('.step-more-btn');
            const accordion = card.querySelector('.step-accordion');
            
            moreBtn.addEventListener('click', () => {
                const isOpen = card.classList.toggle('expanded');
                accordion.style.maxHeight = isOpen ? (accordion.scrollHeight + "px") : "0";
                moreBtn.querySelector('span:first-child').textContent = isOpen ? "Show Less" : "Learn More";
                moreBtn.querySelector('span:last-child').style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
            });
        });
    }

    // === GLOSSARY LOGIC ===
    const glossaryGrid = document.getElementById('glossaryGrid');
    const glossarySearch = document.getElementById('glossarySearch');
    const alphaBar = document.getElementById('alphaBar');

    if (glossaryGrid && alphaBar) {
        // Generate letters
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        letters.forEach(l => {
            const btn = document.createElement('button');
            btn.className = 'alpha-btn';
            btn.textContent = l;
            btn.dataset.letter = l;
            
            // Check if group exists for this letter
            const group = glossaryGrid.querySelector(`.glossary-group[data-letter="${l}"]`);
            if(!group) btn.disabled = true;

            btn.addEventListener('click', () => {
                if(group) {
                    group.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    document.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
            alphaBar.appendChild(btn);
        });

        // Live Search
        glossarySearch.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const groups = glossaryGrid.querySelectorAll('.glossary-group');
            
            groups.forEach(group => {
                const cards = group.querySelectorAll('.glossary-card');
                let groupHasMatch = false;

                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(val)) {
                        card.style.display = 'block';
                        groupHasMatch = true;
                    } else {
                        card.style.display = 'none';
                    }
                });

                group.style.display = groupHasMatch ? 'block' : 'none';
            });
        });
    }

    // === CHAT LOGIC ===
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const chips = document.getElementById('chatChips');

    if (chatInput && sendBtn) {
        const addMessage = (text, sender) => {
            const msg = document.createElement('div');
            msg.className = `chat-msg ${sender}`;
            
            if (sender === 'ai') {
                msg.innerHTML = `
                    <div class="msg-avatar">
                        <span class="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div class="msg-content">
                        <div class="msg-ai">${text}</div>
                        <div class="msg-source">
                            <span class="material-symbols-outlined">verified</span>
                            <span>Sources: Federal Election Commission</span>
                        </div>
                    </div>
                `;
            } else {
                msg.innerHTML = `<div class="msg-user">${text}</div>`;
            }
            
            chatBody.insertBefore(msg, typingIndicator);
            chatBody.scrollTop = chatBody.scrollHeight;
        };

        const handleSend = () => {
            const text = chatInput.value.trim();
            if(!text) return;

            addMessage(text, 'user');
            chatInput.value = '';
            sendBtn.disabled = true;

            // Show typing
            typingIndicator.style.display = 'flex';
            chatBody.scrollTop = chatBody.scrollHeight;

            // Simulate AI
            setTimeout(() => {
                typingIndicator.style.display = 'none';
                let response = "That's a great question about our democratic process. For specific details on " + text + ", I recommend checking the official FEC website or your local Secretary of State office.";
                
                if(text.toLowerCase().includes('register')) {
                    response = "Voter registration is handled at the state level. In most states, you can register online, by mail, or in person at a DMV or election office. The deadline is usually 15-30 days before the election.";
                }

                addMessage(response, 'ai');
            }, 1500);
        };

        chatInput.addEventListener('input', () => {
            sendBtn.disabled = chatInput.value.trim().length === 0;
        });

        chatInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') handleSend();
        });

        sendBtn.addEventListener('click', handleSend);

        // Chip logic
        if(chips) {
            chips.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    chatInput.value = chip.textContent;
                    handleSend();
                });
            });
        }
    }

    // === QUIZ LOGIC ===
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');
    const progressBar = document.getElementById('progressBar');
    const currentIdxEl = document.getElementById('currentIdx');
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const quizCard = document.getElementById('quizCard');
    const quizResults = document.getElementById('quizResults');
    const finalScoreEl = document.getElementById('finalScore');

    if (questionText && quizOptions) {
        const questions = [
            {
                q: "Which of the following best describes the role of the Electoral College in U.S. Presidential elections?",
                options: [
                    "A direct popular vote where the candidate with the most individual votes wins.",
                    "A body of electors chosen by each state to formally cast votes for President and Vice President.",
                    "A committee appointed by Congress to verify the eligibility of candidates.",
                    "A group of supreme court justices who decide the election in case of a tie."
                ],
                correct: 1
            },
            {
                q: "What is the primary purpose of a 'Primary' election?",
                options: [
                    "To elect the President directly.",
                    "To allow parties to choose their final candidates for the general election.",
                    "To vote on local tax measures.",
                    "To decide which laws should be repealed."
                ],
                correct: 1
            },
            {
                q: "How many electoral votes are needed to win the U.S. Presidency?",
                options: ["100", "538", "270", "435"],
                correct: 2
            },
            {
                q: "What is 'Gerrymandering'?",
                options: [
                    "A type of voting machine.",
                    "The process of counting mail-in ballots.",
                    "Manipulating district boundaries to favor one party.",
                    "A ceremony held after inauguration."
                ],
                correct: 2
            },
            {
                q: "Who is responsible for overseeing elections in most U.S. states?",
                options: [
                    "The President",
                    "The Secretary of State",
                    "The Chief Justice",
                    "The Attorney General"
                ],
                correct: 1
            }
        ];

        let currentIdx = 0;
        let score = 0;
        let answers = new Array(questions.length).fill(null);

        const updateQuiz = () => {
            const q = questions[currentIdx];
            questionText.textContent = q.q;
            currentIdxEl.textContent = currentIdx + 1;
            totalQuestionsEl.textContent = questions.length;
            progressBar.style.width = `${((currentIdx + 1) / questions.length) * 100}%`;

            quizOptions.innerHTML = '';
            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                if(answers[currentIdx] === i) btn.classList.add('selected');
                
                btn.innerHTML = `
                    <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
                    <span class="opt-text">${opt}</span>
                `;
                
                btn.addEventListener('click', () => {
                    answers[currentIdx] = i;
                    document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    nextBtn.disabled = false;
                });
                quizOptions.appendChild(btn);
            });

            prevBtn.style.visibility = currentIdx === 0 ? 'hidden' : 'visible';
            nextBtn.textContent = currentIdx === questions.length - 1 ? "Finish Test" : "Next Question";
            nextBtn.disabled = answers[currentIdx] === null;
        };

        nextBtn.addEventListener('click', () => {
            if (currentIdx < questions.length - 1) {
                currentIdx++;
                updateQuiz();
            } else {
                // Show results
                score = answers.reduce((acc, ans, i) => acc + (ans === questions[i].correct ? 1 : 0), 0);
                quizCard.style.display = 'none';
                document.querySelector('.quiz-actions').style.display = 'none';
                document.querySelector('.quiz-header').style.display = 'none';
                document.querySelector('.progress-container').style.display = 'none';
                
                quizResults.style.display = 'block';
                finalScoreEl.textContent = `${score} / ${questions.length}`;
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIdx > 0) {
                currentIdx--;
                updateQuiz();
            }
        });

        updateQuiz();
    }
});
