// DIGITAL RITUALS ENGINE - 星寰命理

let consecutiveShengJiao = 0;
let isTossing = false;

// 1. 擲筊請神
function tossJiaobei() {
  if (isTossing) return;
  isTossing = true;

  const leftWrapper = document.getElementById("jiaobei-left");
  const rightWrapper = document.getElementById("jiaobei-right");
  const leftBlock = leftWrapper.querySelector(".jiaobei");
  const rightBlock = rightWrapper.querySelector(".jiaobei");
  const btn = document.querySelector("button[onclick='tossJiaobei()']");
  const resultText = document.getElementById("divinationResult");
  const glow = document.getElementById("divinationGlow");

  // 停用按鈕並清除狀態
  btn.disabled = true;
  resultText.innerText = "筊杯在空中翻轉中...";
  glow.style.opacity = "0";

  leftBlock.className = "jiaobei";
  rightBlock.className = "jiaobei";

  // 強制重繪以重啟動畫
  void leftBlock.offsetWidth;

  // 隨機決定結果
  // 0: 聖筊 (左平右凸), 1: 聖筊 (左凸右平), 2: 笑筊 (雙平), 3: 陰筊 (雙凸)
  const outcome = Math.floor(Math.random() * 4);
  
  let leftConvex = false;
  let rightConvex = false;
  let resultStr = "";
  let explStr = "";
  let glowColor = "rgba(255, 255, 255, 0.4)";

  if (outcome === 0) {
    leftConvex = false;
    rightConvex = true;
    consecutiveShengJiao++;
    resultStr = "【聖筊】 🌟";
    explStr = "神明應允！所求之事十分順遂，可放心前進。";
    glowColor = "radial-gradient(circle, rgba(0, 250, 154, 0.5) 0%, transparent 70%)";
  } else if (outcome === 1) {
    leftConvex = true;
    rightConvex = false;
    consecutiveShengJiao++;
    resultStr = "【聖筊】 🌟";
    explStr = "神明應允！一陰一陽，吉星高照，所問之事心想事成。";
    glowColor = "radial-gradient(circle, rgba(0, 250, 154, 0.5) 0%, transparent 70%)";
  } else if (outcome === 2) {
    leftConvex = false;
    rightConvex = false;
    consecutiveShengJiao = 0;
    resultStr = "【笑筊】 😊";
    explStr = "神明笑而不答。意指陳述不清、心中已有答案、或時機未到，請重新整理思緒再行請示。";
    glowColor = "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)";
  } else {
    leftConvex = true;
    rightConvex = true;
    consecutiveShengJiao = 0;
    resultStr = "【陰筊 / 哭筊】 🤫";
    explStr = "神明不應允。意指此路不通、時機不對或有所阻礙，建議換個方向或暫緩進行。";
    glowColor = "radial-gradient(circle, rgba(255, 107, 107, 0.4) 0%, transparent 70%)";
  }

  // 加入旋轉拋擲動畫類別
  leftBlock.classList.add("tossing-left");
  rightBlock.classList.add("tossing-right");

  // 1.4秒動畫結束後定位
  setTimeout(() => {
    leftBlock.classList.remove("tossing-left");
    rightBlock.classList.remove("tossing-right");

    // 設定最終靜止的 3D 狀態
    leftBlock.classList.add(leftConvex ? "state-convex" : "state-flat");
    rightBlock.classList.add(rightConvex ? "state-convex" : "state-flat");

    // 更新介面
    document.getElementById("shengJiaoCount").innerText = consecutiveShengJiao;
    resultText.innerText = resultStr;
    document.getElementById("divinationExpl").innerText = explStr;

    // 顯示背景發光
    glow.style.background = glowColor;
    glow.style.opacity = "1";

    btn.disabled = false;
    isTossing = false;
  }, 1400);
}

function resetJiaobei() {
  consecutiveShengJiao = 0;
  document.getElementById("shengJiaoCount").innerText = "0";
  document.getElementById("divinationResult").innerText = "請點擊下方按鈕進行擲筊";
  document.getElementById("divinationExpl").innerText = "※ 聖筊（一正一反 - 同意）；笑筊（雙平朝上 - 神明笑而不答）；陰筊（雙凸朝上 - 不同意）。";
  document.getElementById("jiaobei-left").querySelector(".jiaobei").className = "jiaobei";
  document.getElementById("jiaobei-right").querySelector(".jiaobei").className = "jiaobei";
  document.getElementById("divinationGlow").style.opacity = "0";
}


// 2. 數位點燈祈福
const maxLamps = 24;
let lampDatabase = [
  { id: 1, name: "林*君", type: "光明燈", wish: "保佑全家身體健康，出入平安", date: "2026-06-01" },
  { id: 2, name: "陳*廷", type: "財神燈", wish: "希望今年創業順利，業績翻倍", date: "2026-06-03" },
  { id: 3, name: "黃*萱", type: "姻緣燈", wish: "求得好姻緣，早日遇到對的人", date: "2026-06-05" },
  { id: 4, name: "張*豪", type: "太歲燈", wish: "今年犯太歲，求大事化小、平平安安", date: "2026-06-07" },
  { id: 5, name: "王*華", type: "光明燈", wish: "金榜題名，研究所考試順利錄取", date: "2026-06-09" }
];

function initLampWall() {
  const wall = document.getElementById("lampWall");
  wall.innerHTML = "";

  // 隨機在 24 格中安放預載好的明燈
  const positions = Array.from({ length: maxLamps }, (_, i) => i);
  
  // 建立 24 盞燈元件
  for (let i = 0; i < maxLamps; i++) {
    const lampEl = document.createElement("div");
    lampEl.className = "lamp-item";
    lampEl.dataset.index = i;
    wall.appendChild(lampEl);
  }

  // 填充已有的點燈數據
  lampDatabase.forEach((data, index) => {
    if (index < maxLamps) {
      const lamp = wall.children[index];
      lamp.classList.add("lit");
      
      const tooltip = document.createElement("div");
      tooltip.className = "lamp-tooltip";
      tooltip.innerHTML = `<strong>${data.name}</strong><br>類別：${data.type}<br>願望：${data.wish}<br><small>${data.date}</small>`;
      lamp.appendChild(tooltip);
    }
  });
}

function lightCandle(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById("lightName");
  const typeSelect = document.getElementById("lightType");
  const wishInput = document.getElementById("lightWish");

  const name = nameInput.value.trim();
  const type = typeSelect.value;
  const wish = wishInput.value.trim();

  if (!name || !wish) {
    showToast("請填寫姓名與祈願心願！");
    return;
  }

  // 遮罩姓名保護隱私 (例如：張小明 -> 張*明, 歐陽菲菲 -> 歐*菲)
  let maskedName = name;
  if (name.length === 2) {
    maskedName = name[0] + "*";
  } else if (name.length > 2) {
    maskedName = name[0] + "*" + name[name.length - 1];
  }

  const currentDate = new Date().toISOString().split('T')[0];

  // 尋找下一個未點亮的燈位置
  const wall = document.getElementById("lampWall");
  const unlitLamps = Array.from(wall.children).filter(lamp => !lamp.classList.contains("lit"));

  if (unlitLamps.length === 0) {
    showToast("目前燈牆已滿！神明已接收到所有人願望，正在為您開拓新燈牆。");
    // 重置一些燈
    initLampWall();
    return;
  }

  const targetLamp = unlitLamps[0];
  targetLamp.classList.add("lit");

  const newLampData = {
    id: lampDatabase.length + 1,
    name: maskedName,
    type,
    wish,
    date: currentDate
  };
  
  lampDatabase.push(newLampData);

  const tooltip = document.createElement("div");
  tooltip.className = "lamp-tooltip";
  tooltip.innerHTML = `<strong>${newLampData.name}</strong><br>類別：${newLampData.type}<br>願望：${newLampData.wish}<br><small>${newLampData.date}</small>`;
  targetLamp.appendChild(tooltip);

  showToast(`點燈成功！您的「${type}」已成功點亮。`);
  
  // 清空表單
  nameInput.value = "";
  wishInput.value = "";
}
