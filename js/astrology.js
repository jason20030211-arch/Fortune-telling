// ASTROLOGY ENGINE - 星寰命理

// 1. 生命靈數與九宮數計算
function calculateNumerologyData(dateStr) {
  // dateStr is "YYYY-MM-DD"
  const digits = dateStr.replace(/[^0-9]/g, '').split('').map(Number);
  
  // 計算生命靈數 (Life Path Number)
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && ![11, 22, 33, 44].includes(sum)) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  const lifeNumber = sum;

  // 計算九宮數 (1-9 統計)
  const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};
  digits.forEach(d => {
    if (d >= 1 && d <= 9) {
      counts[d]++;
    }
  });

  // 計算缺數 (Missing numbers)
  const missing = [];
  for (let i = 1; i <= 9; i++) {
    if (counts[i] === 0) {
      missing.push(i);
    }
  }

  return {
    lifeNumber,
    counts,
    missing
  };
}

// 2. 西洋星座判定
function calculateWesternZodiac(dateStr) {
  const parts = dateStr.split('-');
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  let key = "Aries";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) key = "Aries";
  else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) key = "Taurus";
  else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) key = "Gemini";
  else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) key = "Cancer";
  else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) key = "Leo";
  else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) key = "Virgo";
  else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) key = "Libra";
  else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) key = "Scorpio";
  else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) key = "Sagittarius";
  else if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) key = "Capricorn";
  else if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) key = "Aquarius";
  else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) key = "Pisces";

  return {
    key,
    data: ASTRO_DATA.zodiacs[key]
  };
}

// 3. 東方生肖地支判定 (考慮立春)
function calculateEasternZodiac(dateStr) {
  const parts = dateStr.split('-');
  const rawYear = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  
  // 立春判定：一般在西元 2 月 4 日左右。簡化判定：若 1 月，或 2 月 4 日前，則屬上一年。
  let adjustedYear = rawYear;
  if (month === 1 || (month === 2 && day < 4)) {
    adjustedYear = rawYear - 1;
  }
  
  const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  // 公元 4 年是甲子年 (鼠年，子宮)
  const index = (adjustedYear - 4) % 12 >= 0 ? (adjustedYear - 4) % 12 : ((adjustedYear - 4) % 12) + 12;
  const branch = earthlyBranches[index];
  
  const zodiacInfo = ASTRO_DATA.easternZodiacs[index];
  
  return {
    year: adjustedYear,
    branch,
    branchIndex: index,
    zodiacInfo
  };
}

// 4. 簡易紫微斗數排盤
// 傳回一個陣列，大小為12，每個元素代表一個宮位，順序為子至亥（0: 子, 1: 丑, ..., 11: 亥）
function calculateZiweiChart(dateStr, birthHour) {
  const parts = dateStr.split('-');
  const month = parseInt(parts[1]); // 1 - 12
  const day = parseInt(parts[2]);   // 1 - 31
  const hourVal = parseInt(birthHour); // 0 (子) - 11 (亥)

  // 12 地支名稱
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  
  // 12 宮位名稱順序
  const palaces = ["命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "遷移宮", "交友宮", "官祿宮", "田宅宮", "福德宮", "父母宮"];

  // 1. 計算命宮地支索引：
  // 傳統口訣：從寅宮起正月，順數月，逆數時。
  // 寅是 index 2。
  // 順數月： 2 + (month - 1)
  // 逆數時： - hourVal
  let mingGongIdx = (2 + (month - 1) - hourVal + 24) % 12;

  // 2. 準備 12 個地支宮位資料
  const cellData = [];
  for (let b = 0; b < 12; b++) {
    // 計算該地支宮位在命宮逆數順序中的宮位索引
    // 命宮為 0, 兄弟為 1 (逆時針分佈)
    // 地支順序為 子(0)->丑(1)->寅(2)...，宮位逆序為 命宮(0)->兄弟(1)...
    // 故宮位索引 = (mingGongIdx - b + 24) % 12
    const pIdx = (mingGongIdx - b + 24) % 12;
    
    cellData.push({
      branch: branches[b],
      palace: palaces[pIdx],
      stars: [],
      majorStars: []
    });
  }

  // 3. 安主要星曜 (以生日與月時做偽隨機分佈以維持視覺真實性與重現性)
  const seed = (month * 7 + day * 13 + hourVal * 3) % 12;
  
  // 紫微星與天府星
  const ziweiPos = (seed) % 12;
  const tianfuPos = (12 - ziweiPos + 4) % 12; // 傳統上天府與紫微有斜對角對稱關係
  
  cellData[ziweiPos].majorStars.push("紫微");
  cellData[tianfuPos].majorStars.push("天府");

  // 太陽與太陰 (依據時辰)
  const taiyangPos = (5 + hourVal) % 12; // 太陽在午(6)或前後
  const taiyinPos = (11 + hourVal) % 12; // 太陰在子(0)或前後
  cellData[taiyangPos].majorStars.push("太陽");
  cellData[taiyinPos].majorStars.push("太陰");

  // 武曲、貪狼、七殺、破軍 (與紫微相對應的星座)
  const wuquPos = (ziweiPos + 4) % 12;
  const tanlangPos = (ziweiPos + 8) % 12;
  const qishaPos = (tianfuPos + 2) % 12;
  const pojunPos = (tianfuPos + 6) % 12;
  
  cellData[wuquPos].majorStars.push("武曲");
  cellData[tanlangPos].majorStars.push("貪狼");
  cellData[qishaPos].majorStars.push("七殺");
  cellData[pojunPos].majorStars.push("破軍");

  // 安吉星與凶星 (如文昌、文曲、擎羊、陀羅)
  const wenchangPos = (10 - hourVal + 24) % 12;
  const wenquPos = (4 + hourVal) % 12;
  cellData[wenchangPos].stars.push("文昌");
  cellData[wenquPos].stars.push("文曲");

  const qingyangPos = (seed + 1) % 12;
  const tuoluoPos = (seed + 11) % 12;
  cellData[qingyangPos].stars.push("擎羊");
  cellData[tuoluoPos].stars.push("陀羅");

  return cellData;
}
