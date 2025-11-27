let currentQuestion = 0;
let questions = [];
let currentTeam = null;
const usedDouble = { team1: false, team2: false, team3: false, team4: false };
const doubleActive = { team1: false, team2: false, team3: false, team4: false };

// Load JSON câu hỏi
fetch('questions.json')
    .then(res => res.json())
    .then(data => {
        questions = data;
        showQuestion();
    });

function setCurrentTeam(team) {
    // Xóa highlight cũ
    document.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));

    // Thêm highlight mới
    document.getElementById(team).classList.add('selected');

    currentTeam = team;
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        showFinalResult();
        return;
    }

    // Hiện/ẩn các phần tử
    document.getElementById('question').style.display = 'block';
    document.getElementById('options').style.display = 'grid';
    document.getElementById('result-area').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';

    const q = questions[currentQuestion];
    document.getElementById('question').innerText = `Câu ${currentQuestion + 1}: ${q.question}`;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index);
        optionsDiv.appendChild(btn);
    });

    // Hiển thị/ẩn nút quay lại
    document.getElementById('prev-btn').style.display = currentQuestion > 0 ? 'inline-block' : 'none';
}

// ...existing code...

function showFinalResult() {
    // Ẩn câu hỏi và options
    document.getElementById('question').style.display = 'none';
    document.getElementById('options').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';

    // Hiển thị kết quả
    document.getElementById('result-area').style.display = 'block';

    // Lấy điểm số các đội
    const teamNames = {
        team1: 'Trung tâm văn hóa',
        team2: 'Quốc Pháp',
        team3: 'Marsupilami',
        team4: 'Dear X'
    };

    const scores = [];
    for (let team in teamNames) {
        const scoreText = document.querySelector(`#${team} .score`).textContent;
        const score = parseInt(scoreText.replace('$', ''));
        scores.push({ name: teamNames[team], score: score, id: team });
    }

    // Sắp xếp theo điểm cao xuống thấp
    scores.sort((a, b) => b.score - a.score);

    // Hiển thị 2 đội cao điểm nhất
    const topTeamsDiv = document.getElementById('top-teams');
    topTeamsDiv.innerHTML = '';

    for (let i = 0; i < Math.min(2, scores.length); i++) {
        const medal = i === 0 ? '🥇' : '🥈';
        const rank = i === 0 ? 'Nhất' : 'Nhì';
        const teamCard = document.createElement('div');
        teamCard.className = i === 0 ? 'winner-card' : 'winner-card second';
        teamCard.innerHTML = `
            <div class="medal">${medal}</div>
            <h3>Giải ${rank}</h3>
            <h2>${scores[i].name}</h2>
            <p class="final-score">$${scores[i].score}</p>
        `;
        topTeamsDiv.appendChild(teamCard);
    }
}

// ...existing code...

function showFeedback(isCorrect, message) {
    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';

    // Tạo container cho feedback
    const feedback = document.createElement('div');
    feedback.className = 'feedback-container';

    // Thêm GIF
    const gif = document.createElement('img');
    gif.src = isCorrect ? 'image/correct.gif' : 'image/wrong.gif';
    gif.className = 'feedback-gif';

    // Thêm text
    const text = document.createElement('p');
    text.className = 'feedback-text';
    text.innerText = message;

    feedback.appendChild(gif);
    feedback.appendChild(text);
    overlay.appendChild(feedback);
    document.body.appendChild(overlay);

    // Phát âm thanh
    const audio = new Audio(isCorrect ? 'correct.mp3' : 'wrong.mp3');
    audio.play();

    // Tự động đóng: Đúng 7s, Sai 10s
    setTimeout(() => {
        overlay.remove();
    }, isCorrect ? 7600 : 9500);
}

// ...existing code...
function checkAnswer(selected) {
    if (!currentTeam) {
        alert("⚠️ Vui lòng chọn đội trả lời trước!");
        return;
    }
    const correct = questions[currentQuestion].answer - 1;
    const scoreEl = document.querySelector(`#${currentTeam} .score`);
    let score = parseInt(scoreEl.textContent.replace('$', ''));

    // Kiểm tra có đang dùng cược x2 không
    if (doubleActive[currentTeam]) {
        if (selected === correct) {
            // Đúng: x2
            score = score * 2;
            showFeedback(true, `🎉 ĐÚNG RỒI! Tiền x2 = $${score}!`);
        } else {
            // Sai: chia 2 (xử lý cả số âm)
            if (score < 0) {
                score = score * 2; // Số âm thì nhân 2 = âm hơn
            } else {
                score = Math.floor(score / 2);
            }
            showFeedback(false, `😱 SAI RỒI! Tiền ÷2 = $${score}!`);
        }
        // Tắt hiệu ứng
        document.getElementById(currentTeam).classList.remove('double-glow');
        doubleActive[currentTeam] = false;
    } else {
        // Chơi bình thường
        if (selected === correct) {
            score += 100;
            showFeedback(true, `✅ Đúng rồi! +$100`);
        } else {
            score -= 50;
            showFeedback(false, `❌ Sai rồi! -$50`);
        }
    }

    scoreEl.textContent = `$${score}`;
}
// ...existing code...

function doubleScore(team) {
    if (usedDouble[team]) {
        alert("⚠️ Đã dùng cược x2 rồi!");
        return;
    }

    if (!currentTeam) {
        alert("⚠️ Vui lòng chọn đội trả lời trước!");
        return;
    }

    if (currentTeam !== team) {
        alert("⚠️ Chỉ đội đang trả lời mới được dùng cược x2!");
        return;
    }

    // Kích hoạt hiệu ứng sáng chói
    document.getElementById(team).classList.add('double-glow');
    doubleActive[team] = true;
    usedDouble[team] = true;
    event.target.disabled = true;
}

function nextQuestion() {
    currentQuestion++;
    currentTeam = null;
    // Xóa highlight
    document.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    showQuestion();
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        currentTeam = null;
        // Xóa highlight
        document.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
        showQuestion();
    }
}