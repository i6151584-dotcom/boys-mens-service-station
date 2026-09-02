let categories = [];
let keywordData = {};
let trends = [];

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function fillSelect(selector, values) {
  const el = $(selector);
  if (!el) return;

  el.innerHTML =
    '<option value="">全部</option>' +
    values.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
}

function updateCat2() {
  const level1 = $('#cat1');
  const level2 = $('#cat2');

  if (!level1 || !level2) return;

  const value = level1.value;

  const values = uniq(
    categories
      .filter(x => !value || x['拆分一层品类'] === value)
      .map(x => x['拆分二层品类'])
  );

  fillSelect('#cat2', values);
}

function renderCats() {
  const audience = $('#audience')?.value || '';
  const cat1 = $('#cat1')?.value || '';
  const cat2 = $('#cat2')?.value || '';
  const search = ($('#catSearch')?.value || '').toLowerCase();

  const result = categories.filter(x => {
    const text = Object.values(x).join(' ').toLowerCase();

    return (
      (!audience || x['人群'] === audience) &&
      (!cat1 || x['拆分一层品类'] === cat1) &&
      (!cat2 || x['拆分二层品类'] === cat2) &&
      (!search || text.includes(search))
    );
  });

  const box = $('#catResults');
  if (!box) return;

  box.innerHTML = result.length
    ? result.map(x => `
        <div class="cat-item">
          <div>
            <strong>${esc(x['人群'])}</strong>
            <span>${esc(x['拆分一层品类'])}</span>
            <span>${esc(x['拆分二层品类'])}</span>
          </div>
          <p>${esc(x['类目路径'])}</p>
        </div>
      `).join('')
    : '<div class="cat-item">暂无匹配结果</div>';
}

function initCats() {
  if (!$('#audience')) return;

  fillSelect('#audience', uniq(categories.map(x => x['人群'])));
  fillSelect('#cat1', uniq(categories.map(x => x['拆分一层品类'])));

  updateCat2();
  renderCats();

  ['#audience', '#cat1', '#cat2', '#catSearch'].forEach(selector => {
    const el = $(selector);
    if (!el) return;

    el.addEventListener('input', () => {
      if (selector === '#cat1') {
        updateCat2();
      }

      renderCats();
    });
  });
}


/* =========================
   标题优化
========================= */

function translateKeyword(text) {
  const map = {
    'T恤': "T-Shirt",
    '短裤': "Shorts",
    '长裤': "Pants",
    '卫衣': "Hoodie",
    '夹克': "Jacket",
    '外套': "Jacket",
    '衬衫': "Shirt",
    'POLO衫': "Polo Shirt",
    '运动裤': "Jogger Pants",
    '休闲裤': "Casual Pants",

    '男士': "Men's",
    '男童': "Boys'",
    '儿童': "Kids'",
    '青少年': "Youth",

    '休闲': "Casual",
    '运动': "Sports",
    '户外': "Outdoor",
    '街头': "Streetwear",
    '复古': "Vintage",
    '潮流': "Trendy",
    '美式': "American",
    'Y2K': "Y2K",
    '复古运动': "Retro Sports",
    '都市休闲': "Urban Casual",

    '日常穿着': "Daily Wear",
    '运动训练': "Training",
    '户外休闲': "Outdoor Leisure",
    '健身': "Gym",
    '跑步': "Running",
    '篮球': "Basketball",
    '足球': "Soccer",
    '海滩': "Beach",
    '度假': "Vacation",
    '旅行': "Travel",

    '棉质': "Cotton",
    '纯棉': "100% Cotton",
    '水洗棉': "Washed Cotton",
    '亚麻': "Linen",
    '棉麻': "Cotton Linen",
    '针织': "Knit",
    '速干面料': "Quick-Dry",
    '轻量面料': "Lightweight",

    '宽松版型': "Relaxed Fit",
    '常规版型': "Regular Fit",
    '落肩': "Drop Shoulder",
    '直筒': "Straight Leg",
    '宽腿': "Wide Leg",
    '修身': "Slim Fit",
    'Oversized': "Oversized",

    '春季': "Spring",
    '夏季': "Summer",
    '秋季': "Fall",
    '冬季': "Winter",
    '秋冬': "Fall Winter",
    '春夏': "Spring Summer"
  };

  return map[text] || text;
}

function generateTitle() {
  const selects = $$('#keywordControls select');

  const selected = [];

  selects.forEach(select => {
    if (select.value) {
      selected.push(select.value);
    }
  });

  if (!selected.length) {
    return '';
  }

  let audience = '';
  let category = '';
  let style = '';
  let scene = '';
  let material = '';
  let fit = '';
  let season = '';

  selects.forEach(select => {
    if (!select.value) return;

    const index = Number(select.dataset.index);
    const dimension = keywordData.dimensions[index]?.dimension || '';

    if (dimension.includes('品类')) {
      category = translateKeyword(select.value);
    } else if (dimension === '人群') {
      audience = translateKeyword(select.value);
    } else if (dimension === '风格') {
      style = translateKeyword(select.value);
    } else if (dimension.includes('功能') || dimension.includes('场景')) {
      scene = translateKeyword(select.value);
    } else if (dimension === '材质') {
      material = translateKeyword(select.value);
    } else if (dimension === '版型') {
      fit = translateKeyword(select.value);
    } else if (dimension === '季节') {
      season = translateKeyword(select.value);
    }
  });

  const parts = [];

  if (audience) parts.push(audience);

  if (category) {
    parts.push(category);
  } else {
    parts.push(translateKeyword(selected[0]));
  }

  if (style) parts.push(style);

  if (material) parts.push(material);

  if (fit) parts.push(fit);

  if (scene) {
    parts.push(`for ${scene}`);
  }

  if (season) {
    parts.push(`${season} Wear`);
  }

  let title = parts.join(' ');

  title = title
    .replace(/\s+/g, ' ')
    .replace(/for Daily Wear Daily Wear/g, 'for Daily Wear')
    .trim();

  return title;
}

function initKeywords() {
  const formula = $('#formula');

  if (formula) {
    formula.textContent =
      keywordData.formula || '核心维度 + 重要维度 + 拓展维度';
  }

  const controls = $('#keywordControls');

  if (!controls) return;

  controls.innerHTML = (keywordData.dimensions || [])
    .map((d, i) => `
      <div class="keyword-card">
        <h4>
          ${esc(d.dimension)}
          <span class="priority">${esc(d.priority)}</span>
        </h4>

        <label>
          选择关键词
          <select data-index="${i}">
            <option value="">不添加</option>
            ${(d.terms || [])
              .map(t => `<option value="${esc(t)}">${esc(t)}</option>`)
              .join('')}
          </select>
        </label>
      </div>
    `)
    .join('');

  const button = $('#generateTitle');

  if (button) {
    button.addEventListener('click', () => {
      const title = generateTitle();

      const result = $('#titleResult');

      if (result) {
        result.value = title || '请选择关键词后生成标题';
      }
    });
  }

  const copyButton = $('#copyTitle');

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const result = $('#titleResult');

      if (!result || !result.value) return;

      try {
        await navigator.clipboard.writeText(result.value);

        copyButton.textContent = '已复制 ✓';

        setTimeout(() => {
          copyButton.textContent = '复制标题';
        }, 1500);
      } catch (e) {
        result.select();
        document.execCommand('copy');

        copyButton.textContent = '已复制 ✓';

        setTimeout(() => {
          copyButton.textContent = '复制标题';
        }, 1500);
      }
    });
  }
}


/* =========================
   趋势
========================= */

function loadTrends() {
  const box = $('#trendList');

  if (!box) return;

  box.innerHTML = trends
    .map(t => `
      <article class="trend-card">
        <div class="trend-head">
          <strong>${esc(t.market)}</strong>
          <span>${esc(t.week)}</span>
        </div>

        ${(t.items || [])
          .map(i => `
            <div class="trend-item">
              <b>${esc(i.title)}</b>
              <p>${esc(i.body)}</p>
            </div>
          `)
          .join('')}
      </article>
    `)
    .join('');
}


/* =========================
   页面初始化
========================= */

Promise.all([
  fetch('data/categories.json').then(r => {
    if (!r.ok) throw new Error('categories.json 加载失败');
    return r.json();
  }),

  fetch('data/keywords.json').then(r => {
    if (!r.ok) throw new Error('keywords.json 加载失败');
    return r.json();
  }),

  fetch('data/trends.json').then(r => {
    if (!r.ok) throw new Error('trends.json 加载失败');
    return r.json();
  })
])
  .then(([c, k, t]) => {
    categories = c;
    keywordData = k;
    trends = t;

    initCats();
    initKeywords();
    loadTrends();
  })
  .catch(err => {
    console.error(err);

    const box = $('#catResults');

    if (box) {
      box.innerHTML =
        '<div class="cat-item">数据加载失败，请确认 GitHub Pages 的文件路径正确。</div>';
    }
  });
