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


/* =========================
   类目指引
========================= */

function updateCat2() {
  const cat1 = $('#cat1');
  const cat2 = $('#cat2');

  if (!cat1 || !cat2) return;

  const value = cat1.value;

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
  const count = $('#catCount');

  if (count) count.textContent = result.length;

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
      if (selector === '#cat1') updateCat2();
      renderCats();
    });
  });
}


/* =========================
   标题优化
========================= */

function getEnglish(text) {
  const parts = String(text).split(' ');

  if (parts.length > 1) {
    return parts.slice(1).join(' ');
  }

  return text;
}

function getChinese(text) {
  const parts = String(text).split(' ');

  if (parts.length > 1) {
    return parts[0];
  }

  return text;
}

function getSelectedKeywords() {
  const result = {};

  $$('#keywordControls select').forEach(select => {
    if (!select.value) return;

    const index = Number(select.dataset.index);
    const dimension =
      keywordData.dimensions[index]?.dimension || '';

    result[dimension] = select.value;
  });

  return result;
}

function generateChineseTitle(selected) {
  const order = [
    '目标人群 Target',
    '品类 Category',
    '场景 Occasion',
    '领型/腰型 Neckline & Waist',
    '款长 Sleeve',
    '功能 Feature',
    '图案 Pattern',
    '风格 Style',
    '季节 Season',
    '版型 Fit',
    '面料 Material',
    '颜色 Color',
    '闭合方式 Closure'
  ];

  const result = [];

  order.forEach(dimension => {
    if (selected[dimension]) {
      result.push(getChinese(selected[dimension]));
    }
  });

  return result.join(' + ');
}

function generateEnglishTitle(selected) {
  const order = [
    '目标人群 Target',
    '品类 Category',
    '场景 Occasion',
    '领型/腰型 Neckline & Waist',
    '款长 Sleeve',
    '功能 Feature',
    '图案 Pattern',
    '风格 Style',
    '季节 Season',
    '版型 Fit',
    '面料 Material',
    '颜色 Color',
    '闭合方式 Closure'
  ];

  const result = [];

  order.forEach(dimension => {
    if (selected[dimension]) {
      result.push(getEnglish(selected[dimension]));
    }
  });

  return result.join(', ');
}

function initKeywords() {
  const formula = $('#formula');

  if (formula) {
    formula.textContent =
      keywordData.formula ||
      '人群 + 品类 + 场景 + 领型/袖长/腰型 + 功能 + 图案 + 风格 + 季节 + 版型 + 面料材质 + 颜色 + 细节/规格 + 闭合方式 + 节日活动';
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
              .map(t =>
                `<option value="${esc(t)}">${esc(t)}</option>`
              )
              .join('')}
          </select>
        </label>
      </div>
    `)
    .join('');

  const generateButton = $('#generateTitle');
  const clearButton = $('#clearTitle');
  const copyButton = $('#copyTitle');
  const output = $('#titleOutput');

  if (generateButton) {
    generateButton.addEventListener('click', () => {
      const selected = getSelectedKeywords();

      if (!Object.keys(selected).length) {
        output.textContent = '请选择关键词后点击“生成标题”';
        return;
      }

      const chineseTitle = generateChineseTitle(selected);
      const englishTitle = generateEnglishTitle(selected);

      output.innerHTML = `
        <div class="title-cn">${esc(chineseTitle)}</div>
        <div class="title-en">${esc(englishTitle)}</div>
      `;
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      $$('#keywordControls select').forEach(select => {
        select.value = '';
      });

      if (output) {
        output.textContent = '选择关键词后点击“生成标题”';
      }
    });
  }

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const selected = getSelectedKeywords();

      if (!Object.keys(selected).length) return;

      const chineseTitle = generateChineseTitle(selected);
      const englishTitle = generateEnglishTitle(selected);

      const text = `${chineseTitle}\n${englishTitle}`;

      try {
        await navigator.clipboard.writeText(text);
        copyButton.textContent = '已复制 ✓';

        setTimeout(() => {
          copyButton.textContent = '复制标题';
        }, 1500);
      } catch (e) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();

        copyButton.textContent = '已复制 ✓';

        setTimeout(() => {
          copyButton.textContent = '复制标题';
        }, 1500);
      }
    });
  }
}


/* =========================
   趋势资讯
========================= */

function loadTrends() {
  const box = $('#trendList');

  if (!box) return;

  box.innerHTML = (trends || [])
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
   初始化
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
