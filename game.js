$(function () {
    'use strict';
    
    // 1. Firebase 초기화 (서버 통신 대체)
    const firebaseConfig = {
      apiKey: "AIzaSyADD6B0zHTP1jxwCJJCfcX1g556SvYbKhU",
      databaseURL: "https://pacemaker-b91b2-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "pacemaker-b91b2"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // UI 화면에서 '게임 시작' 버튼을 눌렀을 때만 작동하도록 이벤트화
    $(window).on('startGameEvent', function(e, selectedName, selectedChar) {
        var username = selectedName;
        var character = selectedChar;
        console.log("접속 완료! 닉네임: " + username);
        
        var myRef = db.ref('players/' + username);

    // 3. 캔버스 초기화 (원본 그대로)
    var ctx = $('#game-canvas')[0].getContext('2d');
    
    function resizeCanvas() {
        var container = $('#game-container');
        var w = container.width() || window.innerWidth;
        var h = container.height() || window.innerHeight;
        ctx.canvas.width = w;
        ctx.canvas.height = h;
        $(ctx.canvas).css({width: w + 'px', height: h + 'px'});
        
        // 창 크기에 맞춰 모바일(768px 미만)에서는 비율(zoom)을 2.5배로 축소하여 화면을 넓게 보여줍니다.
        if (typeof game !== 'undefined') {
            game.zoom = w < 768 ? 2.5 : 4;
        }
    }
    resizeCanvas();
    
    $(window).resize(function(evt) {
        resizeCanvas();
        if (typeof game !== 'undefined') {
            draw(ctx, game);
        }
    });
    ctx.imageSmoothingEnabled = false;
    
    // 4. 게임 엔진 세팅 (원본 그대로)
    var game = new MapEngine();
    game.loadMap();
    game.playerList.addPlayer({name: username, character: character, x: game.map.start.x*16, y: game.map.start.y*16, orientation: 40, foot: 0});
    game.loadCharactersImages();
    game.checkImagesLoad(function() {
        draw(ctx, game);
    });
    game.zoom = $(window).width() < 768 ? 2.5 : 4;
    $('#map-title').text(game.map.name);

    // ★ [Firebase] 최초 내 캐릭터 위치 전송 & 브라우저 닫을 시 자동 삭제
    myRef.set(game.playerList.getMainPlayer());
    myRef.onDisconnect().remove();

    // ★ [기능 개선] 접속자 목록 UI 업데이트 (연주자 최상단 강조)
    window.updatePlayerListUI = function() {
        var ul = $('#players-ul');
        if (ul.length > 0) {
            ul.empty();
            var players = game.playerList.players;
            
            var currentMusician = window.PlazaMusic ? window.PlazaMusic.currentAuthor : null;
            var sortedPlayers = players.slice().sort(function(a, b) {
                if (a.name === currentMusician) return -1;
                if (b.name === currentMusician) return 1;
                return 0;
            });
            
            for (var i in sortedPlayers) {
                var p = sortedPlayers[i];
                if (p.name === currentMusician) {
                    ul.append('<li style="margin-bottom:6px;"><span style="background: linear-gradient(135deg, #8b5cf6, #d946ef); color: white; padding: 4px 8px; border-radius: 6px; display:inline-block; font-weight: 900; box-shadow: 0 2px 8px rgba(139,92,246,0.4); border: 1px solid rgba(255,255,255,0.4); font-size: 13px;">🎵 ' + p.name + '</span></li>');
                } else {
                    ul.append('<li style="margin-bottom:4px;"><span style="background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; display:inline-block;">' + p.name + '</span></li>');
                }
            }
        }
    };
    window.updatePlayerListUI();

    // 5. 원본 이동 알고리즘
    function dest(code) {
        var player = game.playerList.getMainPlayer();
        // 소수점 오차 방지를 위해 철저히 정수형으로 묶음
        var px = Math.round(player.x / 16);
        var py = Math.round(player.y / 16);
        // 이미지 로딩 지연과 관계없이 안전하게 맵 가로 길이를 가져옵니다.
        var gw = game.map.width || 24;
        switch (code) {
            case 37: return px - 1 + py * gw;
            case 38: return px + (py - 1) * gw;
            case 39: return px + 1 + py * gw;
            case 40: return px + (py + 1) * gw;
        }
    }

    // ★ 현재 꾹 눌려있는 방향키를 추적하는 상태 객체
    var activeKeys = {};

    // ★ [신규 기능] 가만히 있어도 제자리 걸음(Idle) 애니메이션
    setInterval(function() {
        var players = game.playerList.players;
        var needsRedraw = false;
        for (var k in players) {
            // 본인 캐릭터가 이동 중일 때는 moveRepeat이 애니메이션을 부드럽게 담당하므로 건너뜀
            if (players[k].name === username && game.moving) continue;
            
            players[k].foot = (players[k].foot + 1) % 4;
            needsRedraw = true;
        }
        // 화면을 갱신 (움직이지 않을 때만)
        if (needsRedraw && !game.moving) draw(ctx, game);
    }, 250);

    // ★ [신규 기능] 설정에서 캐릭터 변경 시 즉각 렌더링 반영
    $(window).off('changeCharacterEvent').on('changeCharacterEvent', function(e, newChar) {
        var player = game.playerList.getMainPlayer();
        if (player) {
            player.character = newChar;
            game.loadCharactersImages();
            game.checkImagesLoad(function() { draw(ctx, game); });
            // Firebase에 새 캐릭터 정보 동기화
            myRef.update({ character: newChar });
        }
    });

    var moveRepeat = function(func, i, n, lastTime) {
        // 완벽한 60fps 동기화를 위해 시간 계산 없이 1프레임당 1픽셀 이동
        var step = function(timestamp) {
            if (!lastTime) lastTime = timestamp;
            var dt = timestamp - lastTime;
            // 🐛 120Hz 고주사율 모바일/PC에서 캐릭터가 너무 빨리 걷는 모션 버그 방지 (최대 60fps 제한)
            if (dt < 14) { 
                requestAnimationFrame(step);
                return;
            }
            func();
            if (i%4==1) {
                var player = game.playerList.getMainPlayer();
                player.foot++;
                if (player.foot == 4) { player.foot = 0; }
            }
            if (i!=n) { 
                moveRepeat(func, i+1, n, timestamp); 
            } else { 
                game.moving = false; 
                // ★ [원래 기능 복구] 맵 포탈(Borders) 밟기 체크
                var player = game.playerList.getMainPlayer();
                var px = Math.round(player.x / 16);
                var py = Math.round(player.y / 16);
                var borders = game.map.borders || [];
                for (var b = 0; b < borders.length; b++) {
                    if (borders[b].x === px && borders[b].y === py) {
                        alert(borders[b].map + " 맵 포탈 작동! (단일 맵 하드코딩 상태라 이동은 막아두었습니다.)");
                    }
                }

                // ★ 이동이 끝난 직후 조이스틱이 잡혀있다면 강제 유지
                if (typeof joystickActive !== 'undefined' && joystickActive && typeof currentDir !== 'undefined' && currentDir !== null) {
                    activeKeys[currentDir] = true;
                    handleMovement(currentDir);
                } else {
                    // ★ 아직 손을 떼지 않은 방향키가 있다면 딜레이 없이 즉시 다음 이동 실행
                    for (var k = 37; k <= 40; k++) {
                        if (activeKeys[k]) {
                            handleMovement(k);
                            break;
                        }
                    }
                }
            }
        };
        requestAnimationFrame(step);
    }

    // 걷기 & 멈춤 로직
    function walk(code) {
        var player = game.playerList.getMainPlayer();
        var steps = 0;
        moveRepeat(function() {
            switch (code) {
                case 37: player.x -= 2; break;
                case 38: player.y -= 2; break;
                case 39: player.x += 2; break;
                case 40: player.y += 2; break;
            }
            steps++;
            // 8프레임 이동 중 통신 최적화
            if (steps === 4 || steps === 8) {
                myRef.update(player);
            }
            draw(ctx, game);
        }, 1, 8); // 기존 16프레임에서 8프레임으로 단축 (이동 속도 2배 증가)
    }

    function idle(code) {
        var player = game.playerList.getMainPlayer();
        moveRepeat(function() {
            draw(ctx, game);
        }, 1, 8);
        // 제자리 방향 전환은 즉시 1번만 업데이트
        myRef.update(player);
    }

    // 조작 함수 (키보드 & 모바일 통합용)
    function handleMovement(keyCode) {
        var message = $("input#message");
        if (!message.is(":focus")) {
            var player = game.playerList.getMainPlayer();
            if (!game.moving) { // 맵 로딩 상태와 무관하게 즉시 걷기 허용
                player.orientation = keyCode;
                if (game.map.walkable[dest(keyCode)]) {
                    game.moving = true; walk(keyCode);
                } else {
                    game.moving = true; idle(keyCode);
                }
            }
        }
    }

    // PC 키보드 이벤트
    $(document).keydown(function(evt) {
        if (evt.keyCode>=37 && evt.keyCode<=40) {
            activeKeys[evt.keyCode] = true;
            if (!game.moving) handleMovement(evt.keyCode);
        } else if (evt.keyCode==13) {
            var message = $("input#message");
            if (message.length > 0) {
                if(!message.is(":focus")) { 
                    message.focus(); 
                }
                else {
                    if (message.val()!='') {
                        // ★ [Firebase] socket.emit('chat') 대신 채팅 DB에 전송
                        db.ref('chats').push({ author: username, content: message.val() });
                        myRef.update({ chatMsg: message.val(), chatTime: Date.now(), isPlayingMusic: false });
                        message.val('');
                    }
                    message.blur();
                }
            }
        } else if (evt.keyCode==27) {
            var message = $("input#message");
            if(message.length > 0) message.blur();
        }
    });

    // 키보드에서 손을 뗐을 때 상태 해제
    $(document).keyup(function(evt) {
        if (evt.keyCode>=37 && evt.keyCode<=40) {
            activeKeys[evt.keyCode] = false;
        }
    });

    // ★ [신규 기능] 모바일 가상 조이스틱 (Virtual Joystick) 로직
    const joystickZone = document.getElementById('joystick-zone');
    const joystickKnob = document.getElementById('joystick-knob');
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    let currentDir = null; 

    function handleJoystickStart(e) {
        if (e.type && e.type.includes('touch')) e.preventDefault();
        joystickActive = true;
        const rect = joystickZone.getBoundingClientRect();
        joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        handleJoystickMove(e);
    }

    function handleJoystickMove(e) {
        if (!joystickActive) return;
        if (e.type && e.type.includes('touch')) e.preventDefault(); 
        const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
        const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
        const dx = clientX - joystickCenter.x;
        const dy = clientY - joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 40; 
        
        let moveX = dx; let moveY = dy;
        if (distance > maxDistance) { moveX = (dx / distance) * maxDistance; moveY = (dy / distance) * maxDistance; }
        joystickKnob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

        let newDir = null;
        if (distance > 10) { 
            // 🐛 조이스틱 대각선 조작 시 잦은 방향 전환 모션 글리치 방지 (Hysteresis 적용)
            let isHorizontal = Math.abs(dx) > Math.abs(dy);
            if (currentDir === 37 || currentDir === 39) isHorizontal = Math.abs(dx) > Math.abs(dy) * 0.6;
            else if (currentDir === 38 || currentDir === 40) isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.6;
            
            if (isHorizontal) { newDir = dx > 0 ? 39 : 37; } 
            else { newDir = dy > 0 ? 40 : 38; }
        }
        if (newDir !== currentDir) {
            if (currentDir !== null) activeKeys[currentDir] = false;
            currentDir = newDir;
            if (currentDir !== null) { activeKeys[currentDir] = true; handleMovement(currentDir); }
        }
    }

    function handleJoystickEnd(e) {
        joystickActive = false; joystickKnob.style.transform = `translate(-50%, -50%)`;
        if (currentDir !== null) { activeKeys[currentDir] = false; currentDir = null; }
    }

    if(joystickZone) {
        joystickZone.addEventListener('touchstart', handleJoystickStart, {passive: false}); joystickZone.addEventListener('touchmove', handleJoystickMove, {passive: false});
        joystickZone.addEventListener('touchend', handleJoystickEnd); joystickZone.addEventListener('touchcancel', handleJoystickEnd);
    }
    
    // 화면 어디든 터치/클릭을 떼면 모든 방향키 누름 해제
    $(document).on('mouseup touchend', function(){ 
        activeKeys[37] = false; activeKeys[38] = false; activeKeys[39] = false; activeKeys[40] = false;
    });

    // ★ [Firebase] 다른 유저들의 위치 실시간 동기화
    var playersRef = db.ref('players');
    
    playersRef.on('child_added', function(snapshot) {
        var player = snapshot.val();
        if (player.name !== username) {
            game.playerList.addPlayer(player);
            game.loadCharactersImages();
            game.checkImagesLoad(function() { draw(ctx, game); });
            if(window.updatePlayerListUI) window.updatePlayerListUI();
        }
    });

    playersRef.on('child_changed', function(snapshot) {
        var player = snapshot.val();
        if (player.name !== username) {
            game.playerList.updatePlayer(player);
            draw(ctx, game);
        }
    });

    playersRef.on('child_removed', function(snapshot) {
        var player = snapshot.val();
        if (player.name !== username) {
            game.playerList.removePlayer(player.name);
            draw(ctx, game);
            if(window.updatePlayerListUI) window.updatePlayerListUI();
        }
    });

    // ★ [신규 기능] 광장 음악 공유 (Firebase 연동)
    var musicRef = db.ref('plaza_music');
    window.PlazaMusic = {
        isPlayingRemote: false,
        isListening: false,
        currentAuthor: null,
        start: function(xmlData, mode, tempo, keyShift, title) {
            this.currentAuthor = username;
            musicRef.set({
                author: username,
                xmlData: xmlData,
                mode: mode,
                tempo: tempo,
                keyShift: keyShift,
                title: title || "이름 없는 악보",
                startTime: firebase.database.ServerValue.TIMESTAMP
            });
            musicRef.onDisconnect().remove(); // 연주하는 본인이 나갈 때만 음악이 꺼지도록 등록
            if(window.updatePlayerListUI) window.updatePlayerListUI();
        },
        stop: function() {
            this.currentAuthor = null;
            musicRef.onDisconnect().cancel(); // 연주를 수동으로 멈출 때는 자동 삭제 트리거 취소
            musicRef.once('value').then(snap => {
                var data = snap.val();
                if(data && data.author === username) {
                    musicRef.remove();
                }
            });
            if(window.updatePlayerListUI) window.updatePlayerListUI();
        },
        listen: function() {
            if (this.isListening) return;
            musicRef.on('value', this.onMusicData);
            this.isListening = true;
        },
        ignore: function() {
            if (!this.isListening) return;
            musicRef.off('value', this.onMusicData); // ★ 서버로부터 데이터 수신 완벽 차단
            this.isListening = false;
            this.currentAuthor = null;
            
            // 내 화면의 플레이어 연주 정지 및 UI 복구
            $('#plaza-music-banner').css('display', 'none');
            this.isPlayingRemote = false;
            if (window.InstrumentEngine && window.InstrumentEngine.isPlaying) {
                window.InstrumentEngine.stop();
            }
            if(window.InstSys) {
                if(window.InstSys.playBtn) { window.InstSys.playBtn.disabled = false; window.InstSys.playBtn.style.display = 'block'; }
                if(window.InstSys.initBtn) window.InstSys.initBtn.disabled = false;
                if(window.InstSys.stopBtn) window.InstSys.stopBtn.style.display = 'none';
                if(window.InstSys.pauseBtn) window.InstSys.pauseBtn.style.display = 'none';
                if(document.getElementById('seekSlider')) document.getElementById('seekSlider').disabled = false;
                if(document.getElementById('tempoSlider')) document.getElementById('tempoSlider').disabled = false;
                if(document.getElementById('keyShift')) document.getElementById('keyShift').disabled = false;
                if(document.getElementById('ensembleSize')) document.getElementById('ensembleSize').disabled = false;
                if(document.getElementById('mmlInput')) document.getElementById('mmlInput').disabled = false;
            }
            if(window.updatePlayerListUI) window.updatePlayerListUI();
        },
        onMusicData: function(snapshot) {
        var data = snapshot.val();
        if (data) {
            window.PlazaMusic.currentAuthor = data.author;
            if(window.updatePlayerListUI) window.updatePlayerListUI();
            
            // ★ [신규] UI 배너 표시
            var banner = $('#plaza-music-banner');
            var info = $('#plaza-music-info');
            if (banner.length > 0 && info.length > 0) {
                banner.css('display', 'flex');
                info.text(data.author + "님이 '" + data.title + "' 연주 중...");
            }

            if (data.author !== username) {
                window.PlazaMusic.isPlayingRemote = true;
                if(window.showToast) window.showToast("🎵 광장에서 " + data.author + "님이 연주를 시작했습니다!");
                
                if(window.InstSys) {
                    if(window.InstSys.playBtn) window.InstSys.playBtn.disabled = true;
                    if(window.InstSys.initBtn) window.InstSys.initBtn.disabled = true;
                    if(document.getElementById('seekSlider')) document.getElementById('seekSlider').disabled = true;
                    if(document.getElementById('tempoSlider')) document.getElementById('tempoSlider').disabled = true;
                    if(document.getElementById('keyShift')) document.getElementById('keyShift').disabled = true;
                    if(document.getElementById('ensembleSize')) document.getElementById('ensembleSize').disabled = true;
                    if(document.getElementById('mmlInput')) document.getElementById('mmlInput').disabled = true;
                }
                
                setTimeout(() => {
                    if(window.InstSys && window.InstSys.playMusicData) {
                        window.InstSys.playMusicData(data.xmlData, data.mode, data.tempo, data.keyShift, data.startTime);
                    }
                }, 500);
            }
        } else {
            window.PlazaMusic.currentAuthor = null;
            if(window.updatePlayerListUI) window.updatePlayerListUI();
            
            // ★ [신규] UI 배너 숨김
            $('#plaza-music-banner').css('display', 'none');
            
            window.PlazaMusic.isPlayingRemote = false;
            if (window.InstrumentEngine && window.InstrumentEngine.isPlaying) {
                window.InstrumentEngine.stop();
                if(window.showToast) window.showToast("🎵 광장 연주가 종료되었습니다.");
            }
            if(window.InstSys) {
                if(window.InstSys.playBtn) { window.InstSys.playBtn.disabled = false; window.InstSys.playBtn.style.display = 'block'; }
                if(window.InstSys.initBtn) window.InstSys.initBtn.disabled = false;
                if(window.InstSys.stopBtn) window.InstSys.stopBtn.style.display = 'none';
                if(window.InstSys.pauseBtn) window.InstSys.pauseBtn.style.display = 'none';
                if(document.getElementById('seekSlider')) document.getElementById('seekSlider').disabled = false;
                if(document.getElementById('tempoSlider')) document.getElementById('tempoSlider').disabled = false;
                if(document.getElementById('keyShift')) document.getElementById('keyShift').disabled = false;
                if(document.getElementById('ensembleSize')) document.getElementById('ensembleSize').disabled = false;
                if(document.getElementById('mmlInput')) document.getElementById('mmlInput').disabled = false;
            }
        }
        }
    };
    
    // 초기 접속 시 BGM 상태에 따라 리스너 활성화
    if (!window.BGM || !window.BGM.isMuted) {
        window.PlazaMusic.listen();
    }
    
    // ★ [신규 기능] 네트워크 끊김 감지 및 연주 자동 중단
    db.ref(".info/connected").on("value", function(snap) {
        if (snap.val() === false) {
            if (window.InstrumentEngine && window.InstrumentEngine.isPlaying) {
                window.InstrumentEngine.stop();
            }
        }
    });

    // ★[Firebase] 채팅 실시간 수신
    db.ref('chats').on('child_added', function(snapshot) {
        var msg = snapshot.val();
        var chatList = $('#chat-messages');
        if (chatList.length > 0) {
            chatList.append('<li style="padding-bottom: 6px;"><strong style="color:#60a5fa;">' + msg.author + '</strong> : ' + msg.content + '</li>');
            
            // ★ 오래된 메시지 삭제 (최대 30줄 유지)
            if (chatList.children('li').length > 30) {
                chatList.children('li').first().remove();
            }
            
            // 스크롤 맨 아래로
            chatList.scrollTop(chatList[0].scrollHeight);
        }

        // 말풍선을 위해 해당 플레이어 데이터에 4초간 메시지 임시 저장
        var p = game.playerList.getPlayer(msg.author);
        if (p) {
            p.chatMsg = msg.content;
            p.chatTime = Date.now();
            p.isPlayingMusic = false;
        }
    });
    }); // end of startGameEvent
});

// 화면 그리기 함수 (원본과 동일하되, Bootstrap 툴팁 충돌 방지용 CSS 인라인 패치)
function draw(ctx, game) {
    if (game.map.backgroundColor !== undefined) {
        ctx.fillStyle = game.map.backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    var player = game.playerList.getMainPlayer();
    var xoff = Math.floor(ctx.canvas.width/2) - player.x*game.zoom - 16*game.zoom/2;
    var yoff = Math.floor(ctx.canvas.height/2) - player.y*game.zoom - 16*game.zoom/2;

    if (game.imgs[game.map.file] && game.imgs[game.map.file].complete && game.imgs[game.map.file].naturalWidth > 0) {
        ctx.drawImage(game.imgs[game.map.file], xoff, yoff, game.imgs[game.map.file].width*game.zoom, game.imgs[game.map.file].height*game.zoom);
    }

    var players = game.playerList.players;
    for (let k in players) {
        var pos;
        switch (players[k].orientation) {
            case 37: pos = 3; break;
            case 38: pos = 6; break;
            case 39: pos = 9; break;
            case 40: pos = 0; break;
        }
        switch (players[k].foot) {
            case 1: pos += 1; break;
            case 3: pos += 2; break;
        }
        var charImg = game.imgs['img/characters/' + players[k].character + '.gif'];
        if (charImg && charImg.complete && charImg.naturalWidth > 0) {
            var sx, sy, fw, fh;
            // ★ [신규] 기존 가로 12칸 스프라이트뿐만 아니라 일반적인 4x4, 3x4 RPG 스프라이트 비율 자동 호환 감지
            if (charImg.naturalWidth > charImg.naturalHeight * 2.5) {
                fw = charImg.naturalWidth / 12;
                fh = charImg.naturalHeight;
                sx = pos * fw;
                sy = 0;
            } else {
                // 4x4 또는 3x4 그리드 기반의 인터넷에 떠도는 일반 포켓몬 스프라이트 시트 처리
                var cols = Math.round(charImg.naturalWidth / (charImg.naturalHeight / 4));
                if (cols < 3) cols = 4;
                fw = charImg.naturalWidth / cols;
                fh = charImg.naturalHeight / 4;
                
                var row = 0;
                switch (players[k].orientation) {
                    case 40: row = 0; break; // 아래
                    case 37: row = 1; break; // 왼쪽
                    case 39: row = 2; break; // 오른쪽
                    case 38: row = 3; break; // 위
                }
                var col = 0;
                if (cols === 4) {
                    switch (players[k].foot) {
                        case 0: col = 0; break;
                        case 1: col = 1; break;
                        case 2: col = 2; break;
                        case 3: col = 3; break;
                    }
                } else if (cols === 3) {
                    switch (players[k].foot) {
                        case 0: col = 1; break;
                        case 1: col = 0; break;
                        case 2: col = 1; break;
                        case 3: col = 2; break;
                    }
                }
                sx = col * fw;
                sy = row * fh;
            }
            ctx.drawImage(charImg, sx, sy, fw, fh, (players[k].x-16)*game.zoom + xoff, (players[k].y-16)*game.zoom + yoff, 48*game.zoom, 48*game.zoom);
        }

        // ★ DOM 요소(#tags) 대신 Canvas에 직접 닉네임과 말풍선을 그려 프레임 드랍 완벽 제거!
        var drawX = xoff + players[k].x * game.zoom + 8 * game.zoom;
        var drawY = yoff + players[k].y * game.zoom - 4 * game.zoom; // 캐릭터 머리 위로 예쁘게 조정

        // 1. 닉네임 그리기
        ctx.font = "bold 13px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        var nameWidth = ctx.measureText(players[k].name).width;
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)"; // 반투명 검정 배경
        ctx.beginPath();
        ctx.roundRect(drawX - nameWidth/2 - 6, drawY - 16, nameWidth + 12, 22, 6);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.fillText(players[k].name, drawX, drawY);

        // 2. 말풍선 그리기 (채팅 입력 후 4초간 표시 또는 연주 중)
        if (players[k].chatMsg && (players[k].isPlayingMusic || Date.now() - players[k].chatTime < 4000)) {
            ctx.font = "bold 14px 'Segoe UI', sans-serif";
            var msgWidth = ctx.measureText(players[k].chatMsg).width;
            var bubbleX = drawX;
            var bubbleY = drawY - 30; // 닉네임보다 살짝 더 위에

            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.beginPath();
            ctx.roundRect(bubbleX - msgWidth/2 - 10, bubbleY - 24, msgWidth + 20, 32, 12);
            ctx.fill();

            ctx.beginPath(); // 말풍선 꼬리 (역삼각형)
            ctx.moveTo(bubbleX - 6, bubbleY + 8);
            ctx.lineTo(bubbleX + 6, bubbleY + 8);
            ctx.lineTo(bubbleX, bubbleY + 14);
            ctx.fill();

            ctx.fillStyle = "#111111";
            ctx.fillText(players[k].chatMsg, bubbleX, bubbleY - 2);
        }
    }
    
    // ★ [Layering 수정] 지붕이나 나무 윗단(Foreground) 이미지가 렌더링 되어있다면 캐릭터를 그린 '이후'에 마지막으로 덮어씌웁니다.
    if (game.map.fg_file && game.imgs[game.map.fg_file] && game.imgs[game.map.fg_file].complete && game.imgs[game.map.fg_file].naturalWidth > 0) {
        ctx.drawImage(game.imgs[game.map.fg_file], xoff, yoff, game.imgs[game.map.fg_file].naturalWidth*game.zoom, game.imgs[game.map.fg_file].naturalHeight*game.zoom);
    }
}