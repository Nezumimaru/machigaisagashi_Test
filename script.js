document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const markersLayer = document.getElementById('markersLayer');
    const foundCountEl = document.getElementById('foundCount');
    const gameOverModal = document.getElementById('gameOverModal');
    const lifeCountEl = document.getElementById('lifeCount');

    let mistakesLeft = 4; // 3回までOK、4回目でアウトなので初期値4にして減らしていくか、ミス回数をカウントするか
    // リクエスト： "3回まで間違えられるけど、4回間違えたら終了"
    // 表示はハート4つにして、1ミスで1つ減る -> 0になった瞬間にGameOver
    // レベルデータの定義
    const levels = [
        {
            id: 'default',
            src: 'game_image.jpg',
            title: '2026年2月号',
            // もともとの間違いデータ（とりあえずここに移動）
            mistakes: [
                { id: 1, found: false, areas: [{ x: 94.3, y: 12.1, r: 5 }, { x: 94.3, y: 61.1, r: 5 }] },
                { id: 2, found: false, areas: [{ x: 86.0, y: 39.0, r: 5 }, { x: 86.0, y: 88.0, r: 5 }] },
                { id: 3, found: false, areas: [{ x: 56.0, y: 41.4, r: 5 }, { x: 56.0, y: 90.4, r: 5 }] },
                { id: 4, found: false, areas: [{ x: 53.4, y: 24.4, r: 5 }, { x: 53.4, y: 73.4, r: 5 }] },
                { id: 5, found: false, areas: [{ x: 7.7, y: 47.4, r: 5 }, { x: 7.7, y: 96.4, r: 5 }] },
                { id: 6, found: false, areas: [{ x: 11.8, y: 15.8, r: 5 }, { x: 11.8, y: 64.8, r: 5 }] },
                { id: 7, found: false, areas: [{ x: 53.8, y: 6.9, r: 5 }, { x: 53.8, y: 55.9, r: 5 }] },
                { id: 8, found: false, areas: [{ x: 40.5, y: 27.6, r: 5 }, { x: 40.5, y: 76.6, r: 5 }] }
            ]
        },
        {
            id: '202509',
            src: '202509.png',
            title: '2025年9月号',
            mistakes: [
                { id: 1, found: false, areas: [{ x: 95.2, y: 81.0, r: 5 }] },
                { id: 2, found: false, areas: [{ x: 90.2, y: 93.0, r: 5 }] },
                { id: 3, found: false, areas: [{ x: 79.7, y: 93.4, r: 5 }] },
                { id: 4, found: false, areas: [{ x: 76.9, y: 55.4, r: 5 }] },
                { id: 5, found: false, areas: [{ x: 35.3, y: 83.9, r: 5 }] },
                { id: 6, found: false, areas: [{ x: 9.1, y: 58.0, r: 5 }] },
                { id: 7, found: false, areas: [{ x: 32.7, y: 52.7, r: 5 }] },
                {
                    id: 8,
                    found: false,
                    areas: [
                        { x: 40.9, y: 75.7, r: 5 },
                        { x: 40.5, y: 70.1, r: 5 },
                        { x: 40.5, y: 81.3, r: 5 }
                    ],
                    // カスタム表示設定
                    customMarker: {
                        x: 40.6,
                        y: 75.7,
                        width: '30px',
                        height: '150px',
                        borderRadius: '20px'
                    }
                }
            ]
        },
        {
            id: '202512',
            src: '202512.png',
            title: '2025年12月号',
            mistakes: [
                { id: 1, found: false, areas: [{ x: 84.1, y: 61.3, r: 5 }] },
                { id: 2, found: false, areas: [{ x: 85.1, y: 86.8, r: 5 }] },
                { id: 3, found: false, areas: [{ x: 60.6, y: 63.9, r: 5 }] },
                { id: 4, found: false, areas: [{ x: 56.5, y: 84.9, r: 5 }] },
                { id: 5, found: false, areas: [{ x: 28.9, y: 63.9, r: 5 }] },
                { id: 6, found: false, areas: [{ x: 21.5, y: 76.6, r: 5 }] },
                { id: 7, found: false, areas: [{ x: 23.4, y: 89.5, r: 5 }] },
                { id: 8, found: false, areas: [{ x: 11.4, y: 92.5, r: 5 }] }
            ]
        }
    ];

    let currentLevelIndex = 0;
    let mistakes = []; // 現在のレベルの間違いデータ

    // DOM要素
    const levelMenu = document.getElementById('levelMenu');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const gameImage = document.getElementById('gameImage');
    const footer = document.querySelector('footer');
    const instructionText = document.querySelector('.instruction-text');

    // UI初期化
    initLevelMenu();

    function initLevelMenu() {
        // 最初はフッターを隠す
        footer.style.display = 'none';
        // テキスト初期化
        instructionText.textContent = "好きなまちがいさがしを選んでね";

        document.querySelectorAll('.level-item').forEach(item => {
            item.addEventListener('click', () => {
                const levelIndex = parseInt(item.getAttribute('data-level'));
                loadLevel(levelIndex);
            });
        });

        backToMenuBtn.addEventListener('click', () => {
            showLevelMenu();
        });
    }

    function loadLevel(index) {
        currentLevelIndex = index;
        const levelData = levels[index];

        // データのディープコピー（状態リセットのため）
        mistakes = JSON.parse(JSON.stringify(levelData.mistakes));

        // 画像切り替え
        gameImage.src = levelData.src;

        // 状態リセット
        foundTotal = 0;
        mistakesLeft = 4;
        foundCountEl.textContent = foundTotal;
        updateLifeDisplay();

        // マーカー消去
        markersLayer.innerHTML = '';

        // UI切り替え
        levelMenu.style.display = 'none';
        gameArea.style.display = 'block';
        backToMenuBtn.style.display = 'inline-block';
        footer.style.display = 'block'; // フッター表示
        instructionText.textContent = "下の画像をクリックしてね！";
        document.querySelector('.subtitle').textContent = `全部で${mistakes.length > 0 ? mistakes.length : '?'}つの間違いがあるよ！`;

        // 答え合わせボタンなどの状態リセット
        showAnswerBtn.disabled = false;
        showAnswerBtn.textContent = "答え合わせ";
    }

    function showLevelMenu() {
        levelMenu.style.display = 'flex';
        gameArea.style.display = 'none';
        backToMenuBtn.style.display = 'none';
        footer.style.display = 'none'; // フッター非表示
        instructionText.textContent = "好きなまちがいさがしを選んでね";
    }


    // Audio Context initialization for sound effect
    let audioCtx;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // 正解音: "ピンポン" (シンプルな音)
    function playCorrectSound() {
        initAudio();

        // 1. 声（イエーイ）は削除

        // 2. シンプルな正解音
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // シンプルな単音、または短い和音
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // 不正解音: "ぶー" (低音ノコギリ波)
    function playWrongSound() {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3); // Pitch bend down

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // 5つの間違いの定義 (仮の座標)
    // NOTE: レベルロード時に設定されるようになったため、この固定定義は削除します。

    let foundTotal = 0;
    // TOTAL_MISTAKES 変数は削除し、mistakes.length を使用します
    // const TOTAL_MISTAKES = 8;

    // デバッグ用要素
    const debugModeCheckbox = document.getElementById('debugMode');
    const coordOutput = document.getElementById('coordOutput');

    // クリックイベント
    gameArea.addEventListener('click', (e) => {
        // AudioContextの初期化
        initAudio();

        const rect = gameArea.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // デバッグモード（座標測定）
        if (debugModeCheckbox && debugModeCheckbox.checked) {
            const coordString = `{ x: ${x.toFixed(1)}, y: ${y.toFixed(1)}, r: 5 },`;
            coordOutput.value = coordString;
            coordOutput.select();

            // 測定ポイントを目立たせる
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = x + '%';
            marker.style.top = y + '%';
            marker.style.width = '10px';
            marker.style.height = '10px';
            marker.style.background = 'blue';
            marker.style.border = '2px solid white';
            marker.style.borderRadius = '50%';
            marker.style.transform = 'translate(-50%, -50%)';
            marker.style.pointerEvents = 'none';
            marker.style.zIndex = '9999';
            markersLayer.appendChild(marker);

            console.log(coordString);
            return; // ゲームのロジックは動かさない
        }

        // 下の画像だけクリック可能にする (y < 50% は無視)
        if (y < 50) {
            return;
        }

        const coordString = `{ x: ${x.toFixed(1)}, y: ${y.toFixed(1)}, r: 5 },`;
        console.log(coordString);


        // 正解判定
        let hit = false;

        mistakes.forEach(mistake => {
            if (mistake.found) return; // すでに見つけたやつは無視

            // 登録されたすべてのエリア(上・下)に対して判定
            mistake.areas.forEach(area => {
                // 距離計算 (アスペクト比を考慮しない簡易円形判定、本来は楕円になるが今回はこれで十分)
                // 厳密には、画像の比率に合わせて x, y の差分を補正すべきですが、rを調整すればOK
                // ここでは単純なユークリッド距離(%)で判定します
                const dx = x - area.x;
                const dy = y - area.y;
                // X方向とY方向のスケールが違うので、Yの重みを調整するとより正確ですが、単純化します
                // ただし、画像が縦長なので Y% の 1% は X% の 1% より実際のピクセル距離が長い可能性があります。
                // 調整: (dx)^2 + (dy * aspect)^2 <= r^2
                // aspect = width / height. 画像が 1(W):X(H) なので、 height > width なら aspect < 1.
                // 一旦単純距離判定で行きます。

                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= area.r) {
                    hit = true;
                    // 正解アクション
                    foundMistake(mistake, area.x, area.y);
                }
            });
        });

        if (!hit) {
            // 不正解エフェクト
            showWrongClick(e.clientX, e.clientY);

            // 不正解音
            playWrongSound();

            // ライフ減少処理
            mistakesLeft--;
            updateLifeDisplay();

            if (mistakesLeft <= 0) {
                // ゲームオーバー
                setTimeout(() => {
                    showGameOver();
                }, 500);
            }
        }
    });

    function updateLifeDisplay() {
        let hearts = "";
        for (let i = 0; i < mistakesLeft; i++) {
            hearts += "❤";
        }
        lifeCountEl.textContent = hearts;
    }

    // ヒントボタン
    const hintBtn = document.getElementById('hintBtn');
    let hintIndex = 0; // ヒントの表示準を管理

    hintBtn.addEventListener('click', () => {
        initAudio();

        // 全てもう見つけている場合やゲームオーバー時は何もしない
        if (foundTotal >= mistakes.length || mistakesLeft <= 0) return;

        // ボタンを一時的に無効化
        hintBtn.disabled = true;

        // 未発見の間違いを取得し、X座標(左側)でソート
        const remainingMistakes = mistakes.filter(m => !m.found).sort((a, b) => {
            return a.areas[0].x - b.areas[0].x;
        });

        if (remainingMistakes.length > 0) {
            // インデックスが範囲を超えないように調整（ループさせる）
            if (hintIndex >= remainingMistakes.length) {
                hintIndex = 0;
            }

            const targetMistake = remainingMistakes[hintIndex];

            // ターゲットのエリアを表示（下の画像のみ）
            if (targetMistake.customMarker && targetMistake.customMarker.y >= 50) {
                // カスタムマーカーがある場合はその中心にヒント表示
                showHintCircle(targetMistake.customMarker.x, targetMistake.customMarker.y);
            } else {
                // 通常は登録エリアごとに表示
                targetMistake.areas.forEach(area => {
                    if (area.y >= 50) {
                        showHintCircle(area.x, area.y);
                    }
                });
            }

            // 次回のためにインデックスを進める
            hintIndex++;
        }

        // 少し待ってからボタンを再有効化(連打防止)
        setTimeout(() => {
            hintBtn.disabled = false;
        }, 1500);
    });

    function showHintCircle(x, y) {
        const hint = document.createElement('div');
        hint.classList.add('hint-circle');
        hint.style.left = x + '%';
        hint.style.top = y + '%';
        markersLayer.appendChild(hint);

        // 3秒後にフェードアウトして削除
        setTimeout(() => {
            hint.style.transition = "opacity 0.5s";
            hint.style.opacity = "0";
            setTimeout(() => {
                hint.remove();
            }, 500);
        }, 3000);
    }

    // 答え合わせボタン
    const showAnswerBtn = document.getElementById('showAnswerBtn');
    showAnswerBtn.addEventListener('click', () => {
        initAudio();
        const confirmShow = confirm("本当に答えを見ますか？");
        if (confirmShow) {
            mistakes.forEach(mistake => {
                if (!mistake.found) {
                    // 未発見の間違いを表示 (下の画像のみ)
                    if (mistake.customMarker && mistake.customMarker.y >= 50) {
                        createMaru(mistake.customMarker.x, mistake.customMarker.y, true, mistake.customMarker);
                    } else {
                        mistake.areas.forEach(area => {
                            if (area.y >= 50) {
                                createMaru(area.x, area.y, true); // true for answer mode
                            }
                        });
                    }
                }
            });
            // ボタンを無効化
            showAnswerBtn.disabled = true;
            showAnswerBtn.textContent = "答えを表示しました";
        }
    });

    function foundMistake(mistake, hx, hy) {
        mistake.found = true;
        foundTotal++;
        foundCountEl.textContent = foundTotal;

        // 正解音
        playCorrectSound();

        // クラッカー演出は削除（クリア時のみ）
        /*
        const rect = gameArea.getBoundingClientRect();
        const px = (hx / 100) * rect.width;
        const py = (hy / 100) * rect.height;
        const viewportX = (rect.left + px) / window.innerWidth;
        const viewportY = (rect.top + py) / window.innerHeight;

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: viewportX, y: viewportY },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });
        */

        // マルを表示
        if (mistake.customMarker) {
            // カスタムマーカー情報があればそれを使って固定位置に表示
            createMaru(mistake.customMarker.x, mistake.customMarker.y, false, mistake.customMarker);
        } else {
            // 通常はクリック位置に表示
            createMaru(hx, hy);
        }

        // NOTE: 上下両方にマルを出す場合はここで反対側の座標を計算して出すことも可能ですが、
        // 「見つけた場所」にだけ出すのが一般的です。

        // クリア判定
        if (foundTotal >= mistakes.length) {
            setTimeout(() => {
                showClear();
            }, 500);
        }
    }

    function createMaru(x, y, isAnswer = false, style = null) {
        const maru = document.createElement('div');
        maru.classList.add('mark-circle');
        if (isAnswer) {
            maru.classList.add('is-answer');
        }
        maru.style.left = x + '%';
        maru.style.top = y + '%';

        // カスタムスタイル適用
        if (style) {
            if (style.width) maru.style.width = style.width;
            if (style.height) maru.style.height = style.height;
            if (style.borderRadius) maru.style.borderRadius = style.borderRadius;
        }

        markersLayer.appendChild(maru);
    }

    function showWrongClick(clientX, clientY) {
        // gameArea内での相対位置を計算
        const rect = gameArea.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const wrong = document.createElement('div');
        wrong.classList.add('wrong-click-x'); // バツ印のクラスに変更
        wrong.style.left = x + 'px';
        wrong.style.top = y + 'px';
        gameArea.appendChild(wrong);

        setTimeout(() => {
            wrong.remove();
        }, 800); // アニメーション時間に合わせて少し長く
    }

    function showClear() {
        console.log("Clear!");
        clearModal.classList.add('active');

        // クリア音 (sound01.mp3)
        const clearAudio = new Audio('sound01.mp3');
        clearAudio.play().catch(e => console.error("Audio play error:", e));

        // クラッカー演出
        confetti({
            particleCount: 300,
            spread: 120,
            origin: { x: 0.5, y: 0.6 }, // 画面中央やや下から
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });
    }

    function showGameOver() {
        console.log("Game Over");
        gameOverModal.classList.add('active');
    }
});
