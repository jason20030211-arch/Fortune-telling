// BRACELET CUSTOMIZER ENGINE - 星寰命理

const totalBeadsCount = 18;
let currentBraceletBeads = []; // Array of 18 crystal objects
let selectedPaletteCrystal = null;

// 初始化手鍊自訂器
function initBraceletWorkshop() {
  // 1. 預設調色盤選取第一個：黃水晶
  selectedPaletteCrystal = ASTRO_DATA.crystals[0];
  
  // 2. 渲染調色盤
  renderBeadPalette();

  // 3. 預設手鍊配置：多色平衡
  currentBraceletBeads = [];
  for (let i = 0; i < totalBeadsCount; i++) {
    // 循環放入水晶以維持平衡
    const crystalIndex = i % ASTRO_DATA.crystals.length;
    currentBraceletBeads.push(ASTRO_DATA.crystals[crystalIndex]);
  }

  // 4. 繪製手鍊與計算能量
  drawBracelet();
  calculateBraceletEnergy();
}

// 渲染天然水晶調色盤
function renderBeadPalette() {
  const paletteContainer = document.getElementById("beadPalette");
  paletteContainer.innerHTML = "";

  ASTRO_DATA.crystals.forEach(c => {
    const item = document.createElement("div");
    item.className = "palette-item";
    if (selectedPaletteCrystal && selectedPaletteCrystal.id === c.id) {
      item.classList.add("selected");
    }
    
    item.onclick = () => {
      // 切換選取
      document.querySelectorAll(".palette-item").forEach(p => p.classList.remove("selected"));
      item.classList.add("selected");
      selectedPaletteCrystal = c;
    };

    item.innerHTML = `
      <div class="palette-bead-preview" style="background-color: ${c.color};"></div>
      <strong>${c.name}</strong>
      <span>${getEnergyLabel(c.energy)}</span>
    `;
    paletteContainer.appendChild(item);
  });
}

function getEnergyLabel(eng) {
  switch(eng) {
    case "wealth": return "💰 招財";
    case "love": return "💖 桃花";
    case "health": return "🍀 健康";
    case "spirit": return "🔮 心靈";
    default: return "✨ 能量";
  }
}

// 動態繪製 SVG 圓形手鍊
function drawBracelet() {
  const container = document.getElementById("beadsContainer");
  container.innerHTML = "";

  const cx = 200;
  const cy = 200;
  const radius = 130;

  for (let i = 0; i < totalBeadsCount; i++) {
    const angleDegree = i * (360 / totalBeadsCount);
    const angleRad = (angleDegree * Math.PI) / 180;
    
    // 計算每顆珠子的中心坐標
    const x = cx + radius * Math.cos(angleRad);
    const y = cy + radius * Math.sin(angleRad);

    const crystal = currentBraceletBeads[i];

    // 建立珠子群組 (方便做懸停放大與點擊)
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "bracelet-bead");
    
    // 水晶圓珠
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 15);
    
    // 使用漸層或豐富發光模擬水晶質感
    circle.setAttribute("fill", crystal.color);
    circle.setAttribute("stroke", "rgba(255,255,255,0.2)");
    circle.setAttribute("stroke-width", "1");
    
    // 微光亮點效果 (模擬水晶的反光折射)
    const highlight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    highlight.setAttribute("cx", x - 5);
    highlight.setAttribute("cy", y - 5);
    highlight.setAttribute("r", 3);
    highlight.setAttribute("fill", "rgba(255,255,255,0.6)");
    
    // 點擊事件：點擊將其替換為當前調色盤選取的水晶
    g.onclick = () => {
      if (selectedPaletteCrystal) {
        currentBraceletBeads[i] = selectedPaletteCrystal;
        drawBracelet();
        calculateBraceletEnergy();
        showToast(`已將第 ${i+1} 顆珠子替換為 ${selectedPaletteCrystal.name}`);
      }
    };

    // 懸停提示
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `第 ${i+1} 顆：${crystal.name} (${crystal.desc})`;
    g.appendChild(title);

    g.appendChild(circle);
    g.appendChild(highlight);
    container.appendChild(g);
  }
}

// 計算手鍊中的能量比重並更新進度條
function calculateBraceletEnergy() {
  const counts = { wealth: 0, love: 0, health: 0, spirit: 0 };
  
  currentBraceletBeads.forEach(b => {
    if (counts[b.energy] !== undefined) {
      counts[b.energy]++;
    }
  });

  const wealthPct = Math.round((counts.wealth / totalBeadsCount) * 100);
  const lovePct = Math.round((counts.love / totalBeadsCount) * 100);
  const healthPct = Math.round((counts.health / totalBeadsCount) * 100);
  const spiritPct = 100 - (wealthPct + lovePct + healthPct); // 保證總合 100%

  // 更新 UI 能量條
  document.getElementById("bar-wealth").style.width = `${wealthPct}%`;
  document.getElementById("pct-wealth").innerText = `${wealthPct}%`;

  document.getElementById("bar-love").style.width = `${lovePct}%`;
  document.getElementById("pct-love").innerText = `${lovePct}%`;

  document.getElementById("bar-health").style.width = `${healthPct}%`;
  document.getElementById("pct-health-val").innerText = `${healthPct}%`;

  document.getElementById("bar-spirit").style.width = `${spiritPct}%`;
  document.getElementById("pct-spirit").innerText = `${spiritPct}%`;
}

// 快速配置手鍊
function quickFillBracelet(type) {
  if (type === 'wealth') {
    // 招財：黃水晶 (citrine) 與 綠幽靈 (greenphantom) 交替
    const citrine = ASTRO_DATA.crystals.find(c => c.id === 'citrine');
    const green = ASTRO_DATA.crystals.find(c => c.id === 'greenphantom');
    for (let i = 0; i < totalBeadsCount; i++) {
      currentBraceletBeads[i] = (i % 2 === 0) ? citrine : green;
    }
    showToast("已成功載入「招財開運手鍊」配置！");
  } else if (type === 'love') {
    // 桃花：粉晶 (rosequartz) 與 紫水晶 (amethyst) 交替
    const rose = ASTRO_DATA.crystals.find(c => c.id === 'rosequartz');
    const amethyst = ASTRO_DATA.crystals.find(c => c.id === 'amethyst');
    for (let i = 0; i < totalBeadsCount; i++) {
      currentBraceletBeads[i] = (i % 2 === 0) ? rose : amethyst;
    }
    showToast("已成功載入「桃花姻緣手鍊」配置！");
  } else if (type === 'missing') {
    // 九宮補能配置：根據當前使用者的缺數進行填充
    if (!window.userAstrologyData || !window.userAstrologyData.missing || window.userAstrologyData.missing.length === 0) {
      showToast("請先至『星盤解碼』輸入生日並運算，系統方能判別您的缺數能量！");
      return;
    }
    
    // 獲取缺數對應的推薦水晶
    const missingNums = window.userAstrologyData.missing; // 例如 [2, 5, 8]
    const recommendedCrystals = [];
    
    missingNums.forEach(num => {
      // 尋找對應缺數的水晶
      const cry = ASTRO_DATA.crystals.find(c => c.number === num);
      if (cry) recommendedCrystals.push(cry);
    });

    if (recommendedCrystals.length === 0) {
      showToast("您的先天能量極為平衡，無缺數！為您隨機配置全效守護手鍊。");
      initBraceletWorkshop();
      return;
    }

    // 填充手鍊：重複循環缺數推薦的水晶
    for (let i = 0; i < totalBeadsCount; i++) {
      const idx = i % recommendedCrystals.length;
      currentBraceletBeads[i] = recommendedCrystals[idx];
    }
    showToast(`已根據您的九宮缺數數字 (${missingNums.join(', ')}) 自動配置補強水晶手鍊！`);
  }

  drawBracelet();
  calculateBraceletEnergy();
}

// 提交實體手鍊需求單
function submitBraceletOrder(event) {
  event.preventDefault();

  const wristSize = document.getElementById("wristSize").value;
  const contact = document.getElementById("braceletContact").value.trim();
  const memo = document.getElementById("braceletMemo").value.trim();

  if (!contact) {
    showToast("請輸入聯絡方式！");
    return;
  }

  // 整理手鍊明細
  const beadCounts = {};
  currentBraceletBeads.forEach(b => {
    beadCounts[b.name] = (beadCounts[b.name] || 0) + 1;
  });

  const details = Object.entries(beadCounts).map(([name, count]) => `${name} x ${count}`).join(', ');

  console.log("實體手鍊定做單提交", { wristSize, contact, memo, details });
  
  // 顯示定做成功訊息
  alert(`【實體水晶手鍊定制成功】\n\n您配置的水晶：\n${details}\n\n手圍大小：${wristSize} cm\n聯絡資訊：${contact}\n特殊備註：${memo || "無"}\n\n命理專家將會於 24 小時內與您聯繫，確認編織工藝細節！`);
  
  // 清空聯絡資訊與備註
  document.getElementById("braceletContact").value = "";
  document.getElementById("braceletMemo").value = "";
}
