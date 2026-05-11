// ==========================================
// 📝 에디터 및 텍스트 데이터 로직 (editor.js)
// ==========================================

window.injectToolbar = function(containerId) {
    const container = document.getElementById(containerId);
    const template = document.getElementById('editor-toolbar-template');
    if (container && template) container.appendChild(template.content.cloneNode(true));
};

window.formatText = function(command, value = null) {
    document.execCommand(command, false, value);
    const editor = document.querySelector('.rich-editor:focus');
    if(editor) editor.focus();
};

window.insertEmojiAtCursor = function(emoji) {
    document.execCommand("insertText", false, emoji);
};

window.openTextModal = function(type, targetDateStr = null) {
    const dateStr = targetDateStr || window.Utils.getLogicalDateString();
    document.getElementById(`${type}-date-input`).value = dateStr;
    const input = document.getElementById(`${type}-input`);
    const title = document.getElementById(`${type}-modal-title`);
    
    title.innerText = type === 'diary' ? `📝 일기 (${dateStr})` : `✅ 할일 (${dateStr})`;
    input.innerHTML = (window.dailyRecords[dateStr] && window.dailyRecords[dateStr][type]) ? window.dailyRecords[dateStr][type] : "";
    
    document.getElementById(`${type}-modal`).style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.saveTextData = function(type, silent = false) {
    const dateStr = document.getElementById(`${type}-date-input`).value;
    const htmlContent = document.getElementById(`${type}-input`).innerHTML;
    if (!window.dailyRecords[dateStr]) window.dailyRecords[dateStr] = {};
    window.dailyRecords[dateStr][type] = htmlContent;
    window.setL('dailyRecords', JSON.stringify(window.dailyRecords));
    
    if (!silent) {
        window.app.closeModal(`${type}-modal`);
        window.showToast("💾 안전하게 저장되었습니다.");
        window.triggerAutoSync();
        
        const recordModal = document.getElementById('record-modal');
        if (recordModal && recordModal.style.display === 'flex') {
            window.openRecordModal(dateStr);
        }
    }
};

window.updateNotesFromLocal = function() { for(let i=0; i<48; i++) { let n = window.getL(`note_${i}`); if(window.domCache.notes && window.domCache.notes[i]) window.domCache.notes[i].value = n || ""; } };

window.saveNotesToLocal = function() { for(let i=0; i<48; i++) { if(window.domCache.notes && window.domCache.notes[i]) { let val = window.domCache.notes[i].value.trim(); if(val) window.setL(`note_${i}`, val); else window.removeL(`note_${i}`); } } window.triggerAutoSync(); };