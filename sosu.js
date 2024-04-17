function sortLowerRow() {
  let cards = Array.from(lowerRow.getElementsByClassName('card'));
  // カードの内容（テキスト）に基づいて並び替え
  cards.sort(function(a, b) {
    let textA = a.textContent, textB = b.textContent;
    // 数字の場合は数値に変換して比較、それ以外（ABC）は辞書順に
    if (!isNaN(textA) && !isNaN(textB)) { // 両方とも数字の場合
      return textA - textB;
    } else {
      return textA.localeCompare(textB);
    }
  });
  // 並び替えたカードを`lowerRow`に再配置
  cards.forEach(card => lowerRow.appendChild(card));
}

function isPrime(n) {
  n = BigInt(n); // 引数をBigIntに変換
  if (n === BigInt(2)) return true;
  if (n < BigInt(2) || n % BigInt(2) === BigInt(0)) return false;

  let m = n - BigInt(1);
  let lsb = m & -m;
  let s = BigInt(lsb.toString(2).length - 1);
  let d = m / lsb;

  const testNumbers = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]; // BigIntリテラル

  for (let a of testNumbers) {
    if (a === n) continue;
    let x = powMod(a, d, n);
    let r = BigInt(0);
    if (x === BigInt(1)) continue;
    while (x !== m) {
      x = powMod(x, BigInt(2), n);
      r += BigInt(1);
      if (x === BigInt(1) || r === s) return false;
    }
  }
  return true;
}

// BigInt対応のmodPow関数
function powMod(base, exponent, modulus) {
  let result = BigInt(1);
  base = base % modulus;
  while (exponent > BigInt(0)) {
    if (exponent % BigInt(2) === BigInt(1)) {
      result = (result * base) % modulus;
    }
    exponent = exponent / BigInt(2);
    base = (base * base) % modulus;
  }
  return result;
}



document.addEventListener('DOMContentLoaded', function() {
  const upperRow = document.getElementById('upperRow');
  const lowerRow = document.getElementById('lowerRow');
  const historyElement = document.getElementById('history'); // 履歴表示領域

  // トランプの山札を生成
  function createDeck() {
    const suits = 4; // トランプのスーツの数
    const numbers = 13; // 1スーツあたりのカードの数
    const deck = [];

    // 数字カードを追加
    for (let i = 1; i <= numbers; i++) {
      for (let j = 0; j < suits; j++) {
        deck.push(i.toString());
      }
    }

    // ジョーカーを追加
    deck.push('X', 'X');

    return deck;
  }

  function dealKXQJ() {
    // 1~9それぞれ4枚ずつのカードを生成
    let cards1to9 = [];
    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 4; j++) {
        cards1to9.push(i);
      }
    }

    // 1~9からランダムに7枚選択
    let selectedCards = selectRandomCards(cards1to9, 7);


    selectedCards.push(10); // この辺り魔改造してるので注意
    selectedCards.push(12);
    selectedCards.push(13);
    selectedCards.push('X');
    // 残りのカードとジョーカー2枚を含む山札を生成
    let remainingDeck = cards1to9.filter(card => !selectedCards.includes(card));
    for (let i = 10; i <= 13; i++) {
      remainingDeck.push(i, i, i); // 選択されていない10~13のカードを追加
    }
    remainingDeck.push('X'); // ジョーカーを追加

    // 残りの山札をシャッフル
    let shuffledDeck = shuffle(remainingDeck);

    // 特別な場所に入った11枚を山札の上に置く
    let finalDeck = selectedCards.concat(shuffledDeck);

    deck = finalDeck;

    // カードを全て削除
    while (lowerRow.firstChild) {
      lowerRow.removeChild(lowerRow.firstChild);
    }
    while (upperRow.firstChild) {
      upperRow.removeChild(upperRow.firstChild);
    }

    // 新しい山札から11枚を配る
    for (let i = 0; i < 11; i++) {
      drawCard();
    }
  }

  document.getElementById('dealKXQJ').addEventListener('click', dealKXQJ);

  function selectRandomCards(cards, count) {
    let selected = [];
    while (selected.length < count) {
      const randomIndex = Math.floor(Math.random() * cards.length);
      const card = cards[randomIndex];
      if (!selected.includes(card)) {
        selected.push(card);
        cards.splice(randomIndex, 1); // 選択されたカードを元の配列から削除
      }
    }
    return selected;
  }


  // 配列をシャッフルする関数
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 山札を生成しシャッフル
  let deck = shuffle(createDeck());

  // カードをドローして表示する関数
  function drawCard() {
    if (deck.length > 0) {
      const cardValue = deck.shift(); // 山札の最上位のカードを取得し、山札から削除
      const card = document.createElement('div');
      card.classList.add('card');
      card.textContent = cardValue;
      lowerRow.appendChild(card); // ドローしたカードをlowerRowに追加
      sortLowerRow();
    } else {
      alert('山札にカードがありません。'); // 山札が空の場合の処理
    }
  }

  // upperRowのカードをプレイし、履歴に記録する関数
  function playHand() {
    const cards = Array.from(upperRow.getElementsByClassName('card'));
    const playedCards = cards.map(card => card.textContent); // プレイされたカードのテキストを取得
    let primeResultText = ""; // 素数判定結果のテキストを初期化
    if (playedCards.length > 0) {
      if (playedCards.includes('X')) {
        // カードの並びにXが含まれている場合の処理
        primeResultText = `X in ${playedCards.join(', ')}`;
      } else {
        // Xが含まれていない場合にのみ素数判定を行う
        const playedCardsNumber = BigInt(playedCards.join('')); // プレイされたカードを連結してBigIntに変換
        const isPrimeNumber = isPrime(playedCardsNumber); // 連結した数が素数か判定
        primeResultText = `${playedCardsNumber.toString()} ${isPrimeNumber ? "is a prime" : "is not a prime"}`;
      }

      // 履歴エントリにテキストを設定し、履歴表示領域にエントリを追加
      const historyEntry = document.createElement('div');
      historyEntry.textContent = `${playedCards.join(', ')} (${primeResultText})`;
      historyElement.appendChild(historyEntry);

    }

    // 山札の末尾にカードを追加し、upperRowからカードを削除
    playedCards.forEach(cardText => {
      deck.push(cardText); // 山札の末尾にカードを追加
    });
    cards.forEach(card => {
      upperRow.removeChild(card); // upperRowからカードを削除
    });
  }

  // 山札を作り直し、シャッフルして11枚を配り直す関数
  function resetAndDeal() {
    // 山札をリセット
    deck = shuffle(createDeck());

    // カードを全て削除
    while (lowerRow.firstChild) {
      lowerRow.removeChild(lowerRow.firstChild);
    }
    while (upperRow.firstChild) {
      upperRow.removeChild(upperRow.firstChild);
    }

    // 新しい山札から11枚を配る
    for (let i = 0; i < 11; i++) {
      drawCard();
    }
  }

  function resetAndDeal24() {
    // 山札をリセット
    deck = shuffle(createDeck());

    // カードを全て削除
    while (lowerRow.firstChild) {
      lowerRow.removeChild(lowerRow.firstChild);
    }
    while (upperRow.firstChild) {
      upperRow.removeChild(upperRow.firstChild);
    }

    // 新しい山札から11枚を配る
    for (let i = 0; i < 24; i++) {
      drawCard();
    }
  }

  // リセットボタンにイベントリスナーを設定
  document.getElementById('resetDeck').addEventListener('click', resetAndDeal);
  document.getElementById('resetDeck24').addEventListener('click', resetAndDeal24);


  // ボタンにイベントリスナーを追加
  document.getElementById('drawCard').addEventListener('click', drawCard);
  document.getElementById('playHand').addEventListener('click', playHand);


  // 最初の11枚をドロー
  for (let i = 0; i < 11; i++) {
    drawCard();
  }

  // 上段のカードのクリックイベントを設定
  upperRow.addEventListener('click', function(e) {
    if (e.target.classList.contains('card')) {
      lowerRow.appendChild(e.target); // カードを下段に移動
      sortLowerRow(); // 下段にカードを追加した後に並び替えを実行
    }
  });

  // 下段のカードのクリックイベントを設定
  lowerRow.addEventListener('click', function(e) {
    if (e.target.classList.contains('card')) {
      upperRow.appendChild(e.target); // カードを上段に移動
    }
  });
});
