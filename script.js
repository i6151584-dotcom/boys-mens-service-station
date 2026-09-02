let categories=[], keywordData={}, trends=[];
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const uniq=a=>[...new Set(a.filter(Boolean))];
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function fillSelect(sel,values){let el=$(sel), cur=el.value; el.innerHTML='<option value="">全部</option>'+values.sort((a,b)=>String(a).localeCompare(String(b),'zh')).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(''); if(values.includes(cur))el.value=cur}
function initCats(){
 fillSelect('#audience',uniq(categories.map(x=>x['人群'])));
 fillSelect('#cat1',uniq(categories.map(x=>x['拆分一层品类'])));
 updateCat2(); renderCats();
 ['#audience','#cat1','#cat2','#catSearch'].forEach(s=>$(s).addEventListener('input',()=>{if(s==='#cat1')updateCat2();renderCats()}));
}
function updateCat2(){
 let a=$('#audience').value,c1=$('#cat1').value;
 let rows=categories.filter(x=>(!a||x['人群']===a)&&(!c1||x['拆分一层品类']===c1));
 fillSelect('#cat2',uniq(rows.map(x=>x['拆分二层品类'])));
}
function renderCats(){
 let a=$('#audience').value,c1=$('#cat1').value,c2=$('#cat2').value,q=$('#catSearch').value.trim().toLowerCase();
 let rows=categories.filter(x=>(!a||x['人群']===a)&&(!c1||x['拆分一层品类']===c1)&&(!c2||x['拆分二层品类']===c2)&&(!q||Object.values(x).join(' ').toLowerCase().includes(q)));
 $('#catCount').textContent=rows.length;
 $('#catResults').innerHTML=rows.slice(0,300).map(x=>`<div class="cat-item"><div class="cat-meta">${esc(x['人群'])} · ${esc(x['拆分一层品类'])} · ${esc(x['拆分二层品类'])}</div><div class="cat-path">${highlight(x['类目路径'],q)}</div></div>`).join('') || '<div class="cat-item">没有找到匹配类目。</div>';
}
function highlight(s,q){let t=esc(s); if(!q)return t; let re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');return t.replace(re,'<mark>$1</mark>')}
function initKeywords(){
 $('#formula').textContent=keywordData.formula||'';
 $('#keywordControls').innerHTML=keywordData.dimensions.map((d,i)=>`<div class="keyword-card"><h4>${esc(d.dimension)} <span class="priority">${esc(d.priority)}</span></h4><label>选择关键词<select data-index="${i}"><option value="">不添加</option>${d.terms.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label></div>`).join('');
}
function generateTitle(){
 let vals=[...$$('#keywordControls select')].map(x=>x.value).filter(Boolean);
 if(!vals.length){$('#titleOutput').textContent='请至少选择一个关键词';return}
 // The source library supplies bilingual keyword pairs. Build a readable title while retaining selected source terms.
 let en=vals.map(v=>{let m=v.match(/(.+?)\s+([A-Za-z][A-Za-z'&\-/ ]*)$/);return m?m[2].trim():v}).filter(Boolean);
 let zh=vals.map(v=>v.replace(/\s+[A-Za-z][A-Za-z'&\-/ ]*$/,'').trim());
 let title=en.join(', ');
 $('#titleOutput').textContent=title||vals.join(', ');
 $('#titleOutput').dataset.zh=zh.join(' · ');
}
function loadTrends(){ $('#trendList').innerHTML=trends.map(t=>`<article class="trend-card"><div class="trend-head"><strong>${esc(t.market)}</strong><span>${esc(t.week)}</span></div>${t.items.map(i=>`<div class="trend-item"><b>${esc(i.title)}</b><p>${esc(i.body)}</p></div>`).join('')}</article>`).join('')}
function toast(msg){let t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}
$$('[data-copy]').forEach(b=>b.addEventListener('click',()=>navigator.clipboard.writeText(b.dataset.copy).then(()=>toast('已复制'))));
$('#generateTitle').addEventListener('click',generateTitle);
$('#clearTitle').addEventListener('click',()=>{$$('#keywordControls select').forEach(x=>x.value='');$('#titleOutput').textContent='选择关键词后点击“生成标题”'});
$('#copyTitle').addEventListener('click',()=>navigator.clipboard.writeText($('#titleOutput').textContent).then(()=>toast('标题已复制')));
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){let q=e.target.value.trim();if(!q)return;$('#catSearch').value=q;location.hash='#categories';updateCat2();renderCats()}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus()}});
$('#menuBtn')?.addEventListener('click',()=>{let side=document.querySelector('.sidebar');side.style.display=side.style.display==='flex'?'none':'flex';side.style.width='260px';side.style.background='#f4f2ed'});
Promise.all([fetch('data/categories.json').then(r=>r.json()),fetch('data/keywords.json').then(r=>r.json()),fetch('data/trends.json').then(r=>r.json())]).then(([c,k,t])=>{categories=c;keywordData=k;trends=t;initCats();initKeywords();loadTrends()}).catch(err=>{console.error(err);$('#catResults').innerHTML='<div class="cat-item">数据加载失败，请确认 GitHub Pages 的文件路径正确。</div>'});
