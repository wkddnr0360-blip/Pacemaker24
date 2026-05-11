// ==========================================
// 📢 스터디 라운지 / 게시판 시스템 (board.js)
// ==========================================
import { FirebaseEngine } from './firebase.js';

window.allPosts = []; // 검색을 위한 전체 포스트 캐시

// ✨ 인스타그램 스타일 게시판 전용 CSS 동적 주입
if (!document.getElementById('board-style')) {
    const style = document.createElement('style');
    style.id = 'board-style';
    style.innerHTML = `
        .post-text-truncate {
            display: -webkit-box;
            -webkit-line-clamp: 5;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .board-container {
            background: var(--bg);
            padding: 0 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .board-card-modern {
            background: var(--surface);
            border-radius: 28px;
            padding: 24px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.04);
            border: 1px solid var(--border-color);
            margin-bottom: 0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .board-card-modern:active {
            transform: scale(0.98);
        }
        .board-input-card {
            background: var(--surface);
            border-radius: 28px;
            padding: 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.05);
            border: 1px solid var(--border-color);
            margin: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .comment-bubble {
            background: var(--bg-sec);
            padding: 14px 18px;
            border-radius: 4px 20px 20px 20px;
            margin-top: 6px;
            display: inline-block;
            border: 1px solid var(--border-color);
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .board-menu-popup {
            display: none; position: absolute; right: 0; top: 40px; background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; z-index: 100; min-width: 140px;
        }
        .board-menu-btn {
            width: 100%; padding: 14px 16px; background: transparent; border: none; text-align: left; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.2s;
        }
        .board-menu-btn:hover { background: var(--bg-sec); }
    `;
    document.head.appendChild(style);
}

// ✨ 시간 포맷팅 (방금 전, 5분 전 등)
window.timeAgo = function(dateStr) {
    if(!dateStr) return '';
    const now = new Date();
    const past = new Date(dateStr);
    const diffSec = Math.floor((now - past) / 1000);
    if(diffSec < 60) return '방금 전';
    if(diffSec < 3600) return `${Math.floor(diffSec/60)}분 전`;
    if(diffSec < 86400) return `${Math.floor(diffSec/3600)}시간 전`;
    return `${Math.floor(diffSec/86400)}일 전`;
};

window.openBoardModal = async function() {
    document.getElementById('board-modal').style.display = 'flex';
    document.getElementById('board-header-title').innerText = "스터디 라운지";
    if (document.getElementById('board-back-btn')) document.getElementById('board-back-btn').style.visibility = 'hidden';
    const contentArea = document.getElementById('board-content-area');
    contentArea.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted); font-weight:bold;">📡 피드 수신 중...</div>';

    let res = await FirebaseEngine.getBoardList();
    if (res.success) {
        window.allPosts = res.data;
        window.renderBoardItems(window.allPosts);
    }
};

window.renderBoardItems = function(posts) {
    const contentArea = document.getElementById('board-content-area');
    
    // 전체 클릭 시 열려있는 메뉴 팝업 닫기
    contentArea.onclick = function(e) {
        if (!e.target.closest('.board-menu-trigger')) {
            document.querySelectorAll('.board-menu-popup').forEach(m => m.style.display = 'none');
        }
    };

    if (!document.getElementById('board-header-area')) {
        contentArea.innerHTML = `
            <div style="background: var(--bg); display:flex; flex-direction:column;">
                <!-- 검색바 -->
                <div class="board-search-bar" style="padding: 16px 16px 0;">
                    <div style="position:relative; width: 100%;">
                        <span style="position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:16px;">🔍</span>
                        <input type="text" id="board-search-input" placeholder="관심있는 소식을 검색해보세요" oninput="window.filterBoard(this.value)" style="width: 100%; box-sizing: border-box; background: var(--surface); border: 1px solid var(--border-color); border-radius: 20px; padding: 14px 16px 14px 44px; font-size: 15px; font-weight:600; outline: none; color: var(--text-main); font-family: inherit; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                    </div>
                </div>

                <!-- 작성 카드 -->
                <div class="board-input-card">
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--target)); display: flex; justify-content: center; align-items: center; color: white; font-weight: 900; font-size: 18px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${window.activeUser.charAt(0).toUpperCase()}</div>
                        <div style="flex-grow: 1;">
                            <textarea id="new-post-content" placeholder="현재 상태나 고민을 공유해주세요..." style="width: 100%; box-sizing: border-box; background: var(--bg-sec); border: 1px solid var(--border-color); border-radius: 16px; font-size: 15px; font-weight:600; color: var(--text-main); resize: none; overflow: hidden; min-height: 48px; outline: none; padding: 14px 16px; font-family: inherit; line-height:1.5; letter-spacing:-0.3px;" oninput="window.setL('boardDraft', this.value); this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'">${window.getL('boardDraft') || ''}</textarea>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top: 4px;">
                        <span style="font-size:13px; color:var(--primary); font-weight:800; background:rgba(0,149,246,0.1); padding:6px 12px; border-radius:12px;">#Pacemaker</span>
                        <button onclick="window.writePost()" style="background: var(--text-main); color: var(--surface); border: none; padding: 10px 24px; border-radius: 20px; font-size: 15px; font-weight: 800; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">공유하기</button>
                    </div>
                </div>
            </div>

            <!-- 피드 리스트 -->
            <div id="board-list-area" class="board-container"></div>
        `;
    }

    const listArea = document.getElementById('board-list-area');
    let html = '';

    posts.forEach(item => {
        const isMine = item.author === window.activeUser;
        let escapedContent = window.Utils.escapeHTML(item.content);
        // ✨ 줄바꿈 5줄 이상 또는 길이 180자 초과 시 더보기 활성화
        let isLong = escapedContent.length > 200 || escapedContent.split('\n').length > 6;

        html += `
            <div class="board-card-modern">
                <!-- 작성자 정보 및 메뉴 -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; position:relative;">
                    <div style="display:flex; align-items:center; gap: 12px;">
                        <div style="width: 46px; height: 46px; border-radius: 16px; background: var(--bg-sec); border: 1px solid var(--border-color); display: flex; justify-content: center; align-items: center; font-size: 20px; font-weight: 900; color: var(--text-muted);">${item.author.charAt(0).toUpperCase()}</div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: 900; font-size: 15px; color: var(--text-main); letter-spacing:-0.3px;">${item.author}</span>
                            <span style="font-size: 12px; color: var(--text-muted); font-weight: 600; margin-top: 2px;">${window.timeAgo(item.date)}</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center;">
                        ${isMine ? `
                        <button class="board-menu-trigger" style="background:none; border:none; font-size:20px; font-weight:bold; color:var(--text-muted); cursor:pointer; padding: 4px 8px; border-radius: 8px;" onclick="document.querySelectorAll('.board-menu-popup').forEach(m => { if(m.id !== 'menu-${item.id}') m.style.display = 'none'; }); const m = document.getElementById('menu-${item.id}'); m.style.display = m.style.display === 'block' ? 'none' : 'block';">⋮</button>
                        <div id="menu-${item.id}" class="board-menu-popup">
                            <button class="board-menu-btn" style="border-bottom:1px solid var(--border-color); color:var(--text-main);" onclick="window.editPostPrompt('${item.id}', '${window.Utils.escapeHTML(item.content).replace(/'/g, "\\'")}')">수정</button>
                            <button class="board-menu-btn" style="color:#ef4444;" onclick="window.deletePost('${item.id}')">삭제</button>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- 내용 (더보기 기능 적용) -->
                <div style="margin-bottom: 20px;">
                    <div id="content-text-${item.id}" class="${isLong ? 'post-text-truncate' : ''}" style="margin: 0; font-size: 16px; font-weight: 500; line-height: 1.7; letter-spacing: -0.3px; color: var(--text-main); word-break: break-word; white-space: pre-wrap;">${escapedContent}</div>
                    ${isLong ? `<button id="more-btn-${item.id}" style="background:var(--bg-sec); border:none; color:var(--text-main); padding:6px 14px; border-radius:12px; font-size:14px; margin-top:10px; cursor:pointer; font-weight:700; transition:0.2s;" onclick="document.getElementById('content-text-${item.id}').classList.remove('post-text-truncate'); this.style.display='none';">전체 보기</button>` : ''}
                </div>
                
                <!-- 액션 버튼 (좋아요, 댓글) -->
                <div style="display: flex; gap: 12px; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 16px;">
                    <button style="flex:1; background:var(--bg-sec); border:none; border-radius:16px; padding:12px 0; display:flex; justify-content:center; align-items:center; gap:8px; cursor:pointer; color:var(--text-main); transition: 0.2s; font-weight:800; font-size:15px;" onclick="window.app.playSfx('tap'); window.handleLike('${item.id}', ${item.likes || 0})">
                        <span style="font-size: 20px; line-height:1; ${item.likes > 0 ? 'color:#ef4444; animation: check-pop 0.3s;' : 'filter:grayscale(100%);'}">${item.likes > 0 ? '❤️' : '🤍'}</span> 
                        <span>${item.likes || 0}</span>
                    </button>
                    <button style="flex:1; background:var(--bg-sec); border:none; border-radius:16px; padding:12px 0; display:flex; justify-content:center; align-items:center; gap:8px; cursor:pointer; color:var(--text-main); transition: 0.2s; font-weight:800; font-size:15px;" onclick="window.app.playSfx('tap'); window.viewPost('${item.id}')">
                        <span style="font-size: 20px; line-height:1; filter:grayscale(100%);">💬</span>
                        <span>${item.comments ? item.comments.length : 0}</span>
                    </button>
                </div>
            </div>
        `;
    });
    
    if (posts.length === 0) {
        html = `<div style="text-align:center; padding: 60px 20px; color:var(--text-muted); font-size:15px; font-weight:bold; background:var(--surface); border-radius:24px;">작성된 게시물이 없습니다.<br>첫 번째 소식을 남겨보세요!</div>`;
    }
    
    listArea.innerHTML = html;
};

// 🔍 게시판 검색 필터
window.filterBoard = function(term) {
    const filtered = window.allPosts.filter(p => 
        p.content.toLowerCase().includes(term.toLowerCase()) || 
        p.author.toLowerCase().includes(term.toLowerCase())
    );
    window.renderBoardItems(filtered);
};

// 💬 상세 보기 및 댓글 기능 복구
window.viewPost = function(id) {
    const post = window.allPosts.find(p => p.id === id);
    if (!post) return window.showToast("글을 찾을 수 없습니다.");
    
    document.getElementById('board-header-title').innerText = "의견 남기기";
    const backBtn = document.getElementById('board-back-btn');
    if (backBtn) {
        backBtn.style.visibility = 'visible';
        backBtn.onclick = function() {
            window.app.playSfx('pop');
            document.getElementById('board-header-title').innerText = "스터디 라운지";
            this.style.visibility = 'hidden';
            window.renderBoardItems(window.allPosts);
        };
    }

    const contentArea = document.getElementById('board-content-area');
    let comments = post.comments || [];
    
    let html = `
        <div style="background: var(--bg); display:flex; flex-direction:column; min-height:100%;">
            <!-- 본문 카드 -->
            <div style="padding: 16px;">
                <div class="board-card-modern" style="margin:0;">
                    <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 16px;">
                        <div style="width: 46px; height: 46px; border-radius: 16px; background: linear-gradient(135deg, var(--primary), var(--target)); display: flex; justify-content: center; align-items: center; font-size: 20px; font-weight: 900; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${post.author.charAt(0).toUpperCase()}</div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: 900; font-size: 16px; color: var(--text-main); letter-spacing:-0.3px;">${window.Utils.escapeHTML(post.author)}</span>
                            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-top: 2px;">${window.timeAgo(post.date)}</span>
                        </div>
                    </div>
                    <div style="font-size: 16px; font-weight: 500; line-height: 1.7; letter-spacing: -0.3px; color: var(--text-main); word-break: break-word; white-space: pre-wrap;">${window.Utils.escapeHTML(post.content).replace(/\\n/g, '<br>')}</div>
                </div>
            </div>
            
            <!-- 댓글 목록 영역 -->
            <div style="background: var(--surface); border-radius: 32px 32px 0 0; flex-grow: 1; padding: 24px 20px; box-shadow: 0 -4px 20px rgba(0,0,0,0.03); display:flex; flex-direction:column; gap: 20px; border-top: 1px solid var(--border-color);">
    `;
    
    if (comments.length === 0) {
        html += `<div style="padding: 60px 0; text-align: center; color: var(--text-muted); font-size: 15px; font-weight: 600;">아직 댓글이 없습니다.<br>따뜻한 응원을 남겨보세요!</div>`;
    } else {
        comments.forEach(cmt => {
            let isMyCmt = cmt.author === window.activeUser;
            html += `
                <div style="display: flex; gap: 14px; align-items: flex-start;">
                    <div style="width: 40px; height: 40px; border-radius: 14px; background: var(--bg-sec); border: 1px solid var(--border-color); display: flex; justify-content: center; align-items: center; font-size: 16px; font-weight: 900; flex-shrink: 0; color: var(--text-muted);">${cmt.author.charAt(0).toUpperCase()}</div>
                    <div style="flex-grow: 1; display:flex; flex-direction:column; align-items:flex-start;">
                        <div style="display:flex; align-items:baseline; gap: 8px;">
                            <span style="font-weight: 900; font-size: 14px; color: var(--text-main); letter-spacing:-0.3px;">${window.Utils.escapeHTML(cmt.author)}</span>
                            <span style="font-weight:600; color:var(--text-muted); font-size:12px;">${window.timeAgo(cmt.date)}</span>
                        </div>
                        <div class="comment-bubble" style="font-size: 15px; font-weight:500; line-height: 1.6; color: var(--text-main); word-break: break-word; white-space: pre-wrap; letter-spacing:-0.3px;">${window.Utils.escapeHTML(cmt.text).replace(/\\n/g, '<br>')}</div>
                        ${isMyCmt ? `<button style="background: transparent; border: none; color: #ef4444; font-size: 13px; font-weight: bold; cursor: pointer; padding: 6px 4px 0; margin-top:2px;" onclick="window.deleteComment('${post.id}', '${cmt.id}')">삭제</button>` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        
            <div style="padding: 16px 0 0; background: var(--surface); border-top: 1px solid var(--border-color); flex-shrink: 0; z-index: 10;">
                <div style="display: flex; gap: 12px; align-items: center; background: var(--bg-sec); border-radius: 28px; padding: 6px 6px 6px 16px; border: 1px solid var(--border-color);">
                    <input type="text" id="comment-input" placeholder="${window.activeUser}님, 답글을 남겨주세요..." style="flex-grow: 1; background: transparent; border: none; font-size: 15px; font-weight:600; color: var(--text-main); outline: none; padding: 8px 0; font-family: inherit;" onkeypress="if(event.key === 'Enter') window.submitComment('${post.id}')">
                    <button style="background: var(--text-main); color: var(--surface); font-weight:800; border: none; border-radius: 22px; padding: 10px 20px; cursor: pointer; font-size: 14px; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" onclick="window.submitComment('${post.id}')">전송</button>
                </div>
            </div>
        </div>
    `;
    contentArea.innerHTML = html;
};

// ❤️ 좋아요 처리
window.handleLike = async function(id, current) {
    await FirebaseEngine.likePost(id, current);
    window.openBoardModal(); // 새로고침
};

// 수정 및 삭제 기능
window.deletePost = async function(id) {
    if(!confirm("정말 이 글을 삭제할까요?")) return;
    let res = await FirebaseEngine.deleteBoard(id);
    if(res && res.success) {
        window.showToast("🗑️ 글이 삭제되었습니다.");
        window.openBoardModal();
    }
};

window.submitComment = async function(postId) {
    const text = document.getElementById('comment-input').value.trim();
    if (!text) return window.showToast("내용을 입력해주세요.");
    
    window.showLoading(true, "댓글 등록 중... 💬");
    const commentData = { id: "cmt_" + Date.now(), author: window.activeUser || "익명", text: text, date: new Date().toISOString() };
    
    let res = await FirebaseEngine.addComment(postId, commentData);
    window.showLoading(false);
    
    if (res.success) {
        const post = window.allPosts.find(p => p.id === postId);
        if(post) { if(!post.comments) post.comments = []; post.comments.push(commentData); }
        window.viewPost(postId);
    } else { window.showToast("❌ 실패했습니다."); }
};

window.deleteComment = async function(postId, commentId) {
    if (!confirm("댓글을 삭제할까요?")) return;
    window.showLoading(true, "삭제 중... 🗑️");
    
    const post = window.allPosts.find(p => p.id === postId);
    const newComments = post.comments.filter(c => c.id !== commentId);
    
    let res = await FirebaseEngine.updateComments(postId, newComments);
    window.showLoading(false);
    
    if (res.success) { post.comments = newComments; window.viewPost(postId); }
    else { window.showToast("❌ 삭제 실패"); }
};

window.editPostPrompt = async function(id, oldContent) {
    const newContent = prompt("내용을 수정하세요:", oldContent);
    if(newContent && newContent.trim() !== "" && newContent !== oldContent) {
        let res = await FirebaseEngine.updateBoard(id, newContent);
        if(res && res.success) {
            window.showToast("✨ 수정이 완료되었습니다.");
            window.openBoardModal();
        }
    }
};

// 게시판 글쓰기 로직
window.writePost = async function() {
    const contentInput = document.getElementById('new-post-content');
    const content = contentInput.value.trim();
    if (!content) return window.showToast("내용을 입력해주세요.");
    
    contentInput.disabled = true;
    window.showLoading(true, "게시글 등록 중... 🚀");
    
    let res = await FirebaseEngine.writeBoard({
        author: window.activeUser || "익명",
        content: content,
        date: new Date().toISOString()
    });
    
    window.showLoading(false);
    if (res.success) {
        window.removeL('boardDraft');
        window.showToast("✅ 게시글이 등록되었습니다.");
        window.openBoardModal(); // 새로고침
    } else {
        window.showToast("❌ 게시글 등록 실패");
        contentInput.disabled = false;
    }
};