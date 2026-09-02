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

  const current = el.value;

  el.innerHTML =
    '<option value="">全部</option>' +
    values
      .sort((a, b) => String(a).localeCompare(String(b), 'zh'))
      .map(v => `<option value="${esc(v)}">${esc(v)}</option>`)
      .join('');

  if (values.includes(current)) {
    el.value = current;
  }
}


/* =========================
   类目指引
========================= */

function initCats() {
  fillSelect('#audience', uniq(categories.map(x => x['人群'])));
  fillSelect('#cat1', uniq(categories.map(x => x['拆分一层品类'])));

  updateCat2();
  renderCats();

  ['#audience', '#cat1', '#cat2', '#catSearch'].forEach(selector => {
    const el = $(selector);
    if (!el) return;

    el.addEventListener('input', () => {
      if (selector === '#audience' || selector === '#cat1') {
        updateCat2();
      }

      renderCats();
    });
  });
}

function updateCat2() {
  const audience = $('#audience')?.value || '';
  const cat1 = $('#cat1')?.value || '';

  const rows = categories.filter(x =>
    (!audience || x['人群'] === audience) &&
    (!cat1 || x['拆分一层品类'] === cat1)
  );

  fillSelect(
    '#cat2',
    uniq(rows.map(x => x['拆分二层品类']))
  );
}

function renderCats() {
  const audience = $('#audience')?.value || '';
  const cat1 = $('#cat1')?.value || '';
  const cat2 = $('#cat2')?.value || '';
  const q = ($('#catSearch')?.value || '').trim().toLowerCase();

  const rows = categories.filter(x =>
    (!audience || x['人群'] === audience) &&
    (!cat1 || x['拆分一层品类'] === cat1) &&
    (!cat2 || x['拆分二层品类'] === cat2) &&
    (!q || Object.values(x).join(' ').toLowerCase().includes(q))
  );

  $('#catCount').textContent = rows.length;

  $('#catResults').innerHTML =
    rows.slice(0, 300).map(x => `
      <div class="cat-item">
        <div class="cat-meta">
          ${esc(x['人群'])} ·
          ${esc(x['拆分一层品类'])} ·
          ${esc(x['拆分二层品类'])}
        </div>

        <div class="cat-path">
          ${highlight(x['类目路径'], q)}
        </div>
      </div>
    `).join('') ||
    '<div class="cat-item">没有找到匹配类目。</div>';
}

function highlight(text, q) {
  let result = esc(text);

  if (!q) return result;

  const re = new RegExp(
    '(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
    'ig'
  );

  return result.replace(re, '<mark>$1</mark>');
}


/* =========================
   标题优化
========================= */

function getChinese(text) {
  const parts = String(text).split(' ');

  return parts.length > 1
    ? parts[0]
    : text;
}

function getEnglish(text) {
  const parts = String(text).split(' ');

  return parts.length > 1
    ? parts.slice(1).join(' ')
    : text;
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


/* =========================
   中文标题
========================= */

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

  return order
    .filter(key => selected[key])
    .map(key => getChinese(selected[key]))
    .join(' + ');
}


/* =========================
   英文标题
========================= */

function generateEnglishTitle(selected) {

  const audience = selected['目标人群 Target']
    ? getEnglish(selected['目标人群 Target'])
    : '';

  const category = selected['品类 Category']
    ? getEnglish(selected['品类 Category'])
    : '';

  const occasion = selected['场景 Occasion']
    ? getEnglish(selected['场景 Occasion'])
    : '';

  const neckline = selected['领型/腰型 Neckline & Waist']
    ? getEnglish(selected['领型/腰型 Neckline & Waist'])
    : '';

  const sleeve = selected['款长 Sleeve']
    ? getEnglish(selected['款长 Sleeve'])
    : '';

  const feature = selected['功能 Feature']
    ? getEnglish(selected['功能 Feature'])
    : '';

  const pattern = selected['图案 Pattern']
    ? getEnglish(selected['图案 Pattern'])
    : '';

  const style = selected['风格 Style']
    ? getEnglish(selected['风格 Style'])
    : '';

  const season = selected['季节 Season']
    ? getEnglish(selected['季节 Season'])
    : '';

  const fit = selected['版型 Fit']
    ? getEnglish(selected['版型 Fit'])
    : '';

  const material = selected['面料 Material']
    ? getEnglish(selected['面料 Material'])
    : '';

  const color = selected['颜色 Color']
    ? getEnglish(selected['颜色 Color'])
    : '';

  const closure = selected['闭合方式 Closure']
    ? getEnglish(selected['闭合方式 Closure'])
    : '';


  let titleParts = [];


  /* 人群 + 品类 */

  if (audience && category) {
    titleParts.push(audience + ' ' + category);
  } else if (audience) {
    titleParts.push(audience);
  } else if (category) {
    titleParts.push(category);
  }


  /* 场景 */

  if (occasion) {
    titleParts.push(occasion + ' Wear');
  }


  /* 功能 + 图案 + 风格 */

  let stylePart = [];

  if (feature) {
    stylePart.push(feature);
  }

  if (pattern) {
    stylePart.push(pattern);
  }

  if (style) {
    stylePart.push(style);
  }

  if (stylePart.length) {
    titleParts.push(stylePart.join(' ') + ' Design');
  }


  /* 领型 / 腰型 */

  if (neckline) {
    titleParts.push(neckline);
  }


  /* 袖长 */

  if (sleeve) {
    titleParts.push(sleeve);
  }


  /* 版型 */

  if (fit) {
    titleParts.push(fit);
  }


  /* 面料 */

  if (material) {
    titleParts.push(material);
  }


  /* 颜色 */

  if (color) {
    titleParts.push(color);
  }


  /* 季节 */

  if (season) {
    titleParts.push('for ' + season);
  }


  /* 闭合方式 */

  if (closure) {
    titleParts.push(closure);
  }


return titleParts.join(' ');
}


/* =========================
   标题生成
========================= */

function generateTitle() {

  const selected = getSelectedKeywords();

  if (!Object.keys(selected).length) {
    $('#titleOutput').textContent =
      '请至少选择一个关键词';

    return;
  }

  const chineseTitle =
    generateChineseTitle(selected);

  const englishTitle =
    generateEnglishTitle(selected);

  $('#titleOutput').innerHTML = `
    <div class="title-cn">
      ${esc(chineseTitle)}
    </div>

    <div class="title-en">
      ${esc(englishTitle)}
    </div>
  `;

  $('#titleOutput').dataset.zh =
    chineseTitle;

  $('#titleOutput').dataset.en =
    englishTitle;
}


/* =========================
   标题关键词
========================= */

function initKeywords() {

  $('#formula').textContent =
    keywordData.formula || '';

  $('#keywordControls').innerHTML =
    (keywordData.dimensions || [])
      .map((d, i) => `
        <div class="keyword-card">

          <h4>
            ${esc(d.dimension)}
            <span class="priority">
              ${esc(d.priority)}
            </span>
          </h4>

          <label>
            选择关键词

            <select data-index="${i}">

              <option value="">
                不添加
              </option>

              ${(d.terms || [])
                .map(t => `
                  <option value="${esc(t)}">
                    ${esc(t)}
                  </option>
                `)
                .join('')}

            </select>

          </label>

        </div>
      `)
      .join('');
}


/* =========================
   趋势资讯
========================= */

function loadTrends() {

  $('#trendList').innerHTML =
    (trends || [])
      .map(t => `
        <article class="trend-card">

          <div class="trend-head">
            <strong>
              ${esc(t.market)}
            </strong>

            <span>
              ${esc(t.week)}
            </span>
          </div>

          ${(t.items || [])
            .map(i => `
              <div class="trend-item">

                <b>
                  ${esc(i.title)}
                </b>

                <p>
                  ${esc(i.body)}
                </p>

              </div>
            `)
            .join('')}

        </article>
      `)
      .join('');
}


/* =========================
   提示
========================= */

function toast(msg) {

  const t = $('#toast');

  if (!t) return;

  t.textContent = msg;

  t.classList.add('show');

  setTimeout(() => {
    t.classList.remove('show');
  }, 1500);
}


/* =========================
   按钮
========================= */

document.addEventListener('click', e => {

  const copyButton =
    e.target.closest('[data-copy]');

  if (copyButton) {

    navigator.clipboard
      .writeText(copyButton.dataset.copy)
      .then(() => toast('已复制'));

  }

});


$('#generateTitle')
  ?.addEventListener(
    'click',
    generateTitle
  );


$('#clearTitle')
  ?.addEventListener('click', () => {

    $$('#keywordControls select')
      .forEach(x => {
        x.value = '';
      });

    $('#titleOutput').textContent =
      '选择关键词后点击“生成标题”';

  });


$('#copyTitle')
  ?.addEventListener('click', () => {

    const title =
      $('#titleOutput').innerText;

    navigator.clipboard
      .writeText(title)
      .then(() => toast('标题已复制'));

  });


/* =========================
   全局搜索
========================= */

$('#globalSearch')
  ?.addEventListener('keydown', e => {

    if (e.key !== 'Enter') return;

    const q =
      e.target.value.trim();

    if (!q) return;

    $('#catSearch').value = q;

    location.hash = '#categories';

    updateCat2();

    renderCats();

  });


/* =========================
   快捷键
========================= */

document.addEventListener(
  'keydown',
  e => {

    if (
      (e.metaKey || e.ctrlKey) &&
      e.key.toLowerCase() === 'k'
    ) {

      e.preventDefault();

      $('#globalSearch')?.focus();

    }

  }
);


/* =========================
   手机端菜单
========================= */

$('#menuBtn')
  ?.addEventListener('click', () => {

    const side =
      document.querySelector('.sidebar');

    if (!side) return;

    side.style.display =
      side.style.display === 'flex'
        ? 'none'
        : 'flex';

    side.style.width = '260px';

    side.style.background = '#f4f2ed';

  });


/* =========================
   加载数据
========================= */

Promise.all([

  fetch('data/categories.json')
    .then(r => r.json()),

  fetch('data/keywords.json')
    .then(r => r.json()),

  fetch('data/trends.json')
    .then(r => r.json())

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

  $('#catResults').innerHTML =
    '<div class="cat-item">数据加载失败，请确认 GitHub Pages 的文件路径正确。</div>';

});
