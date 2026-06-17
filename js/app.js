// MAIN APP CONTROLLER - 星寰命理

// 全局狀態
window.userAstrologyData = null;
let currentQuestionIndex = 0;
let quizScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

// 1. 初始化頁面
document.addEventListener("DOMContentLoaded", () => {
  // 初始化導覽切換
  initNavigation();
  // 初始化點燈牆
  initLampWall();
  // 初始化水晶工坊
  initBraceletWorkshop();
  // 渲染文章與課程
  renderAcademy();
  // 設定預設預約日期為明天
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("bookDate").value = tomorrow.toISOString().split('T')[0];
});

// SPA 頁面切換
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetTab = item.dataset.tab;
      switchTab(targetTab);
    });
  });

  // 行動端 Menu 切換
  const menuToggle = document.getElementById("menuToggleBtn");
  const sidebar = document.querySelector(".sidebar");
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
  });

  // 點擊側邊欄外區域自動關閉
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains("mobile-open")) {
        sidebar.classList.remove("mobile-open");
      }
    }
  });
}

function switchTab(tabId) {
  // 切換側邊欄 active 狀態
  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.dataset.tab === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // 切換內容區塊 active 狀態
  document.querySelectorAll(".tab-content").forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });

  // 關閉行動端側邊欄
  document.querySelector(".sidebar").classList.remove("mobile-open");

  // 平滑滾動到頂部
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast(`切換至：${getTabChineseName(tabId)}`);
}

function getTabChineseName(tabId) {
  const names = {
    home: "首頁平台",
    astrology: "星盤解碼",
    mbti: "心理探索",
    rituals: "數位祭祀",
    workshop: "能量工坊",
    academy: "命理學院",
    consulting: "大師親算"
  };
  return names[tabId] || tabId;
}

// 2. 星盤二級分頁切換
function switchSubTab(subTabId) {
  const report = document.getElementById("astroReport");
  report.querySelectorAll(".subtab-btn").forEach(btn => {
    if (btn.getAttribute("onclick").includes(subTabId)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  report.querySelectorAll(".subtab-content").forEach(content => {
    if (content.id === `subtab-${subTabId}`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}


// 六十甲子太歲對照表輔助函數
function getTaishuiName(year) {
  const taishui60 = [
    "甲子金辨", "乙丑陳材", "丙寅耿章", "丁卯沈興", "戊辰趙達", "己巳郭燦", 
    "庚午王清", "辛未李素", "壬申劉旺", "癸酉康志", "甲戌施廣", "乙亥任保", 
    "丙子郭嘉", "丁丑汪文", "戊寅曾光", "己卯龍仲", "庚辰董德", "辛巳鄭但", 
    "壬午陸明", "癸未魏仁", "甲申方傑", "乙酉蔣崇", "丙戌白敏", "丁亥封濟", 
    "戊子鄒鏜", "己丑傅佑", "庚寅鄔桓", "辛卯范寧", "壬辰彭泰", "癸巳徐單", 
    "甲午章詞", "乙未楊仙", "丙申管仲", "丁酉唐傑", "戊戌姜武", "己亥謝太", 
    "庚子盧秘", "辛丑楊信", "壬寅賀諤", "癸卯皮時", "甲辰李誠", "乙巳吳遂", 
    "丙午文哲", "丁未繆丙", "戊申徐浩", "己酉程寶", "庚戌倪秘", "辛亥葉堅", 
    "壬子邶單", "癸丑朱得", "甲寅張朝", "乙卯萬清", "丙辰辛亞", "丁巳易單", 
    "戊午黎卿", "己未魏契", "庚申毛梓", "辛酉石政", "壬戌洪充", "癸亥虞程"
  ];
  // 1984 年為甲子年 (index 0)
  let offset = (year - 1984) % 60;
  if (offset < 0) offset += 60;
  return taishui60[offset] + "星君";
}


// 3. 星盤大數據運算與渲染
function calculateAstrology(event) {
  event.preventDefault();

  const name = document.getElementById("userName").value.trim();
  const birthDate = document.getElementById("birthDate").value;
  const birthHour = document.getElementById("birthHour").value;

  if (!name || !birthDate) {
    showToast("請完整填寫姓名與出生日期！");
    return;
  }

  // 進行計算
  const numerology = calculateNumerologyData(birthDate);
  const western = calculateWesternZodiac(birthDate);
  const eastern = calculateEasternZodiac(birthDate);
  const ziweiData = calculateZiweiChart(birthDate, birthHour);

  // 儲存全域狀態
  window.userAstrologyData = {
    name, birthDate, birthHour,
    lifeNumber: numerology.lifeNumber,
    counts: numerology.counts,
    missing: numerology.missing,
    zodiac: western.data,
    zodiacKey: western.key,
    eastern: eastern
  };

  // 渲染 UI 資訊
  renderSummaryTab(name, numerology, western, eastern);
  renderNumerologyTab(numerology);
  renderWesternTab(western);
  renderEasternTab(eastern, birthDate);
  renderZiweiTab(ziweiData, name, birthDate, birthHour);

  // 顯示報告面板
  document.getElementById("astroReport").style.display = "block";
  
  // 移動至報告區塊
  document.getElementById("astroReport").scrollIntoView({ behavior: "smooth" });
  
  showToast("命格星盤運算完成！");
}

function renderSummaryTab(name, num, west, east) {
  // 基礎摘要值
  document.getElementById("res-num").innerText = num.lifeNumber;
  document.getElementById("res-num-name").innerText = `${ASTRO_DATA.lifeNumbers[num.lifeNumber].name} (${num.lifeNumber}號人)`;
  
  document.getElementById("res-zodiac").innerText = `${west.data.name} ${west.data.icon}`;
  
  const elementMap = { fire: "火", earth: "土", air: "風", water: "水" };
  const modeMap = { cardinal: "本位", fixed: "固定", mutable: "變動" };
  document.getElementById("res-zodiac-attrs").innerText = `${elementMap[west.data.element]}象星座 / ${modeMap[west.data.mode]}星座`;

  document.getElementById("res-animal").innerText = `屬${east.zodiacInfo.name} (${east.branch})`;
  document.getElementById("res-branch").innerText = `${east.branch}宮 / 本命佛：${east.zodiacInfo.buddha}`;

  // 建立大篇幅綜合報告
  const missingText = num.missing.length > 0 
    ? `九宮中缺乏數字 <strong>【${num.missing.join(", ")}】</strong>，表示您先天在此類能量上稍有防備或需要補強` 
    : "您的九宮格數極為圓滿平衡，實屬罕見的先天調和磁場";

  const crystalRecoms = num.missing.map(n => ASTRO_DATA.missingNumbers[n].crystal).join("、");
  const crystalSug = num.missing.length > 0 
    ? `建議平日可配戴 <strong>${crystalRecoms}</strong> 來補強命格缺數的能量`
    : "建議配戴白水晶以放大各方運勢，維持全身氣場潔淨";

  const summaryHtml = `
    親愛的 <strong>${name}</strong> 信士您好：<br><br>
    根據您的生命密碼，您的生命靈數為 <strong>${num.lifeNumber} 號 ${ASTRO_DATA.lifeNumbers[num.lifeNumber].name}</strong>，具備「${ASTRO_DATA.lifeNumbers[num.lifeNumber].trait}」的顯性特徵。<br>
    在西方占星的黃道十二宮中，您誕生於 <strong>${west.data.name} (${west.data.icon})</strong>，受到${elementMap[west.data.element]}元素與${modeMap[west.data.mode]}模式的支配。這賦予了您「${west.data.desc}」的性格面貌。<br><br>
    而在中國傳統地支曆法中，您的生肖年份經立春精準校正為 <strong>${east.year} (${east.branch}${east.zodiacInfo.name}年)</strong>。這使您的靈魂與廿八星宿的 <strong>${east.zodiacInfo.star}</strong> 相連結，一生由大悲大願的 <strong>${east.zodiacInfo.buddha}</strong> 作為本命守護神。<br><br>
    經過綜合大數據算命分析：${missingText}。${crystalSug}。本平台已將此能量演算結果與您的「能量水晶手鍊工坊」連通，您可一鍵套用水晶配置，將虛擬的命理解碼轉化為實體的守護支持。
  `;

  document.getElementById("res-summary-text").innerHTML = summaryHtml;
}

function renderNumerologyTab(num) {
  // 更新九宮格 UI
  for (let i = 1; i <= 9; i++) {
    const count = num.counts[i];
    const cell = document.querySelector(`.grid-cell[data-num='${i}']`);
    const countLabel = document.getElementById(`count-${i}`);
    
    countLabel.innerText = count;
    if (count > 0) {
      cell.classList.add("has-number");
    } else {
      cell.classList.remove("has-number");
    }
  }

  // 填充靈數文案
  document.getElementById("num-path-desc").innerText = `${num.lifeNumber} 號人性格特質 - ${ASTRO_DATA.lifeNumbers[num.lifeNumber].desc}`;
  
  // 大師數判斷
  if ([11, 22, 33, 44].includes(num.lifeNumber)) {
    document.getElementById("num-master-desc").innerHTML = `<strong style="color:var(--color-gold);">${num.lifeNumber} 大師數：</strong>${ASTRO_DATA.lifeNumbers[num.lifeNumber].desc}`;
  } else {
    document.getElementById("num-master-desc").innerText = "您本次生命旅途不屬於高頻大師數，專注於主線號人的成長課題即是完美。";
  }

  // 缺數解析
  if (num.missing.length > 0) {
    const missingItems = num.missing.map(n => `【數字 ${n} (${ASTRO_DATA.missingNumbers[n].name})】：${ASTRO_DATA.missingNumbers[n].lack}`).join("<br>");
    document.getElementById("num-missing-desc").innerHTML = missingItems;
  } else {
    document.getElementById("num-missing-desc").innerText = "恭喜，您的生日數字無缺數，各脈輪能量流動穩定。";
  }

  // 能量水晶標籤
  const tagsContainer = document.getElementById("num-crystal-tags");
  tagsContainer.innerHTML = "";
  
  if (num.missing.length > 0) {
    num.missing.forEach(n => {
      const data = ASTRO_DATA.missingNumbers[n];
      const cryObj = ASTRO_DATA.crystals.find(c => c.number === n);
      const colorHex = cryObj ? cryObj.color : "#ccc";
      
      const tag = document.createElement("span");
      tag.className = "crystal-tag";
      tag.innerHTML = `<span class="crystal-dot" style="background-color: ${colorHex};"></span>${data.crystal} (補強${data.name})`;
      tagsContainer.appendChild(tag);
    });
  } else {
    tagsContainer.innerHTML = `<span class="crystal-tag"><span class="crystal-dot" style="background-color: #fff;"></span>白水晶 (放大全方位能量)</span>`;
  }
}

function renderWesternTab(west) {
  // 轉動星座輪盤
  const zodiacKeys = Object.keys(ASTRO_DATA.zodiacs);
  const zodiacIndex = zodiacKeys.indexOf(west.key);
  
  // 計算旋轉度數。指針指向最上方，Aries在正上方(0度)，每個星座差 30 度。
  // 我們要把目標星座轉到指針位置，所以要逆時針轉對應角度。
  const rotation = - (zodiacIndex * 30);
  const wheel = document.getElementById("zodiacWheel");
  wheel.style.transform = `rotate(${rotation}deg)`;

  // 高亮標示目前星座 sector
  document.querySelectorAll(".wheel-sector").forEach((sec, idx) => {
    if (idx === zodiacIndex) {
      sec.classList.add("active-sector");
    } else {
      sec.classList.remove("active-sector");
    }
  });

  // 星座詳細資訊
  document.getElementById("res-zodiac-title").innerText = `${west.data.name} ${west.data.icon}`;
  
  const elementMap = { fire: "火象星座", earth: "土象星座", air: "風象星座", water: "水象星座" };
  const modeMap = { cardinal: "本位星座", fixed: "固定星座", mutable: "變動星座" };
  
  const elemBadge = document.getElementById("res-zodiac-element");
  elemBadge.innerText = elementMap[west.data.element];
  elemBadge.className = `badge badge-${west.data.element}`;

  const modeBadge = document.getElementById("res-zodiac-mode");
  modeBadge.innerText = modeMap[west.data.mode];
  modeBadge.className = `badge badge-${west.data.mode}`;

  document.getElementById("res-zodiac-polarity").innerText = `${west.data.polarity}極性`;
  document.getElementById("res-zodiac-desc").innerText = west.data.desc;
}

function renderEasternTab(east, dateStr) {
  const parts = dateStr.split('-');
  const rawYear = parseInt(parts[0]);

  document.getElementById("res-animal-title").innerText = `生肖屬性：屬${east.zodiacInfo.name} 🐯`;
  document.getElementById("res-eastern-branch").innerText = `${east.branch}宮 (地支：${east.branch})`;
  document.getElementById("res-eastern-star").innerText = `${east.zodiacInfo.star} (廿八星宿對應)`;
  document.getElementById("res-animal-desc").innerText = east.zodiacInfo.desc;

  // 守護神與太歲
  document.getElementById("res-buddha-name").innerText = east.zodiacInfo.buddha;
  document.getElementById("res-buddha-desc").innerText = east.zodiacInfo.buddhaDesc;
  
  // 計算流年太歲星君
  const taishuiName = getTaishuiName(rawYear);
  document.getElementById("res-taishui-name").innerText = taishuiName;
}

function renderZiweiTab(ziweiData, name, dateStr, birthHour) {
  const grid = document.getElementById("ziweiGrid");
  grid.innerHTML = "";

  // 1. 先生成中央顯示卡片 (2x2)
  const centerEl = document.createElement("div");
  centerEl.className = "ziwei-center";
  centerEl.innerHTML = `
    <span class="ziwei-center-title">${name} 命盤</span>
    <small style="color:var(--text-secondary); margin-top:5px;">生日：${dateStr}</small>
    <small style="color:var(--text-muted);">${document.getElementById("birthHour").options[parseInt(birthHour)].text}</small>
  `;
  grid.appendChild(centerEl);

  // 2. 依序生成 12 宮位格子並加入 CSS 座標 class
  // 順序從 0 到 11，分別對應 子到亥
  ziweiData.forEach((cell, idx) => {
    const cellEl = document.createElement("div");
    cellEl.className = `ziwei-cell ziwei-c-${idx}`;

    // 宮位星曜組合 HTML
    const majorStarsHtml = cell.majorStars.map(s => `<span class="ziwei-stars major">${s}</span>`).join("");
    const starsHtml = cell.stars.map(s => `<span class="ziwei-stars">${s}</span>`).join("");

    cellEl.innerHTML = `
      <div class="ziwei-cell-top">
        <div style="display:flex; flex-direction:column; gap:2px;">
          ${majorStarsHtml}
          ${starsHtml}
        </div>
        <div class="ziwei-palace-name">${cell.palace}</div>
      </div>
      <div class="ziwei-cell-bottom">
        <span>--</span>
        <span class="ziwei-branch">${cell.branch}</span>
      </div>
    `;
    grid.appendChild(cellEl);
  });
}

// 一鍵套用缺數水晶至手鍊工坊
function applyCrystalSuggestion() {
  if (!window.userAstrologyData) {
    showToast("請先點擊上方星盤運算！");
    return;
  }
  switchTab("workshop");
  quickFillBracelet("missing");
}

// 匯出 PDF 報告檔案模擬
function exportReport() {
  if (!window.userAstrologyData) return;
  const name = window.userAstrologyData.name;
  showToast("正在生成 PDF 分析報告，請稍候...");
  setTimeout(() => {
    alert(`【星寰命理 - 個人綜合分析報告】\n\n信士姓名：${name}\n出生時間：${window.userAstrologyData.birthDate} ${document.getElementById("birthHour").options[parseInt(window.userAstrologyData.birthHour)].text}\n生命靈數：${window.userAstrologyData.lifeNumber} 號人\n西方星座：${window.userAstrologyData.zodiac.name}\n生肖干支：${window.userAstrologyData.eastern.zodiacInfo.name} (${window.userAstrologyData.eastern.branch})\n守護神佛：${window.userAstrologyData.eastern.zodiacInfo.buddha}\n\n報告模擬下載成功！(已儲存至您的虛擬下載資料夾)`);
  }, 1200);
}


// --------------------------------------------------------------------------
// 4. MBTI 測驗流程控制
// --------------------------------------------------------------------------
function startMbtiQuiz() {
  document.getElementById("mbti-start").style.display = "none";
  document.getElementById("mbti-result").style.display = "none";
  document.getElementById("mbti-quiz").style.display = "block";
  
  currentQuestionIndex = 0;
  quizScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  showMbtiQuestion();
}

function showMbtiQuestion() {
  const q = ASTRO_DATA.mbtiQuestions[currentQuestionIndex];
  
  // 更新進度條
  const progressPercent = ((currentQuestionIndex + 1) / ASTRO_DATA.mbtiQuestions.length) * 100;
  document.getElementById("quiz-progress-bar").style.width = `${progressPercent}%`;
  document.getElementById("quiz-progress-text").innerText = `問題 ${currentQuestionIndex + 1} / ${ASTRO_DATA.mbtiQuestions.length}`;

  // 顯示題目
  document.getElementById("quiz-question-text").innerText = q.question;

  // 填充選項
  const container = document.getElementById("quiz-options-container");
  container.innerHTML = "";
  
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.innerText = opt.text;
    btn.onclick = () => selectMbtiOption(opt.score);
    container.appendChild(btn);
  });
}

function selectMbtiOption(score) {
  quizScores[score]++;
  currentQuestionIndex++;

  if (currentQuestionIndex < ASTRO_DATA.mbtiQuestions.length) {
    showMbtiQuestion();
  } else {
    calculateMbtiResult();
  }
}

function calculateMbtiResult() {
  document.getElementById("mbti-quiz").style.display = "none";
  document.getElementById("mbti-result").style.display = "block";

  // 評估四個維度
  const mbti = 
    (quizScores.E >= quizScores.I ? "E" : "I") +
    (quizScores.S >= quizScores.N ? "S" : "N") +
    (quizScores.T >= quizScores.F ? "T" : "F") +
    (quizScores.J >= quizScores.P ? "J" : "P");

  const mbtiNormalized = mbti.replace("S", "S").replace("F", "F").replace("P", "P"); // case normalize if needed. In ASTRO_DATA, INFJ, ISTJ etc. are keys. Wait, we have ISfj (lowercase f, j) in ASTRO_DATA. Let's fix keys in data.js to be uppercase! Let's ensure standard casing.
  // Wait, let's look at ASTRO_DATA.mbtiTypes in data.js:
  // INFP, INFJ, INTJ, INTP, ENFJ, ENTJ, ENFP, ENTP, ISfj (key is 'ISfj' but let's check it: yes it's 'ISfj' in my code content. I should look it up case insensitively or fix casing!)
  // Let's look up with case-insensitivity:
  const targetKey = Object.keys(ASTRO_DATA.mbtiTypes).find(k => k.toUpperCase() === mbti.toUpperCase()) || "INFJ";
  const resultData = ASTRO_DATA.mbtiTypes[targetKey];

  // 顯示 MBTI 結果
  document.getElementById("mbti-result-type").innerText = targetKey.toUpperCase();
  document.getElementById("mbti-result-title").innerText = resultData.title;
  document.getElementById("mbti-result-desc").innerText = resultData.desc;

  // 水晶建議
  const crystalObj = ASTRO_DATA.crystals.find(c => c.name === resultData.crystal) || ASTRO_DATA.crystals[0];
  document.getElementById("mbti-crystal-desc").innerHTML = `
    依據您的性格特徵，建議配戴具有平衡功效的 <strong>${resultData.crystal}</strong> (${crystalObj.desc})。
  `;

  // 靈數跨界融合文案
  let fusionText = "尚未進行星盤計算。建議您到「星盤解碼」頁面輸入生日，我們將為您揭曉『MBTI 心理人格』與『生命靈數』的古今大數據融合指引！";
  if (window.userAstrologyData) {
    const lifeNum = window.userAstrologyData.lifeNumber;
    fusionText = `
      您的生命靈數為 <strong>${lifeNum} 號人</strong>，搭配 <strong>${targetKey.toUpperCase()}</strong> 人格，展現出獨特的磁場優勢。<br>
      身為 ${ASTRO_DATA.lifeNumbers[lifeNum].name}，你的靈數能量強調「${ASTRO_DATA.lifeNumbers[lifeNum].trait}」，與 ${targetKey.toUpperCase()} 的性格特質相加，能將「${resultData.title}」的特點發揮到極致。日常中，要特別注意防止因為 ${ASTRO_DATA.lifeNumbers[lifeNum].name} 的盲點影響了人際互動，可適當配戴 ${resultData.crystal} 以補充能量。
    `;
  }
  document.getElementById("mbti-fusion-desc").innerHTML = fusionText;

  showToast(`探索結果生成：${targetKey.toUpperCase()}`);
}

function restartMbtiQuiz() {
  document.getElementById("mbti-result").style.display = "none";
  startMbtiQuiz();
}


// --------------------------------------------------------------------------
// 5. 命理教育學院文章與課程渲染
// --------------------------------------------------------------------------
function renderAcademy() {
  const artGrid = document.getElementById("articlesGrid");
  artGrid.innerHTML = "";
  ASTRO_DATA.articles.forEach(art => {
    const card = document.createElement("div");
    card.className = "glass-card article-card";
    card.onclick = () => readArticle(art.id);
    card.innerHTML = `
      <div class="article-photo ${art.class}"></div>
      <div class="article-info">
        <span class="badge badge-air" style="font-size:0.75rem;">${art.category}</span>
        <h4 style="margin-top:10px;">${art.title}</h4>
        <p>${art.brief}</p>
        <div class="article-meta">
          <span>作者：${art.author}</span>
          <span>發布時間：${art.date}</span>
        </div>
      </div>
    `;
    artGrid.appendChild(card);
  });

  const courseGrid = document.getElementById("coursesGrid");
  courseGrid.innerHTML = "";
  ASTRO_DATA.courses.forEach(c => {
    const card = document.createElement("div");
    card.className = "glass-card course-card";
    card.innerHTML = `
      <div class="course-photo ${c.class}"></div>
      <div class="course-info">
        <h4>${c.title}</h4>
        <p>${c.outline}</p>
        <div class="article-meta">
          <span>講師：<strong>${c.instructor}</strong></span>
          <span>評分：${c.rating} ★</span>
        </div>
        <div class="course-meta">
          <span class="course-hours">${c.hours}</span>
          <span class="course-price">${c.price}</span>
        </div>
        <button class="btn btn-secondary btn-sm btn-block" style="margin-top:15px; border-color:var(--color-emerald); color:var(--color-emerald);" onclick="enrollCourse('${c.title}')">模擬線上選課報名</button>
      </div>
    `;
    courseGrid.appendChild(card);
  });
}

function readArticle(id) {
  const art = ASTRO_DATA.articles.find(a => a.id === id);
  if (art) {
    alert(`【星寰學術專欄 - 閱讀文章】\n\n標題：${art.title}\n作者：${art.author}\n分類：${art.category}\n\n《詳細內容》\n${art.brief}\n\n(※ 完整文章已成功解鎖，可於會員系統中查閱全部兩萬字精修論文。)`);
  }
}

function enrollCourse(title) {
  alert(`【課程報名系統】\n\n您已成功模擬報名課程：\n《${title}》\n\n系統已發送課程連結與上課密碼至您的信箱，隨時可於「線上課堂」開啟學習之旅！`);
}


// --------------------------------------------------------------------------
// 6. 大師預約與通知 Toast
// --------------------------------------------------------------------------
function submitBooking(event) {
  event.preventDefault();

  const master = document.getElementById("bookMaster").value;
  const service = document.getElementById("bookService").value;
  const date = document.getElementById("bookDate").value;
  const time = document.getElementById("bookTime").value;
  const user = document.getElementById("bookUser").value.trim();
  const phone = document.getElementById("bookPhone").value.trim();
  const note = document.getElementById("bookNote").value.trim();

  if (!user || !phone) {
    showToast("請填寫真實姓名與手機號碼！");
    return;
  }

  alert(`【預約親算諮詢成功】\n\n預約專家：${master}\n諮詢項目：${service}\n預約時間：${date} (${time})\n諮詢信士：${user} 先生/女士\n手機號碼：${phone}\n備註問題：${note || "無"}\n\n我們將於 2 hours 內發送付款簡訊與 Google Meet 會議連結，請留意您的手機！`);

  // 清空表單
  document.getElementById("bookUser").value = "";
  document.getElementById("bookPhone").value = "";
  document.getElementById("bookNote").value = "";
}

// 顯示 Toast 訊息
function showToast(message) {
  const toast = document.getElementById("appToast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
