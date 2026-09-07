/* =====================================================
   DATA
===================================================== */

let categories = [];
let keywordData = {};
let trends = [];
let marketingData = [];

/* =====================================================
   BASIC HELPERS
===================================================== */

const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);


function esc(str) {

  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


function uniq(arr) {

  return [
    ...new Set(
      arr.filter(Boolean)
    )
  ];

}


function toast(message) {

  const el = $('#toast');

  if (!el) return;

  el.textContent = message;

  el.classList.add('show');

  setTimeout(() => {

    el.classList.remove('show');

  }, 1500);

}


/* =====================================================
   PAGE SWITCH
===================================================== */

function switchPage(pageName) {

  $$('.page').forEach(page => {

    page.classList.remove('active-page');

  });


  const target = $(`#page-${pageName}`);

  if (target) {

    target.classList.add('active-page');

  }


  $$('.nav-item').forEach(item => {

    item.classList.toggle(
      'active',
      item.dataset.page === pageName
    );

  });


  window.scrollTo({

    top:0,
    behavior:'smooth'

  });


  history.replaceState(
    null,
    '',
    `#${pageName}`
  );

}


/* 顶部导航 */

$$('.nav-item').forEach(item => {

  item.addEventListener('click', () => {

    switchPage(
      item.dataset.page
    );

  });

});


/* 页面内部跳转 */

$$('[data-page-jump]').forEach(button => {

  button.addEventListener('click', () => {

    const target = document.getElementById(
      button.dataset.pageJump
    );

    if (!target) return;

    target.scrollIntoView({

      behavior:'smooth',
      block:'center'

    });

  });

});


/* URL 页面恢复 */

function loadPageFromHash() {

  const hash =
    location.hash.replace('#','');

  const validPages = [
  'join',
  'categories',
  'title',
  'resources',
  'marketing'
];

  if (validPages.includes(hash)) {

    switchPage(hash);

  } else {

    switchPage('join');

  }

}


window.addEventListener(
  'hashchange',
  loadPageFromHash
);


/* =====================================================
   CATEGORY GUIDE
===================================================== */

function fillSelect(
  selector,
  values
) {

  const el = $(selector);

  if (!el) return;

  const current = el.value;


  el.innerHTML =
    '<option value="">全部</option>' +

    values
      .sort(
        (a,b) =>
          String(a).localeCompare(
            String(b),
            'zh'
          )
      )
      .map(value =>

        `<option value="${esc(value)}">
          ${esc(value)}
        </option>`

      )
      .join('');


  if (values.includes(current)) {

    el.value = current;

  }

}


function initCats() {

  fillSelect(

    '#audience',

    uniq(
      categories.map(
        item => item['人群']
      )
    )

  );


  fillSelect(

    '#cat1',

    uniq(
      categories.map(
        item => item['拆分一层品类']
      )
    )

  );


  updateCat2();

  renderCats();


  [
    '#audience',
    '#cat1',
    '#cat2'
  ].forEach(selector => {

    const el = $(selector);

    if (!el) return;

    el.addEventListener(
      'change',
      () => {

        if (
          selector === '#audience' ||
          selector === '#cat1'
        ) {

          updateCat2();

        }

        renderCats();

      }
    );

  });


  const search = $('#catSearch');

  if (search) {

    search.addEventListener(
      'input',
      renderCats
    );

  }


  const clear =
    $('#clearCategory');

  if (clear) {

    clear.addEventListener(
      'click',
      () => {

        $('#audience').value = '';
        $('#cat1').value = '';

        updateCat2();

        $('#cat2').value = '';

        $('#catSearch').value = '';

        renderCats();

      }
    );

  }

}


function updateCat2() {

  const audience =
    $('#audience')?.value || '';

  const cat1 =
    $('#cat1')?.value || '';


  const rows =
    categories.filter(item =>

      (!audience ||
        item['人群'] === audience) &&

      (!cat1 ||
        item['拆分一层品类'] === cat1)

    );


  fillSelect(

    '#cat2',

    uniq(
      rows.map(
        item => item['拆分二层品类']
      )
    )

  );

}


function highlight(text, query) {

  let result = esc(text);

  if (!query) return result;


  const escaped =
    query.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );


  const regex =
    new RegExp(
      `(${escaped})`,
      'ig'
    );


  return result.replace(
    regex,
    '<mark>$1</mark>'
  );

}


function renderCats() {

  const audience =
    $('#audience')?.value || '';

  const cat1 =
    $('#cat1')?.value || '';

  const cat2 =
    $('#cat2')?.value || '';

  const query =
    ($('#catSearch')?.value || '')
      .trim()
      .toLowerCase();


  const rows =
    categories.filter(item => {

      const allText =
        Object.values(item)
          .join(' ')
          .toLowerCase();


      return (

        (!audience ||
          item['人群'] === audience) &&

        (!cat1 ||
          item['拆分一层品类'] === cat1) &&

        (!cat2 ||
          item['拆分二层品类'] === cat2) &&

        (!query ||
          allText.includes(query))

      );

    });


  $('#catCount').textContent =
    rows.length;


  if (!rows.length) {

    $('#catResults').innerHTML = `

      <div class="empty-category">

        ✦

        <p>
          没有找到匹配的类目
        </p>

      </div>

    `;

    return;

  }


  $('#catResults').innerHTML =

    rows
      .slice(0,300)
      .map(item => `

        <div class="cat-item">

          <div class="cat-meta">

            ${esc(item['人群'])}
            ·
            ${esc(item['拆分一层品类'])}
            ·
            ${esc(item['拆分二层品类'])}

          </div>

          <div class="cat-path">

            ${highlight(
              item['类目路径'],
              query
            )}

          </div>

        </div>

      `)
      .join('');

}


/* =====================================================
   TITLE KEYWORD LIBRARY
===================================================== */


/*
  如果 keywords.json 以后增加新的维度，
  这里仍然可以自动兼容。
*/

const TITLE_ORDER = [

  '目标人群 Target',
  '人群 Target',

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

  '细节/规格 Detail & Specs',

  '闭合方式 Closure',

  '节日活动 Holiday & Event'

];


/* 补充缺失维度 */

function addMissingKeywordDimensions() {

  if (!keywordData.dimensions) {

    keywordData.dimensions = [];

  }


  const existing =
    keywordData.dimensions
      .map(
        item => item.dimension
      );


  const fallback = {

    '细节/规格 Detail & Specs': {

      priority:'拓展',

      terms:[

        '刺绣 Embroidered',
        '贴布 Embroidered Patch',
        '口袋 Pocket',
        '侧袋 Side Pocket',
        '罗纹 Ribbed',
        '拼接 Panelled',
        '印花细节 Printed Detail',
        '拉链口袋 Zip Pocket'

      ]

    },


    '节日活动 Holiday & Event': {

      priority:'拓展',

      terms:[

        'Halloween',
        'Christmas',
        'Thanksgiving',
        'Black Friday',
        'Cyber Monday',
        "Valentine's Day",
        'Easter',
        "Mother's Day",
        "Father's Day",
        'Independence Day',
        "New Year's Day",
        'Back to School'

      ]

    }

  };


  Object.entries(fallback).forEach(
    ([dimension, data]) => {

      if (!existing.includes(dimension)) {

        keywordData.dimensions.push({

          dimension,

          priority:data.priority,

          terms:data.terms

        });

      }

    }
  );

}


function getChinese(text) {

  const parts =
    String(text).split(' ');

  return parts.length > 1
    ? parts[0]
    : text;

}


function getEnglish(text) {

  const parts =
    String(text).split(' ');

  return parts.length > 1
    ? parts.slice(1).join(' ')
    : text;

}


function getSelectedKeywords() {

  const result = {};


  $$('#keywordControls select')
    .forEach(select => {

      if (!select.value) return;


      const index =
        Number(select.dataset.index);


      const dimension =
        keywordData
          .dimensions[index]
          ?.dimension || '';


      result[dimension] =
        select.value;

    });


  return result;

}


/* =====================================================
   CHINESE TITLE
===================================================== */

function generateChineseTitle(
  selected
) {

  const normalized = {};


  Object.keys(selected).forEach(
    key => {

      normalized[key] =
        getChinese(
          selected[key]
        );

    }
  );


  const keys = TITLE_ORDER.filter(
    key => normalized[key]
  );


  return keys
    .map(key => normalized[key])
    .join(' + ');

}


/* =====================================================
   ENGLISH TITLE
===================================================== */

function generateEnglishTitle(
  selected
) {

  const get = key =>
    selected[key]
      ? getEnglish(selected[key])
      : '';


  const audience =
    get('目标人群 Target') ||
    get('人群 Target');


  const category =
    get('品类 Category');


  const occasion =
    get('场景 Occasion');


  const neckline =
    get(
      '领型/腰型 Neckline & Waist'
    );


  const sleeve =
    get('款长 Sleeve');


  const feature =
    get('功能 Feature');


  const pattern =
    get('图案 Pattern');


  const style =
    get('风格 Style');


  const season =
    get('季节 Season');


  const fit =
    get('版型 Fit');


  const material =
    get('面料 Material');


  const color =
    get('颜色 Color');


  const detail =
    get(
      '细节/规格 Detail & Specs'
    );


  const closure =
    get('闭合方式 Closure');


  const holiday =
    get(
      '节日活动 Holiday & Event'
    );


  const isBottom =
    /shorts|pants|trousers/i
      .test(category);


  const parts = [];


  /*
    1 人群
    2 品类
  */

  if (audience)
    parts.push(audience);

  if (category)
    parts.push(category);


  /*
    3 场景
  */

  if (occasion)
    parts.push(
      `for ${occasion} Wear`
    );


  /*
    4 领型 / 腰型
  */

  if (neckline)
    parts.push(
      `with ${neckline}`
    );


  /*
    5 款长
  */

  if (
    sleeve &&
    !isBottom
  ) {

    parts.push(sleeve);

  }


  /*
    6 功能
  */

  if (feature)
    parts.push(feature);


  /*
    7 图案
  */

  if (pattern)
    parts.push(
      `featuring ${pattern}`
    );


  /*
    8 风格
  */

  if (style)
    parts.push(
      `${style} Style`
    );


  /*
    9 季节
  */

  if (season)
    parts.push(
      `for ${season}`
    );


  /*
    10 版型
  */

  if (fit)
    parts.push(
      `in ${fit} Fit`
    );


  /*
    11 面料
  */

  if (material)
    parts.push(
      `crafted from ${material}`
    );


  /*
    12 颜色
  */

  if (color)
    parts.push(
      `in ${color}`
    );


  /*
    13 细节
  */

  if (detail)
    parts.push(
      `with ${detail}`
    );


  /*
    14 闭合方式
  */

  if (closure) {

    const alreadyDrawstring =
      detail
        .toLowerCase()
        .includes('drawstring') &&
      closure
        .toLowerCase()
        .includes('drawstring');


    if (!alreadyDrawstring) {

      parts.push(
        `finished with ${closure}`
      );

    }

  }


  /*
    15 节日 / 活动
  */

  if (holiday)
    parts.push(
      `for ${holiday}`
    );


  return parts

    .join(' ')

    .replace(/,/g,'')

    .replace(/\s+/g,' ')

    .trim();

}


/* =====================================================
   INIT TITLE TOOL
===================================================== */

function initKeywords() {

  addMissingKeywordDimensions();


  $('#formula').textContent =

    keywordData.formula ||

    '人群 + 品类 + 场景 + 领型/袖长/腰型 + 功能 + 图案 + 风格 + 季节 + 版型 + 面料材质 + 颜色 + 细节/规格 + 闭合方式 + 节日活动';


  $('#keywordControls').innerHTML =

    keywordData.dimensions

      .map((dimension,index) => `

        <div class="keyword-card">

          <h4>

            <span>
              ${esc(
                dimension.dimension
              )}
            </span>

            ${
              dimension.dimension ===
              '图案 Pattern'

              ?

              '<span class="keyword-note">印花内容可根据商品自行补充</span>'

              :

              ''
            }

            <span class="priority">
              ${esc(
                dimension.priority || '拓展'
              )}
            </span>

          </h4>


          <label>

            选择关键词

            <select
              data-index="${index}">

              <option value="">
                不添加
              </option>

              ${
                (dimension.terms || [])
                  .map(term => `

                    <option value="${esc(term)}">

                      ${esc(term)}

                    </option>

                  `)
                  .join('')
              }

            </select>

          </label>

        </div>

      `)

      .join('');

}


/* =====================================================
   GENERATE TITLE
===================================================== */

function generateTitle() {

  const selected =
    getSelectedKeywords();


  if (
    !Object.keys(selected).length
  ) {

    $('#titleOutput').innerHTML = `

      <div class="empty-output">

        <span>✦</span>

        <p>
          请至少选择一个关键词
        </p>

      </div>

    `;

    return;

  }


  const chinese =
    generateChineseTitle(
      selected
    );


  const english =
    generateEnglishTitle(
      selected
    );


  $('#titleOutput').innerHTML = `

    <div class="title-cn">

      ${esc(chinese)}

    </div>


    <div class="title-en">

      ${esc(english)}

    </div>

  `;


  $('#titleOutput').dataset.zh =
    chinese;


  $('#titleOutput').dataset.en =
    english;

}


/* =====================================================
   TITLE BUTTONS
===================================================== */

$('#generateTitle')
  ?.addEventListener(
    'click',
    generateTitle
  );


$('#clearTitle')
  ?.addEventListener(
    'click',
    () => {

      $$('#keywordControls select')
        .forEach(
          select => {
            select.value = '';
          }
        );


      $('#titleOutput').innerHTML = `

        <div class="empty-output">

          <span>✦</span>

          <p>
            选择关键词后点击“生成标题”
          </p>

        </div>

      `;

    }
  );


$('#copyTitle')
  ?.addEventListener(
    'click',
    () => {

      const output =
        $('#titleOutput');


      const english =
        output?.dataset.en || '';


      if (!english) {

        toast('请先生成标题');

        return;

      }


      navigator.clipboard
        .writeText(english)
        .then(() => {

          toast('英文标题已复制');

        });

    }
  );


/* =====================================================
   TRENDS
===================================================== */

function loadTrends() {

  const container =
    $('#trendList');


  if (!container) return;


  if (!trends.length) {

    container.innerHTML = `

      <div class="trend-card">

        <b>近期资讯</b>

        <p>
          暂无近期资讯
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =

    trends

      .map(trend => `

        <article class="trend-card">

          <div class="trend-head">

            <strong>
              ${esc(
                trend.market
              )}
            </strong>

            <span>
              ${esc(
                trend.week
              )}
            </span>

          </div>


          ${
            (trend.items || [])
              .map(item => `

                <div class="trend-item">

                  <b>
                    ${esc(
                      item.title
                    )}
                  </b>

                  <p>
                    ${esc(
                      item.body
                    )}
                  </p>

                </div>

              `)
              .join('')
          }

        </article>

      `)

      .join('');

}


/* =====================================================
   COPY INVITATION
===================================================== */

$$('[data-copy]')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const value =
          button.dataset.copy;


        navigator.clipboard
          .writeText(value)
          .then(() => {

            toast('邀请码已复制');

          });

      }
    );

  });


/* =====================================================
   GLOBAL SEARCH
===================================================== */

function initGlobalSearch() {

  const input =
    $('#globalSearch');


  if (!input) return;


  input.addEventListener(
    'keydown',
    event => {

      if (
        event.key !== 'Enter'
      ) return;


      const query =
        input.value.trim();


      if (!query) return;


      switchPage(
        'categories'
      );


      $('#catSearch').value =
        query;


      renderCats();

    }
  );

}


/* Ctrl / Cmd + K */

document.addEventListener(
  'keydown',
  event => {

    if (
      (event.ctrlKey ||
        event.metaKey) &&

      event.key.toLowerCase() === 'k'
    ) {

      event.preventDefault();

      switchPage('categories');

      $('#catSearch')?.focus();

    }

  }
);

// =========================
// 营销日历
// =========================

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i++;
      }

      row.push(cell);
      cell = '';

      if (row.some(item => item.trim() !== '')) {
        rows.push(row);
      }

      row = [];
    } else {
      cell += char;
    }
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell);

    if (row.some(item => item.trim() !== '')) {
      rows.push(row);
    }
  }

  if (!rows.length) {
    return [];
  }

  // 去掉 Excel CSV 可能产生的 BOM
  rows[0][0] = rows[0][0].replace(/^\uFEFF/, '').trim();

  const headers = rows[0].map(header => header.trim());

  return rows.slice(1).map(row => {
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = (row[index] || '').trim();
    });

    return obj;
  });
}


function initMarketingCalendar() {
  const countrySelect = $('#marketingCountry');
  const monthSelect = $('#marketingMonth');
  const searchInput = $('#marketingSearch');
  const clearButton = $('#clearMarketing');

  if (!countrySelect || !monthSelect || !searchInput) {
    return;
  }

  // 国家下拉选项
  const countries = [...new Set(
    marketingData
      .map(item => item['国家'])
      .filter(Boolean)
  )];

  countrySelect.innerHTML =
    '<option value="">全部</option>' +
    countries
      .map(country => `<option value="${esc(country)}">${esc(country)}</option>`)
      .join('');

  function renderMarketingCalendar() {
    const country = countrySelect.value;
    const month = monthSelect.value;
    const keyword = searchInput.value.trim().toLowerCase();

    const filtered = marketingData.filter(item => {

      // 国家筛选
      if (country && item['国家'] !== country) {
        return false;
      }

      // 月份筛选
      if (month) {
        const date = item['日期'] || '';

        // 无特定日期不参与月份筛选
        if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
          return false;
        }

        const itemMonth = parseInt(date.substring(5, 7), 10);

        if (itemMonth !== Number(month)) {
          return false;
        }
      }

      // 关键词搜索
      if (keyword) {
        const allText = Object.values(item)
          .join(' ')
          .toLowerCase();

        if (!allText.includes(keyword)) {
          return false;
        }
      }

      return true;
    });

    const list = $('#marketingList');
    const count = $('#marketingCount');

    if (!list) {
      return;
    }

    if (count) {
      count.textContent = `${filtered.length} 个节点`;
    }

    if (!filtered.length) {
      list.innerHTML = `
        <tr>
          <td colspan="7" class="marketing-empty">
            暂无符合条件的营销节点
          </td>
        </tr>
      `;

      return;
    }

    list.innerHTML = filtered.map(item => {

      const date =
        item['日期'] || '无特定日期';

      const country =
        item['国家'] || '-';

      const event =
        item['节日/活动名'] || '-';

      const hotWords =
        item['节日热搜词'] || '-';

      const categoryWords =
        item['对应品类/款式热搜词'] || '-';

      const heat =
        item['热度推荐'] || '';

      const titleWords =
        item['提前两个月标题加关键词'] || '-';

      let heatHtml = '-';

      if (heat) {
        const heatNumber = Number(heat);

        if (!isNaN(heatNumber)) {
          heatHtml =
            `<span class="heat-stars">${'★'.repeat(heatNumber)}</span>`;
        } else {
          heatHtml = esc(heat);
        }
      }

      return `
        <tr>

          <td>
            <div class="calendar-date">
              ${esc(date)}
            </div>
          </td>

          <td>
            ${esc(country)}
          </td>

          <td>
            <strong class="calendar-event">
              ${esc(event)}
            </strong>
          </td>

          <td>
            ${heatHtml}
          </td>

          <td>
            <div class="calendar-cell-text">
              ${esc(hotWords)}
            </div>
          </td>

          <td>
            <div class="calendar-cell-text">
              ${esc(categoryWords)}
            </div>
          </td>

          <td>
            <div class="calendar-cell-text">
              ${esc(titleWords)}
            </div>
          </td>

        </tr>
      `;
    }).join('');
  }

  countrySelect.addEventListener(
    'change',
    renderMarketingCalendar
  );

  monthSelect.addEventListener(
    'change',
    renderMarketingCalendar
  );

  searchInput.addEventListener(
    'input',
    renderMarketingCalendar
  );

  if (clearButton) {
    clearButton.addEventListener('click', () => {

      countrySelect.value = '';
      monthSelect.value = '';
      searchInput.value = '';

      renderMarketingCalendar();
    });
  }

  renderMarketingCalendar();
}
/* =====================================================
   LOAD DATA
===================================================== */

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
  }),

  fetch('data/marketing-calendar.csv').then(r => {
    if (!r.ok) throw new Error('marketing-calendar.csv 加载失败');
    return r.text();
  })
])
.then(([categoryData, keywords, trendData, marketingCSV]) => {

  categories = categoryData || [];
  keywordData = keywords || {};
  trends = trendData || [];

  // 读取营销日历 CSV
  marketingData = parseCSV(marketingCSV);

  initCats();
  initKeywords();
  loadTrends();

  // 初始化营销日历
  initMarketingCalendar();

  initGlobalSearch();
  loadPageFromHash();

})
.catch(error => {

  console.error(error);

  const result = $('#catResults');

  if (result) {
    result.innerHTML = `
      <div class="empty-category">
        数据加载失败。
        <p>
          请确认 data 文件夹中的数据文件路径正确。
        </p>
      </div>
    `;
  }

  const marketingList = $('#marketingList');

  if (marketingList) {
    marketingList.innerHTML = `
      <tr>
        <td colspan="7" class="marketing-empty">
          营销日历数据加载失败，请检查
          data/marketing-calendar.csv
          是否存在。
        </td>
      </tr>
    `;
  }

});
