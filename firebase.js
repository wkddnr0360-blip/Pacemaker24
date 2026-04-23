// ==========================================
// 🔥 Pacemaker Pro+ Firebase Core Engine
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, 
    query, orderBy, deleteDoc, updateDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ 여기에 본인의 Firebase 웹 앱 설정 값을 붙여넣으세요!
const firebaseConfig = {
  apiKey: "AIzaSyADD6B0zHTP1jxwCJJCfcX1g556SvYbKhU",
  authDomain: "pacemaker-b91b2.firebaseapp.com",
  projectId: "pacemaker-b91b2",
  storageBucket: "pacemaker-b91b2.firebasestorage.app",
  messagingSenderId: "179116801102",
  appId: "1:179116801102:web:780fb0aa0740ed7afa571f",
  measurementId: "G-7JDT63C14R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const FirebaseEngine = {
    // ------------------------------------------
    // 🔐 인증 시스템 (ID/PW 기반)
    // ------------------------------------------
    async login(userId, hashedPw) {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.password !== hashedPw) {
                    return { success: false, message: "비밀번호가 틀립니다." };
                }
                return { success: true };
            } else {
                // 신규 유저 생성
                await setDoc(userRef, { password: hashedPw, createdAt: serverTimestamp() });
                return { success: true };
            }
        } catch (e) {
            console.error("Login Error:", e);
            return { success: false, message: "서버 연결에 실패했습니다." };
        }
    },

    async likePost(postId, currentLikes) {
        try {
            const postRef = doc(db, "board", postId);
            await updateDoc(postRef, { likes: (currentLikes || 0) + 1 });
            return { success: true };
        } catch (e) { return { success: false }; }
    },
    
    async migrateFromGAS(url, userId) {
        try {
            // GAS는 캐시 문제 방지를 위해 timestamp 추가
            const finalUrl = `${url}?type=getAllData&id=${encodeURIComponent(userId)}&_t=${Date.now()}`;
            
            const response = await fetch(finalUrl, {
                method: 'GET',
                mode: 'cors',
                redirect: 'follow' 
            });

            if (!response.ok) throw new Error("GAS 서버 응답 없음");
            const result = await response.json();
            
            // GAS 결과 검증
            if (result && result.success) return { success: true, data: result.data };
            return { success: false, message: "데이터를 찾을 수 없습니다." };
        } catch (e) {
            return { success: false, message: "연결 실패 (GAS 배포 권한을 '모든 사용자'로 설정했는지 확인하세요)" };
        }
    },

    async deleteBoard(postId) {
    try {
        await deleteDoc(doc(db, "board", postId));
        return { success: true };
    } catch (e) { return { success: false }; }
},

    
    async updateBoard(postId, newContent) {
    try {
        await updateDoc(doc(db, "board", postId), { 
            content: newContent,
            isEdited: true,
            editDate: new Date().toISOString()
        });
        return { success: true };
    } catch (e) { return { success: false }; }
},

    async addComment(postId, commentObj) {
        try {
            const postRef = doc(db, "board", postId);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
                const currentComments = postSnap.data().comments || [];
                await updateDoc(postRef, { comments: [...currentComments, commentObj] });
                return { success: true };
            }
            return { success: false };
        } catch (e) { return { success: false }; }
    },
    
    async updateComments(postId, commentsArray) {
        try {
            const postRef = doc(db, "board", postId);
            await updateDoc(postRef, { comments: commentsArray });
            return { success: true };
        } catch (e) { return { success: false }; }
    },

    // ------------------------------------------
    // 💾 통합 데이터 저장 (병렬 처리로 속도 개선)
    // ------------------------------------------
    async saveAllData(userId, mainData, diaryData, todoData, monData, quizData) {
        try {
            // 5개의 문서를 동시에 업데이트하여 딜레이 최소화 (퀴즈 DB 분리)
            await Promise.all([
                setDoc(doc(db, "users_data", userId), { content: mainData }, { merge: true }),
                setDoc(doc(db, "users_diary", userId), { content: diaryData }, { merge: true }),
                setDoc(doc(db, "users_todo", userId), { content: todoData }, { merge: true }),
                setDoc(doc(db, "users_mon", userId), { content: monData }, { merge: true }),
                setDoc(doc(db, "users_quiz", userId), { content: quizData }, { merge: true })
            ]);
            return { success: true };
        } catch (e) {
            console.error("Save Error:", e);
            return { success: false, message: "데이터 저장 중 오류가 발생했습니다." };
        }
    },

    // ------------------------------------------
    // 📥 통합 데이터 불러오기
    // ------------------------------------------
    async loadAllData(userId) {
        try {
            const [mainSnap, diarySnap, todoSnap, monSnap, quizSnap] = await Promise.all([
                getDoc(doc(db, "users_data", userId)),
                getDoc(doc(db, "users_diary", userId)),
                getDoc(doc(db, "users_todo", userId)),
                getDoc(doc(db, "users_mon", userId)),
                getDoc(doc(db, "users_quiz", userId))
            ]);

            let mainParsed = mainSnap.exists() && mainSnap.data().content ? JSON.parse(mainSnap.data().content) : {};
            let diaryParsed = diarySnap.exists() && diarySnap.data().content ? JSON.parse(diarySnap.data().content) : {};
            let todoParsed = todoSnap.exists() && todoSnap.data().content ? JSON.parse(todoSnap.data().content) : {};
            let monParsed = monSnap.exists() && monSnap.data().content ? JSON.parse(monSnap.data().content) : {};
            let quizParsed = quizSnap.exists() && quizSnap.data().content ? quizSnap.data().content : null;

            // 데이터 병합 (기존 방식 호환)
            let dailyRecordsObj = mainParsed.dailyRecords ? JSON.parse(mainParsed.dailyRecords) : {};
            let diaryRecs = diaryParsed.diaryRecords ? JSON.parse(diaryParsed.diaryRecords) : {};
            let todoRecs = todoParsed.todoRecords ? JSON.parse(todoParsed.todoRecords) : {};

            for (let dateStr in diaryRecs) {
                if (!dailyRecordsObj[dateStr]) dailyRecordsObj[dateStr] = {};
                if(diaryRecs[dateStr]) dailyRecordsObj[dateStr].diary = diaryRecs[dateStr];
            }
            for (let dateStr in todoRecs) {
                if (!dailyRecordsObj[dateStr]) dailyRecordsObj[dateStr] = {};
                if(todoRecs[dateStr]) dailyRecordsObj[dateStr].todo = todoRecs[dateStr];
            }
            mainParsed.dailyRecords = JSON.stringify(dailyRecordsObj);
            
            let finalMonData = Object.keys(monParsed.monsterData || {}).length > 0 ? monParsed.monsterData : mainParsed.monsterData;
            if (finalMonData) mainParsed.monsterData = finalMonData;
            
            // 퀴즈 데이터 병합
            if (quizParsed) mainParsed.myQuizzes = quizParsed;

            return { success: true, data: mainParsed };
        } catch (e) {
            console.error("Load Error:", e);
            return { success: false, message: "데이터 로드 중 오류가 발생했습니다." };
        }
    },

    // ------------------------------------------
    // 📦 백업 시스템
    // ------------------------------------------
    async saveBackup(userId, mainData, diaryData, todoData, monData, quizData, timestamp) {
        try {
            await Promise.all([
                setDoc(doc(db, "backup_data", userId), { content: mainData, time: timestamp }),
                setDoc(doc(db, "backup_diary", userId), { content: diaryData }),
                setDoc(doc(db, "backup_todo", userId), { content: todoData }),
                setDoc(doc(db, "backup_mon", userId), { content: monData }),
                setDoc(doc(db, "backup_quiz", userId), { content: quizData })
            ]);
            return { success: true };
        } catch (e) {
            return { success: false, message: "백업 실패" };
        }
    },

    async loadBackup(userId) {
        try {
            const mainSnap = await getDoc(doc(db, "backup_data", userId));
            if (!mainSnap.exists()) return { success: false, message: "백업본이 없습니다." };
            // 구현은 loadAllData와 동일한 방식으로 백업 컬렉션에서 가져오도록 처리 (생략됨)
            // ... app.js에서 이 인터페이스를 활용할 예정입니다.
            return { success: true, timestamp: mainSnap.data().time }; // 간소화
        } catch (e) {
            return { success: false, message: "백업 로드 실패" };
        }
    },

    // ------------------------------------------
    // 📢 라운지 (게시판) 통신
    // ------------------------------------------
    async getBoardList() {
        try {
            const q = query(collection(db, "board"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            let list = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.id = doc.id;
                list.push(data);
            });
            return { success: true, data: list };
        } catch (e) {
            return { success: false, message: "게시판 로드 실패" };
        }
    },

    async writeBoard(postData) {
        try {
            await addDoc(collection(db, "board"), postData);
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }
};


window.FirebaseEngine = FirebaseEngine; // 외부 호출용