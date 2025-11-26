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
    const teamNames = { team1: 'Trung tâm văn hóa', team2: 'Quốc Pháp', team3: 'Marsupilami', team4: 'Đội W' };
    alert(`✅ ${teamNames[team]} đã được chọn!`);
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        document.getElementById('question').innerText = "🎉 Đã hết câu hỏi! Xem điểm số các đội bên dưới! 🎉";
        document.getElementById('options').innerHTML = "";
        document.getElementById('next-btn').style.display = 'none';
        return;
    }
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
}

function checkAnswer(selected) {
    if (!currentTeam) {
        alert("⚠️ Vui lòng chọn đội trả lời trước!");
        return;
    }
    const correct = questions[currentQuestion].answer - 1;
    const scoreEl = document.querySelector(`#${currentTeam} .score`);
    let score = parseInt(scoreEl.textContent);

    // Kiểm tra có đang dùng cược x2 không
    if (doubleActive[currentTeam]) {
        if (selected === correct) {
            // Đúng: x2
            score = score * 2;
            alert("🎉 ĐÚNG RỒI! Điểm x2 = " + score + " điểm!");
        } else {
            // Sai: chia 2 (xử lý cả số âm)
            if (score < 0) {
                score = score * 2; // Số âm thì nhân 2 = âm hơn
            } else {
                score = Math.floor(score / 2);
            }
            alert("😱 SAI RỒI! Điểm ÷2 = " + score + " điểm!");
        }
        // Tắt hiệu ứng
        document.getElementById(currentTeam).classList.remove('double-glow');
        doubleActive[currentTeam] = false;
    } else {
        // Chơi bình thường
        if (selected === correct) {
            score += 10;
            alert("✅ Đúng rồi! +10 điểm");
        } else {
            score -= 5;
            alert("❌ Sai rồi! -5 điểm");
        }
    }

    scoreEl.textContent = score;
}

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

    alert("🔥 Đã kích hoạt cược x2!\n✅ Đúng: Điểm x2\n❌ Sai: Điểm ÷2");
}

function nextQuestion() {
    currentQuestion++;
    currentTeam = null;
    // Xóa highlight
    document.querySelectorAll('.team').forEach(t => t.classList.remove('selected'));
    showQuestion();
}