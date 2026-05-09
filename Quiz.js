// ==========================================
// 📝 Quiz.js : iOS 스타일 플래시카드 퀴즈 엔진
// ==========================================

export const QuizEngine = {
    data: { subjects: [], topics: [], cards: [] },
    currentSubjectId: null,
    currentTopicId: null,
    session: [],
    currentIndex: 0,
    score: 0,
    isRevealed: false,
    
    matchTimer: null,
    matchStartTime: 0,
    matchPairsFound: 0,
    matchTotalPairs: 0,
    matchSelected: [],
    matchDeck: [],
    matchQueue: [],
    matchScope: 'subject',
    
    // 1. 초기 데이터 로드 (app.js에서 로그인 시 호출)
    async init() {
        let saved = window.getL('myQuizzes');
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                // 아주 오래된 1세대 (단순 배열) 데이터 마이그레이션
                if (Array.isArray(parsed)) {
                    let tId = 't_default';
                    this.data = {
                        subjects: [{ id: 's_default', name: '기본 과목' }],
                        topics: [{ id: tId, subjectId: 's_default', name: '기본 주제' }],
                        cards: parsed.map(c => ({ id: c.id, topicId: tId, question: c.topic, answer: c.acronym, explanation: c.explanation }))
                    };
                } else {
                    this.data = parsed;
                    if (!this.data.topics) this.data.topics = [];
                    
                    // 2세대 (과목-문제 구조) ➔ 3세대 (과목-주제-문제 구조) 마이그레이션
                    this.data.cards.forEach(c => {
                        if (c.subjectId && !c.topicId) {
                            let t = this.data.topics.find(t => t.subjectId === c.subjectId && t.name === "기본 주제");
                            if (!t) {
                                t = { id: 't_' + c.subjectId, subjectId: c.subjectId, name: "기본 주제" };
                                this.data.topics.push(t);
                            }
                            c.topicId = t.id;
                            c.question = c.topic;
                            c.answer = c.acronym;
                            delete c.subjectId; delete c.topic; delete c.acronym;
                        }
                    });
                }
            } catch(e) {
                this.data = { subjects: [], topics: [], cards: [] };
            }
        } else {
            this.data = { subjects: [], topics: [], cards: [] };
        }
        
        if (!this.data.subjects) this.data.subjects = [];
        if (!this.data.topics) this.data.topics = [];
        if (!this.data.cards) this.data.cards = [];
        
        this.renderDashboard();
    },

    saveData() {
        window.setL('myQuizzes', JSON.stringify(this.data));
        if(window.triggerAutoSync) window.triggerAutoSync(); // Firebase 동기화
    },

    initDragAndDrop(containerId, itemSelector, onSave) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const getDragAfterElement = (y) => {
            const draggables = [...container.querySelectorAll(`${itemSelector}:not(.dragging)`)];
            return draggables.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) { return { offset: offset, element: child }; }
                else { return closest; }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        };

        const saveOrder = () => {
            const newOrderIds = Array.from(container.querySelectorAll(itemSelector)).map(el => el.dataset.id);
            onSave(newOrderIds);
        };

        let draggedEl = null;

        container.addEventListener('dragstart', e => {
            if (e.target.classList.contains(itemSelector.substring(1))) {
                draggedEl = e.target;
                draggedEl.classList.add('dragging');
            }
        });

        container.addEventListener('dragend', () => {
            if(draggedEl) draggedEl.classList.remove('dragging');
            draggedEl = null;
            saveOrder();
        });

        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(e.clientY);
            if (draggedEl) {
                if (afterElement == null) container.appendChild(draggedEl);
                else container.insertBefore(draggedEl, afterElement);
            }
        });
    },

    onSubjectOrderChange(newOrderIds) {
        this.data.subjects.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
        this.saveData();
    },

    onTopicOrderChange(newOrderIds) {
        this.data.topics.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
        this.saveData();
    },

    // 2. 과목 관리
    renderDashboard() {
        const container = document.getElementById('quiz-subject-list');
        if(!container) return;
        
        if(this.data.subjects.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:50px 20px; color:var(--text-muted); font-size:15px; font-weight:600; line-height:1.6; background:var(--surface); border-radius:24px; border:1px dashed var(--border-color);">아직 만들어진 과목이 없습니다.<br>우측 상단의 <span style="color:var(--primary); font-weight:bold;">+ 버튼</span>을 눌러 추가해보세요!</div>`;
            return;
        }

        let html = '';
        this.data.subjects.forEach(sub => {
            let topicIds = this.data.topics.filter(t => t.subjectId === sub.id).map(t => t.id);
            let cardCount = this.data.cards.filter(c => topicIds.includes(c.topicId)).length;
            html += `
                <div class="quiz-subject-card" draggable="true" data-id="${sub.id}" onclick="window.app.playSfx('pop'); window.QuizEngine.openSubject('${sub.id}')">
                    <div style="display:flex; align-items:center; gap:12px; flex-grow:1; min-width:0;">
                        <span class="drag-handle" style="cursor:grab; font-size:20px; opacity:0.4; touch-action:none;">☰</span>
                        <div style="flex-grow:1; min-width:0;">
                            <div style="font-size:18px; font-weight:900; color:var(--text-main); margin-bottom:6px; letter-spacing:-0.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${window.Utils.escapeHTML(sub.name)}</div>
                            <div style="font-size:13px; color:var(--text-muted); font-weight:700;">주제 ${topicIds.length}개 · 총 ${cardCount}문제</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button class="qz-icon-btn danger" onclick="event.stopPropagation(); window.QuizEngine.deleteSubject('${sub.id}')">🗑️</button>
                        <span style="color:var(--text-muted); opacity:0.5;">▶</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        this.initDragAndDrop('quiz-subject-list', '.quiz-subject-card', this.onSubjectOrderChange.bind(this));
    },

    addSubject() {
        const input = document.getElementById('qz-new-sub-name');
        if(!input) return;
        const name = input.value.trim();
        if(!name) return window.showToast ? window.showToast("과목 이름을 입력해주세요!") : alert("과목 이름을 입력해주세요!");
        
        this.data.subjects.push({ id: 's_' + Date.now(), name: name });
        this.saveData();
        
        input.value = '';
        if(window.app && window.app.closeModal) window.app.closeModal('quiz-add-sub-modal');
        if(window.showToast) window.showToast("✅ 새 과목이 추가되었습니다.");
        this.renderDashboard();
    },

    deleteSubject(id) {
        if(!confirm("이 과목과 내부의 모든 주제 및 문제를 삭제할까요?")) return;
        if(window.SFX) window.SFX.play('tap');
        let tIds = this.data.topics.filter(t => t.subjectId === id).map(t => t.id);
        this.data.subjects = this.data.subjects.filter(s => s.id !== id);
        this.data.topics = this.data.topics.filter(t => t.subjectId !== id);
        this.data.cards = this.data.cards.filter(c => !tIds.includes(c.topicId));
        this.saveData();
        this.renderDashboard();
    },

    // 3. 주제 관리 (특정 과목 내)
    openSubject(id) {
        this.currentSubjectId = id;
        const sub = this.data.subjects.find(s => s.id === id);
        if(!sub) return;
        
        document.getElementById('qz-current-subject-title').innerText = sub.name;
        this.renderTopics();
        if(window.app && window.app.switchView) window.app.switchView('quiz-subject');
    },

    renderTopics() {
        const container = document.getElementById('quiz-topics-container');
        if(!container) return;
        
        const topics = this.data.topics.filter(t => t.subjectId === this.currentSubjectId);
        document.getElementById('qz-topic-count').innerText = `${topics.length}개`;
        
        if(topics.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-size:14px; font-weight:600; background:var(--bg-sec); border-radius:20px;">이 과목에 등록된 세부 주제가 없습니다.<br><b style="color:var(--primary);">+ 버튼</b>을 눌러 주제를 만들어보세요!</div>`;
            return;
        }

        let html = '';
        topics.forEach(t => {
            let cCount = this.data.cards.filter(c => c.topicId === t.id).length;
            html += `
                <div class="quiz-subject-card" draggable="true" data-id="${t.id}" style="box-shadow: 0 4px 15px rgba(0,0,0,0.02); padding: 16px 20px;" onclick="window.app.playSfx('pop'); window.QuizEngine.openTopic('${t.id}')">
                    <div style="display:flex; align-items:center; gap:12px; flex-grow:1; min-width:0;">
                        <span class="drag-handle" style="cursor:grab; font-size:20px; opacity:0.4; touch-action:none;">☰</span>
                        <div style="flex-grow:1; min-width:0;">
                            <div style="font-size:16px; font-weight:800; color:var(--text-main); margin-bottom:4px; letter-spacing:-0.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${window.Utils.escapeHTML(t.name)}</div>
                            <div style="font-size:12px; color:var(--primary); font-weight:700;">문제 ${cCount}개</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button class="qz-icon-btn danger" style="width:30px; height:30px; font-size:14px;" onclick="event.stopPropagation(); window.QuizEngine.deleteTopic('${t.id}')">🗑️</button>
                        <span style="color:var(--text-muted); opacity:0.5;">▶</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        this.initDragAndDrop('quiz-topics-container', '.quiz-subject-card', this.onTopicOrderChange.bind(this));
    },

    addTopic() {
        const input = document.getElementById('qz-new-topic-name');
        if(!input) return;
        const name = input.value.trim();
        if(!name) return window.showToast ? window.showToast("주제 이름을 입력해주세요!") : alert("입력 오류");
        
        // 💡 [버그 픽스] topics 배열이 비어있으면 초기화
        if (!this.data.topics) this.data.topics = [];
        
        this.data.topics.push({ id: 't_' + Date.now(), subjectId: this.currentSubjectId, name: name });
        this.saveData();
        
        input.value = '';
        if(window.app && window.app.closeModal) window.app.closeModal('quiz-add-topic-modal');
        if(window.showToast) window.showToast("✅ 새 주제가 추가되었습니다.");
        this.renderTopics();
    },
    
    deleteTopic(id) {
        if(!confirm("이 주제와 내부의 모든 문제를 삭제할까요?")) return;
        if(window.SFX) window.SFX.play('tap');
        this.data.topics = this.data.topics.filter(t => t.id !== id);
        this.data.cards = this.data.cards.filter(c => c.topicId !== id);
        this.saveData();
        this.renderTopics();
    },

    // 4. 문제 관리 (특정 주제 내)
    openTopic(id) {
        this.currentTopicId = id;
        const t = this.data.topics.find(t => t.id === id);
        if(!t) return;
        
        document.getElementById('qz-current-topic-title').innerText = t.name;
        this.renderTopicCards();
        if(window.app && window.app.switchView) window.app.switchView('quiz-topic');
    },
    
    renderTopicCards() {
        const container = document.getElementById('quiz-cards-container');
        if(!container) return;
        
        const cards = this.data.cards.filter(c => c.topicId === this.currentTopicId);
        document.getElementById('qz-card-count').innerText = `${cards.length}개`;
        
        if(cards.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-size:14px; font-weight:600; background:var(--bg-sec); border-radius:20px;">이 주제에 등록된 문제가 없습니다.<br><b style="color:var(--primary);">+ 버튼</b>을 눌러 문제를 만들어보세요!</div>`;
            return;
        }

        let html = '';
        cards.forEach((q, idx) => {
            let cor = q.correctCount || 0;
            let incor = q.incorrectCount || 0;
            let typeBadge = q.cardType === 'blank' 
                ? `<span style="background:rgba(245,158,11,0.1); color:#f59e0b; padding:2px 6px; border-radius:4px; font-size:10px; margin-right:6px;">📝 빈칸</span>` 
                : `<span style="background:rgba(0,149,246,0.1); color:var(--primary); padding:2px 6px; border-radius:4px; font-size:10px; margin-right:6px;">🔤 단답</span>`;
            
            // 🧠 Anki 망각 곡선 상태 UI
            let statusText = "🆕 새 문제";
            if (q.nextReview) {
                let diffHours = (q.nextReview - Date.now()) / (1000 * 60 * 60);
                if (diffHours <= 0) statusText = "🚨 복습 필요";
                else if (diffHours < 24) statusText = `⏳ ${Math.ceil(diffHours)}h 후 복습`;
                else statusText = `⏳ ${Math.ceil(diffHours / 24)}일 후 복습`;
            }
            let mastery = q.reps ? `(숙련도 Lv.${q.reps})` : "";

            html += `
                <div class="quiz-list-item" style="flex-direction:column; align-items:stretch;" onclick="window.app.playSfx('pop'); const exp = this.querySelector('.q-exp-box'); exp.style.display = exp.style.display === 'none' ? 'block' : 'none';">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div style="flex-grow:1; padding-right:15px; min-width:0;">
                            <div style="font-size:15px; font-weight:800; color:#ef4444; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${typeBadge}${idx + 1}. ${window.Utils.escapeHTML(q.question.replace(/\n/g, ' '))}</div>
                            <div style="font-size:13px; color:var(--primary); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${window.Utils.escapeHTML(q.answer.replace(/\n/g, ' '))}</div>
                            <div style="display:flex; gap:8px; align-items:center; margin-top:10px; flex-wrap:wrap;">
                                <span style="font-size:11px; padding:4px 8px; border-radius:6px; background:var(--bg); border:1px solid var(--border-color); font-weight:800; color:var(--text-muted);">${statusText} ${mastery}</span>
                                <span style="font-size:11px; color:var(--text-muted); font-weight:700;">⭕ ${cor} | ❌ ${incor}</span>
                            </div>
                        </div>
                        <div style="display:flex; gap:6px; flex-shrink:0;">
                            <button class="qz-icon-btn" style="background:rgba(0,149,246,0.1); color:var(--primary);" onclick="event.stopPropagation(); window.QuizEngine.openEditCardModal('${q.id}')">✏️</button>
                            <button class="qz-icon-btn danger" onclick="event.stopPropagation(); window.QuizEngine.deleteCard('${q.id}')">🗑️</button>
                        </div>
                    </div>
                    <div class="q-exp-box" style="display:none; margin-top:12px; padding-top:12px; border-top:1px dashed var(--border-color); font-size:13px; color:var(--text-muted); line-height:1.5; word-break:keep-all;">
                        ${q.explanation ? window.Utils.escapeHTML(q.explanation).replace(/\n/g, '<br>') : '추가 해설이 없습니다.'}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    toggleCardTypeUI() {
        const type = document.getElementById('qz-card-type').value;
        const isBlank = type === 'blank';
        document.getElementById('qz-topic').placeholder = isBlank ? "문제 내용 (빈칸은 ( ) 로 표시, 줄바꿈 가능)" : "질문 내용 (예: 고려의 왕 순서)";
        document.getElementById('qz-acronym').placeholder = isBlank ? "정답 및 해설 (줄바꿈 가능)" : "정답 / 핵심 키워드 (예: 태혜정광경성목)";
    },

    openAddCardModal() {
        this.editingCardId = null;
        document.getElementById('qz-card-modal-title').innerText = "새 문제 만들기";
        document.getElementById('qz-card-save-btn').innerText = "이 주제에 문제 추가";
        document.getElementById('qz-card-type').value = 'acronym';
        this.toggleCardTypeUI();
        document.getElementById('qz-topic').value = '';
        document.getElementById('qz-acronym').value = '';
        document.getElementById('qz-exp').value = '';
        window.app.playSfx('pop');
        document.getElementById('quiz-add-card-modal').style.display='flex';
        document.body.style.overflow='hidden';
    },

    openEditCardModal(id) {
        this.editingCardId = id;
        const q = this.data.cards.find(c => c.id === id);
        if(!q) return;
        document.getElementById('qz-card-modal-title').innerText = "문제 수정";
        document.getElementById('qz-card-save-btn').innerText = "수정 완료";
        document.getElementById('qz-card-type').value = q.cardType || 'acronym';
        this.toggleCardTypeUI();
        document.getElementById('qz-topic').value = q.question;
        document.getElementById('qz-acronym').value = q.answer;
        document.getElementById('qz-exp').value = q.explanation || '';
        document.getElementById('quiz-add-card-modal').style.display='flex';
        document.body.style.overflow='hidden';
    },

    saveCard() {
        const cardType = document.getElementById('qz-card-type').value;
        const topic = document.getElementById('qz-topic').value.trim();
        const acronym = document.getElementById('qz-acronym').value.trim();
        const exp = document.getElementById('qz-exp').value.trim();

        if(!topic || !acronym) return window.showToast ? window.showToast("문제와 정답을 입력해주세요!") : alert("입력 오류");

        if (this.editingCardId) {
            const q = this.data.cards.find(c => c.id === this.editingCardId);
            if (q) {
                q.cardType = cardType; q.question = topic; q.answer = acronym; q.explanation = exp;
                if(window.showToast) window.showToast("✅ 문제가 수정되었습니다.");
            }
        } else {
            const newQuiz = {
                id: 'q_' + Date.now(),
                topicId: this.currentTopicId,
                cardType: cardType,
                question: topic,
                answer: acronym,
                explanation: exp,
                correctCount: 0,
                incorrectCount: 0
            };
            if (!this.data.cards) this.data.cards = [];
            this.data.cards.push(newQuiz);
            if(window.showToast) window.showToast("✅ 문제가 추가되었습니다.");
        }
        
        this.saveData();
        
        // 입력 폼 리셋
        document.getElementById('qz-topic').value = '';
        document.getElementById('qz-acronym').value = '';
        document.getElementById('qz-exp').value = '';
        
        if(window.app && window.app.closeModal) window.app.closeModal('quiz-add-card-modal');
        this.renderTopicCards();
        this.renderDashboard(); // ✨ 대시보드의 문제 개수 즉각 동기화
    },

    deleteCard(id) {
        if(!confirm("이 문제를 삭제할까요?")) return;
        if(window.SFX) window.SFX.play('tap');
        this.data.cards = this.data.cards.filter(c => c.id !== id);
        this.saveData();
        this.renderTopicCards();
        this.renderDashboard(); // ✨ 대시보드의 문제 개수 즉각 동기화
    },

    // ✨ 엑셀 다중 줄바꿈 셀 완벽 파싱 엔진 (TSV)
    parseTSV(text) {
        let rows = []; let curRow = []; let curCell = ""; let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < text.length && text[i + 1] === '"') { curCell += '"'; i++; } 
                    else { inQuotes = false; }
                } else { curCell += char; }
            } else {
                if (char === '"') { inQuotes = true; } 
                else if (char === '\t') { curRow.push(curCell); curCell = ""; } 
                else if (char === '\n' || char === '\r') {
                    if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++;
                    curRow.push(curCell); rows.push(curRow); curRow = []; curCell = "";
                } 
                else { curCell += char; }
            }
        }
        if (curCell || curRow.length > 0) { curRow.push(curCell); rows.push(curRow); }
        return rows;
    },

    // ✨ 구글 스프레드시트 / 엑셀 일괄 붙여넣기 파싱 로직
    importFromSpreadsheet() {
        const textArea = document.getElementById('qz-import-data');
        if(!textArea) return;
        const rawData = textArea.value.trim();
        if(!rawData) return window.showToast ? window.showToast("데이터를 붙여넣어 주세요!") : alert("데이터 없음");

        const importType = document.getElementById('qz-import-type').value;
        const rows = this.parseTSV(rawData);
        let addedCount = 0;

        // 🐛 잠재적 버그 픽스: 과목 탭에서 바로 붙여넣기를 눌렀을 경우, 기본 주제를 자동으로 찾아/생성해서 배정
        let targetTopicId = this.currentTopicId;
        const subjectViewEl = document.getElementById('quiz-subject-view');
        if (subjectViewEl && subjectViewEl.style.display === 'flex') {
            let defaultTopic = this.data.topics.find(t => t.subjectId === this.currentSubjectId && t.name === "일괄 추가된 문제");
            if (!defaultTopic) {
                defaultTopic = { id: 't_' + Date.now(), subjectId: this.currentSubjectId, name: "일괄 추가된 문제" };
                this.data.topics.push(defaultTopic);
            }
            targetTopicId = defaultTopic.id;
        }

        rows.forEach(cols => {
            if (cols.length >= 2) {
                const topic = cols[0].trim();
                const acronym = cols[1].trim();
                const exp = cols[2] ? cols[2].trim() : ""; 

                if (topic && acronym) {
                    if (!this.data.cards) this.data.cards = [];
                    this.data.cards.push({
                        id: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
                        topicId: targetTopicId,
                        cardType: importType,
                        question: topic,
                        answer: acronym,
                        explanation: exp
                    });
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            this.saveData();
            if(window.showToast) window.showToast(`✅ ${addedCount}개의 문제가 일괄 추가되었습니다!`);
            textArea.value = '';
            if(window.app && window.app.closeModal) window.app.closeModal('quiz-import-modal');
            if(this.renderTopicCards) this.renderTopicCards();
            if(this.renderTopics) this.renderTopics();
            this.renderDashboard();
        } else {
            if(window.showToast) window.showToast("형식에 맞는 데이터를 찾지 못했습니다. 탭(Tab)으로 구분된 표 데이터인지 확인해주세요.");
        }
    },

    // 5. 플래시카드 학습 세션 시작
    startSession(scope = 'topic', mode = 'smart') {
        // 🔄 진행 중인 세션 복구 (Resume)
        if (this.data.activeSession && this.data.activeSession.sessionIds) {
            let restoredSession = this.data.activeSession.sessionIds.map(id => this.data.cards.find(c => c.id === id)).filter(Boolean);
            if (restoredSession.length > 0 && this.data.activeSession.currentIndex < restoredSession.length) {
                if (confirm("이전에 진행 중이던 학습이 있습니다. 이어서 하시겠습니까?\n(취소를 누르면 처음부터 새로운 세션을 시작합니다.)")) {
                    this.session = restoredSession;
                    this.currentIndex = this.data.activeSession.currentIndex;
                    this.score = this.data.activeSession.score || 0;
                    this.sessionMode = this.data.activeSession.sessionMode || 'smart';
                    if(window.app && window.app.switchView) window.app.switchView('quiz-player');
                    this.loadCurrentQuestion();
                    return;
                }
            }
        }
        
        this.sessionMode = mode;
        let cards = [];
        if (scope === 'subject') {
            let tIds = this.data.topics.filter(t => t.subjectId === this.currentSubjectId).map(t => t.id);
            cards = this.data.cards.filter(c => tIds.includes(c.topicId));
        } else {
            cards = this.data.cards.filter(c => c.topicId === this.currentTopicId);
        }
        
        if(cards.length === 0) return window.showToast ? window.showToast("등록된 문제가 없습니다!") : alert("문제 없음");
        
        if (mode === 'smart') {
            // 🧠 스마트 학습 (Anki 망각 곡선 알고리즘 도입)
            const now = Date.now();
            let dueCards = cards.filter(c => !c.nextReview || c.nextReview <= now);
            
            if (dueCards.length === 0) {
                return window.showToast ? window.showToast("🎉 완벽합니다! 현재 복습할 문제가 없습니다. (단어장 모드로 전체를 볼 수 있습니다)") : alert("복습 완료");
            }
            
            // 🔥 Chunking: 최대 30개(복습 20 + 새 문제 10)씩 끊어서 학습
            let newCards = dueCards.filter(c => !c.reps && !c.isLearning).slice(0, 10);
            let reviewCards = dueCards.filter(c => c.reps > 0 || c.isLearning).sort((a,b) => (a.nextReview||0) - (b.nextReview||0)).slice(0, 20);
            
            this.session = [...reviewCards, ...newCards].sort(() => Math.random() - 0.5);
        } else {
            // 👀 단어장 모드: 랜덤 셔플
            this.session = [...cards].sort(() => Math.random() - 0.5);
        }
        
        this.currentIndex = 0;
        this.score = 0;
        
        // 세션 상태 저장
        this.data.activeSession = {
            sessionIds: this.session.map(c => c.id),
            currentIndex: this.currentIndex,
            score: this.score,
            sessionMode: this.sessionMode
        };
        this.saveData();
        
        // 🎵 스마트 학습 / 단어장 모드에서도 포켓몬 BGM 재생
        if(window.BGM) {
            window.BGM.play('battle');
            let btn = document.getElementById('btn-player-bgm');
            if(btn) btn.innerText = window.BGM.isMuted ? '🔇' : '🎵';
        }
        
        if(window.app && window.app.switchView) window.app.switchView('quiz-player');
        this.loadCurrentQuestion();
    },

    loadCurrentQuestion() {
        const q = this.session[this.currentIndex];
        this.isRevealed = false;
        
        // 카드 원상복구 및 UI 초기화
        const flashcard = document.getElementById('quiz-flashcard');
        if(flashcard) flashcard.classList.remove('flipped');
        
        document.getElementById('quiz-reveal-btn').style.display = 'block';
        document.getElementById('quiz-action-btns').style.display = 'none';
        document.getElementById('quiz-next-only-btn').style.display = 'none';
        
        // 진행률 표시
        document.getElementById('quiz-progress-text').innerText = `${this.currentIndex + 1} / ${this.session.length}`;
        const pct = ((this.currentIndex) / this.session.length) * 100;
        document.getElementById('quiz-progress-fill').style.width = `${pct}%`;

        // 🧠 Anki 3색 카운터 실시간 업데이트
        if (this.sessionMode === 'smart') {
            document.getElementById('quiz-anki-counts').style.display = 'flex';
            let remaining = this.session.slice(this.currentIndex);
            let countNew = remaining.filter(c => !c.reps && !c.isLearning).length;
            let countLearn = remaining.filter(c => c.isLearning).length; 
            let countReview = remaining.filter(c => c.reps > 0 && !c.isLearning).length;
            
            document.getElementById('q-cnt-new').innerText = countNew;
            document.getElementById('q-cnt-learn').innerText = countLearn;
            document.getElementById('q-cnt-review').innerText = countReview;
        } else {
            document.getElementById('quiz-anki-counts').style.display = 'none';
        }

        const isBlank = q.cardType === 'blank';

        // 앞면 데이터
        const topicEl = document.getElementById('q-play-topic');
        topicEl.innerHTML = window.Utils.escapeHTML(q.question).replace(/\n/g, '<br>');
        topicEl.style.textAlign = isBlank ? 'left' : 'center';
        topicEl.style.fontSize = isBlank ? '18px' : '24px';
        topicEl.style.fontWeight = isBlank ? '700' : '900';
        
        const backLabel = document.getElementById('q-play-back-label');
        if (backLabel) backLabel.innerText = isBlank ? "정답 및 해설" : "정답 / 핵심 키워드";

        // 뒷면 데이터 (정답 및 해설)
        const acronymEl = document.getElementById('q-play-acronym');
        acronymEl.innerHTML = window.Utils.escapeHTML(q.answer).replace(/\n/g, '<br>');
        acronymEl.style.textAlign = isBlank ? 'left' : 'center';
        acronymEl.style.fontSize = isBlank ? '16px' : '30px';
        acronymEl.style.fontWeight = isBlank ? '600' : '900';
        
        const expEl = document.getElementById('q-play-exp');
        if (q.explanation && q.explanation.trim() !== "") {
            expEl.innerHTML = window.Utils.escapeHTML(q.explanation).replace(/\n/g, '<br>');
            expEl.style.display = 'block';
            expEl.style.textAlign = isBlank ? 'left' : 'center';
            expEl.style.fontSize = isBlank ? '15px' : '16px';
            expEl.style.fontWeight = isBlank ? '500' : '600';
        } else {
            expEl.style.display = 'none';
        }
        
        this.updateCheerMonster();
    },
    
    // ✨ 파트너 포켓몬 응원 UI 연동
    updateCheerMonster() {
        const imgEl = document.getElementById('quiz-cheer-mon');
        const speechEl = document.getElementById('quiz-cheer-speech');
        if(!imgEl) return;

        if (!window.monsterData || !window.monsterData.displayId) {
            imgEl.style.display = 'none';
            if(speechEl) speechEl.style.display = 'none';
            return;
        }

        let m = window.monsterData.inventory.find(x => x.id === window.monsterData.displayId) || window.monsterData.inventory[0];
        if (!m || m.status === 'egg') {
            imgEl.style.display = 'none';
            if(speechEl) speechEl.style.display = 'none';
            return;
        }

        let spec = window.getMonsterSpec ? window.getMonsterSpec(m) : null;
        if (!spec) return;

        let currentStageIdx = m.selectedStage || 0;
        let pokeId = spec.pokeIds[currentStageIdx];
        let isShiny = !!m.isShiny;

        let cachedData = window.PokeAPI && window.PokeAPI.cache ? window.PokeAPI.cache[pokeId] : null;
        let sdName = cachedData && cachedData.name ? cachedData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh') : null;
        
        let imageUrl = sdName ? (isShiny ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`) : (pokeId >= 10000 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`);

        imgEl.src = imageUrl;
        imgEl.style.display = 'block';
        if(speechEl) {
            speechEl.style.display = 'block';
            const cheers = ["할 수 있어! 조금만 더 생각해봐! 🔥", "넌 최고야! 정답이 뭘까? 💡", "거의 다 왔어! 화이팅! 🚀", "천천히 생각해봐! 🧐", "나도 널 응원하고 있어! 🐾", "너의 기억력을 믿어봐! ✨"];
            speechEl.innerHTML = cheers[Math.floor(Math.random() * cheers.length)] + `<div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid var(--border-color);"></div><div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid var(--surface);"></div>`;
        }
    },

    // 5. 사용자가 생각한 후 정답 확인 클릭 (카드 뒤집기)
    revealAnswer() {
        if (this.isRevealed) return;
        this.isRevealed = true;
        
        if(window.SFX) window.SFX.play('pop');
        const flashcard = document.getElementById('quiz-flashcard');
        if(flashcard) flashcard.classList.add('flipped');
        
        // 하단 버튼 교체 (정답/오답 선택)
        document.getElementById('quiz-reveal-btn').style.display = 'none';
        if (this.sessionMode === 'smart') {
            document.getElementById('quiz-action-btns').style.display = 'flex';
        } else {
            document.getElementById('quiz-next-only-btn').style.display = 'block';
        }
    },

    // ✨ 카드를 터치해서 앞/뒷면 자유롭게 뒤집기
    toggleFlip() {
        if (!this.isRevealed) {
            this.revealAnswer();
        } else {
            if(window.SFX) window.SFX.play('pop');
            const flashcard = document.getElementById('quiz-flashcard');
            if(flashcard) flashcard.classList.toggle('flipped');
        }
    },

    // 6. 스스로 O/X 채점 후 다음으로
    submitAnswer(isCorrect) {
        if (!this.isRevealed) return;
        
        const q = this.session[this.currentIndex];
        
        // Anki SRS 초기값 세팅
        if (q.reps === undefined) q.reps = 0; // 연속 정답 횟수
        if (q.ease === undefined) q.ease = 2.5; // 난이도 배수
        if (q.interval === undefined) q.interval = 0; // 복습 간격(일)

        // 🔥 현재 세션에서 이미 틀렸던 문제인지 체크 (중복 점수 부여 및 간격 비정상 팽창 방지)
        let isRepeatedInSession = this.session.filter((c, idx) => c.id === q.id && idx < this.currentIndex).length > 0;

        if (isCorrect) {
            // 정답 처리 (SM-2 알고리즘)
            if (!isRepeatedInSession) {
                if (q.reps === 0) q.interval = 1; // 내일 복습
                else if (q.reps === 1) q.interval = 3; // 3일 후 복습
                else q.interval = Math.round(q.interval * q.ease); // 배수만큼 간격 팽창
                
                q.reps++;
                q.ease = Math.min(3.0, q.ease + 0.1); // 쉬움: 배수 증가
                q.correctCount = (q.correctCount || 0) + 1;
                this.score++;
            } else {
                // 방금 틀려서 뒤로 밀린 카드를 마침내 맞춘 경우 -> 다시 1단계부터 재시작
                q.interval = 1; 
                q.reps = 1; 
            }
            q.isLearning = false; // 학습 단계 졸업
            
            if(window.SFX) window.SFX.play('success');
        } else {
            // 오답 처리
            q.reps = 0;
            q.interval = 0; // 즉시 복습 요망
            q.ease = Math.max(1.3, q.ease - 0.2); // 어려움: 배수 감소
            q.isLearning = true; // 오답 노트(학습 큐)로 강등
            
            if (!isRepeatedInSession) {
                q.incorrectCount = (q.incorrectCount || 0) + 1;
            }

            if(window.SFX) window.SFX.play('tap');
            
            // 🔥 Anki 핵심: 틀린 문제는 오늘 맞출 때까지 큐의 맨 뒤로 보내서 무한 반복시킴
            if (this.sessionMode === 'smart') {
                this.session.push(q);
                
                // 복구용 세션 ID 목록에도 추가
                if (this.data.activeSession && this.data.activeSession.sessionIds) {
                    this.data.activeSession.sessionIds.push(q.id);
                }
            }
        }
        
        // 다음 복습 시간 도장 찍기
        q.nextReview = Date.now() + (q.interval * 24 * 60 * 60 * 1000);
        this.saveData(); // 학습 결과 누적 저장
        this.nextQuestion();
    },

    nextQuestion(skipScore = false) {
        if (skipScore && window.SFX) window.SFX.play('tap'); // 단어장 모드 넘기기 소리
        this.currentIndex++;
        if (this.currentIndex >= this.session.length) {
            // 결과 화면 처리
            document.getElementById('quiz-progress-fill').style.width = `100%`;
            this.data.activeSession = null; // 완료 시 세션 초기화
            this.saveData();
            
            setTimeout(() => {
                if(window.BGM) window.BGM.stop();
                if (this.sessionMode === 'smart') {
                    alert(`수고하셨습니다!\n총 ${this.session.length}문제 중 ${this.score}문제를 맞췄습니다.\n정답률: ${Math.round((this.score/this.session.length)*100)}%`);
                } else {
                    alert(`수고하셨습니다!\n단어장 1회독을 완료했습니다. 👏`);
                }
                if(window.app && window.app.switchView) window.app.switchView('quiz-dashboard');
            }, 300);
        } else {
            // 현재 인덱스와 점수 진행 상황 저장
            if (this.data.activeSession) {
                this.data.activeSession.currentIndex = this.currentIndex;
                this.data.activeSession.score = this.score;
                this.saveData();
            }
            this.loadCurrentQuestion();
        }
    },
    
    // 📊 중간 통계 보기 로직
    showSessionStats() {
        if(window.SFX) window.SFX.play('pop');
        const total = this.session.length;
        const done = this.currentIndex;
        const correct = this.score;
        const incorrect = done - correct;
        const accuracy = done > 0 ? Math.round((correct / done) * 100) : 0;
        
        alert(`📊 현재 세션 진행 통계\n\n- 전체 문제: ${total}개\n- 진행 완료: ${done}개\n- 남은 문제: ${total - done}개\n\n⭕ 맞춘 문제: ${correct}개\n❌ 틀린 문제: ${incorrect}개\n🎯 현재 정답률: ${accuracy}%`);
    },

    // 📊 전체 통계 보기 로직 (Anki)
    showStats(scope = 'topic') {
        if(window.SFX) window.SFX.play('pop');
        let cards = [];
        if (scope === 'subject') {
            let tIds = this.data.topics.filter(t => t.subjectId === this.currentSubjectId).map(t => t.id);
            cards = this.data.cards.filter(c => tIds.includes(c.topicId));
        } else {
            cards = this.data.cards.filter(c => c.topicId === this.currentTopicId);
        }

        let total = cards.length;
        let mature = cards.filter(c => c.interval >= 21).length; // 21일 이상 벌어진 장기기억
        let young = cards.filter(c => c.reps > 0 && c.interval < 21 && !c.isLearning).length;
        let learn = cards.filter(c => c.isLearning).length; // 최근에 틀렸거나 0단계
        let newCards = cards.filter(c => !c.reps && !c.isLearning).length; // 한 번도 안 봄

        document.getElementById('st-total').innerText = total;
        document.getElementById('st-mature').innerText = mature;
        document.getElementById('st-young').innerText = young;
        document.getElementById('st-learn').innerText = learn;
        document.getElementById('st-new').innerText = newCards;

        // 🍩 도넛 차트 SVG 업데이트
        if (total > 0) {
            let pMature = (mature / total) * 100;
            let pYoung = (young / total) * 100;
            let pLearn = (learn / total) * 100;
            let pNew = (newCards / total) * 100;

            // Stroke-dasharray = "칠할비율 나머지" / Stroke-dashoffset = 시작점(시계역방향)
            let off1 = 0;
            document.getElementById('ds-mature').setAttribute('stroke-dasharray', `${pMature} ${100 - pMature}`);
            document.getElementById('ds-mature').setAttribute('stroke-dashoffset', `${off1}`);
            let off2 = 100 - pMature;
            document.getElementById('ds-young').setAttribute('stroke-dasharray', `${pYoung} ${100 - pYoung}`);
            document.getElementById('ds-young').setAttribute('stroke-dashoffset', `${off2}`);
            let off3 = 100 - (pMature + pYoung);
            document.getElementById('ds-learn').setAttribute('stroke-dasharray', `${pLearn} ${100 - pLearn}`);
            document.getElementById('ds-learn').setAttribute('stroke-dashoffset', `${off3}`);
            let off4 = 100 - (pMature + pYoung + pLearn);
            document.getElementById('ds-new').setAttribute('stroke-dasharray', `${pNew} ${100 - pNew}`);
            document.getElementById('ds-new').setAttribute('stroke-dashoffset', `${off4}`);

            document.getElementById('ds-center-text').textContent = `${Math.round(pMature + pYoung)}%`;
        }

        document.getElementById('quiz-stats-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    // 8. 짝맞추기(Match) 게임 (서술형 제외 및 무한 리필)
    startMatchGame(scope = 'subject') {
        this.matchScope = scope;
        let cards = [];
        if (scope === 'subject') {
            let tIds = this.data.topics.filter(t => t.subjectId === this.currentSubjectId).map(t => t.id);
            cards = this.data.cards.filter(c => tIds.includes(c.topicId));
        } else {
            cards = this.data.cards.filter(c => c.topicId === this.currentTopicId);
        }
        
        // ⛔ 빈칸/서술형 문제는 게임에서 자동 제외
        cards = cards.filter(c => c.cardType !== 'blank');
        
        if (cards.length < 2) return window.showToast ? window.showToast("게임에는 최소 2개의 단답형/두문자 카드가 필요합니다.") : alert("문제 부족");
        
        this.matchQueue = [...cards].sort(() => Math.random() - 0.5);
        let initialCards = this.matchQueue.splice(0, 8);
        
        let deck = [];
        initialCards.forEach(c => {
            let shortQ = c.question.replace(/\n/g, ' ');
            let shortA = c.answer.replace(/\n/g, ' ');
            if (shortQ.length > 35) shortQ = shortQ.substring(0, 35) + '...';
            if (shortA.length > 35) shortA = shortA.substring(0, 35) + '...';
            
            deck.push({ id: c.id, text: shortQ, type: 'Q', color: '#ef4444' });
            deck.push({ id: c.id, text: shortA, type: 'A', color: 'var(--primary)' });
        });
        this.matchDeck = deck.sort(() => Math.random() - 0.5);
        
        this.matchSelected = [];
        this.matchPairsFound = 0;
        this.matchTotalPairs = cards.length;
        this.matchStartTime = Date.now();
        this.matchCombo = 0;
        
        const cheerEl = document.getElementById('quiz-match-cheer');
        if (cheerEl) cheerEl.style.display = 'none';
        
        const banner = document.getElementById('quiz-match-info-banner');
        if (banner) banner.style.display = 'none';
        
        if (this.matchTimer) clearInterval(this.matchTimer);
        this.matchTimer = setInterval(() => {
            let elapsed = Math.floor((Date.now() - this.matchStartTime) / 1000);
            let timeEl = document.getElementById('quiz-match-timer');
            if (timeEl) timeEl.innerText = `${Math.floor(elapsed/60)}분 ${elapsed%60}초`;
        }, 1000);
        
        let container = document.getElementById('quiz-match-grid');
        if(container) {
            container.innerHTML = this.matchDeck.map((item, idx) => `<div class="match-card" id="mc_${idx}" onclick="window.QuizEngine.selectMatchCard(${idx})" style="color: ${item.color};">${window.Utils.escapeHTML(item.text)}</div>`).join('');
        }
        if(window.BGM) {
            window.BGM.play('battle');
            let btn = document.getElementById('btn-match-bgm');
            if(btn) btn.innerText = window.BGM.isMuted ? '🔇' : '🎵';
        }
        if(window.app && window.app.switchView) window.app.switchView('quiz-match');
    },
    
    selectMatchCard(idx) {
        if (this.matchSelected.length === 2) return;
        let el = document.getElementById(`mc_${idx}`);
        if (!el || el.classList.contains('selected') || el.classList.contains('matched')) return;
        
        if(window.SFX) window.SFX.play('tap');
        el.classList.add('selected');
        this.matchSelected.push({ idx, item: this.matchDeck[idx] });
        
        if (this.matchSelected.length === 2) {
            let [c1, c2] = this.matchSelected;
            if (c1.item.id === c2.item.id && c1.item.type !== c2.item.type) {
                setTimeout(() => {
                    if(window.SFX) window.SFX.play('success');
                    document.getElementById(`mc_${c1.idx}`).className = 'match-card matched';
                    document.getElementById(`mc_${c2.idx}`).className = 'match-card matched';
                    this.matchPairsFound++;
                    this.matchSelected = [];
                    if (this.matchPairsFound === this.matchTotalPairs) {
                        clearInterval(this.matchTimer);
                        if(window.BGM) window.BGM.stop();
                        let elapsed = Math.floor((Date.now() - this.matchStartTime) / 1000);
                        setTimeout(() => { 
                            alert(`🎉 전체 ${this.matchTotalPairs}쌍 올 클리어!\n소요 시간: ${Math.floor(elapsed/60)}분 ${elapsed%60}초`); 
                            if(window.app) window.app.switchView(this.matchScope === 'subject' ? 'quiz-subject' : 'quiz-topic'); 
                        }, 500);
                    } else if (this.matchQueue && this.matchQueue.length > 0) {
                        // 큐에 남은 카드가 있으면 빈 자리에 리필 (Refill)
                        let nextCard = this.matchQueue.pop();
                        let shortQ = nextCard.question.replace(/\n/g, ' ');
                        let shortA = nextCard.answer.replace(/\n/g, ' ');
                        if (shortQ.length > 35) shortQ = shortQ.substring(0, 35) + '...';
                        if (shortA.length > 35) shortA = shortA.substring(0, 35) + '...';
                        
                        let newItems = [
                            { id: nextCard.id, text: shortQ, type: 'Q', color: '#ef4444' },
                            { id: nextCard.id, text: shortA, type: 'A', color: 'var(--primary)' }
                        ];
                        if (Math.random() > 0.5) newItems.reverse();
                        
                        this.matchDeck[c1.idx] = newItems[0];
                        this.matchDeck[c2.idx] = newItems[1];
                        
                        setTimeout(() => {
                            let el1 = document.getElementById(`mc_${c1.idx}`);
                            let el2 = document.getElementById(`mc_${c2.idx}`);
                            if (el1 && el2) {
                                el1.innerText = newItems[0].text;
                                el2.innerText = newItems[1].text;
                                el1.style.color = newItems[0].color;
                                el2.style.color = newItems[1].color;
                                el1.classList.remove('matched');
                                el2.classList.remove('matched');
                            }
                        }, 300);
                    }
                }, 400);
            } else {
                this.matchCombo = 0;
                const cheerEl = document.getElementById('quiz-match-cheer');
                if (cheerEl) cheerEl.style.display = 'none';
                
                setTimeout(() => {
                    if(window.SFX) window.SFX.play('tap');
                    document.getElementById(`mc_${c1.idx}`).classList.remove('selected');
                    document.getElementById(`mc_${c2.idx}`).classList.remove('selected');
                    this.matchSelected = [];
                }, 600);
            }
        }
    },
    
    // ✨ 짝맞추기 콤보 응원 로직
    showMatchComboCheer() {
        const cheerEl = document.getElementById('quiz-match-cheer');
        const textEl = document.getElementById('quiz-match-combo-text');
        const monEl = document.getElementById('quiz-match-mon');
        
        if (!cheerEl || !textEl || !monEl) return;
        
        if (this.matchCombo > 1) {
            cheerEl.style.display = 'flex';
            textEl.innerText = `${this.matchCombo} COMBO! 🔥`;
            
            textEl.style.animation = 'none';
            void textEl.offsetWidth; // Reflow
            textEl.style.animation = 'combo-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            if (window.monsterData && window.monsterData.displayId) {
                let m = window.monsterData.inventory.find(x => x.id === window.monsterData.displayId) || window.monsterData.inventory[0];
                if (m && m.status !== 'egg') {
                    let spec = window.getMonsterSpec ? window.getMonsterSpec(m) : null;
                    if (spec) {
                        let currentStageIdx = m.selectedStage || 0;
                        let pokeId = spec.pokeIds[currentStageIdx];
                        let isShiny = !!m.isShiny;
                        let cachedData = window.PokeAPI && window.PokeAPI.cache ? window.PokeAPI.cache[pokeId] : null;
                        let sdName = cachedData && cachedData.name ? cachedData.name.toLowerCase().replace('-mega-x', '-megax').replace('-mega-y', '-megay').replace('mr-mime', 'mrmime').replace('ho-oh', 'hooh') : null;
                        
                        let imageUrl = sdName ? (isShiny ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${sdName}.gif` : `https://play.pokemonshowdown.com/sprites/ani/${sdName}.gif`) : (pokeId >= 10000 ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`);
                        
                        monEl.src = imageUrl;
                        monEl.style.display = 'block';
                        
                        monEl.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        monEl.style.transform = 'translateY(-20px) scale(1.15)';
                        setTimeout(() => { monEl.style.transform = 'translateY(0) scale(1)'; }, 200);
                    }
                } else {
                    monEl.style.display = 'none';
                }
            } else {
                monEl.style.display = 'none';
            }
        }
    }
};

window.QuizEngine = QuizEngine;