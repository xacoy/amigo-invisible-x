/* AIX · Amigo Invisible X — © 2026 xacoy — GNU GPL v3 (ver LICENSE) */
(function(){
  var KEY = 'aix_sorteo_v1';
  var PHASES = [['names','1 · Participantes'],['excl','2 · Exclusiones'],['curses','3 · Maldiciones'],['draw','4 · Sorteo']];
  var MAX = 30; // máximo de participantes
  var loaded = sane(load());
  var S = loaded || fresh();
  var ui = { err:'', step:null, who:null, reveal:null, curseWho:null, msg:'', restored:false };
  var IDEAS = window.AIX_IDEAS || [];
  var restoredFrom = !!loaded;
  if (restoredFrom && (S.names.length || S.phase !== 'names')) ui.restored = true;

  function fresh(){ return { phase:'names', names:[], excl:[], curses:{}, assign:null, seen:{} }; }
  function load(){ try{ var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; }catch(e){ return null; } }
  // Valida lo guardado en el navegador: si está corrupto o manipulado, se descarta en vez de romper la página.
  function sane(o){
    try{
      if (!o || typeof o !== 'object') return null;
      var n = o.names;
      if (!Array.isArray(n) || n.length > MAX) return null;
      for (var i=0;i<n.length;i++) if (typeof n[i] !== 'string' || !n[i] || n[i].length > 24) return null;
      if (['names','excl','curses','draw'].indexOf(o.phase) < 0) return null;
      var okIdx = function(x){ return typeof x === 'number' && x % 1 === 0 && x >= 0 && x < n.length; };
      if (!Array.isArray(o.excl) || !o.excl.every(function(x){ return Array.isArray(x) && x.length === 2 && okIdx(x[0]) && okIdx(x[1]); })) return null;
      var c = o.curses; if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
      for (var k in c) if (!okIdx(+k) || typeof c[k] !== 'string' || c[k].length > 80) return null;
      var sn = o.seen; if (!sn || typeof sn !== 'object' || Array.isArray(sn)) return null;
      for (var q in sn) if (!okIdx(+q)) return null;
      var a = o.assign;
      if (a !== null){
        if (!Array.isArray(a) || a.length !== n.length || !a.every(okIdx)) return null;
        if (new Set(a).size !== a.length) return null;
        if (a.some(function(x,i){ return x === i; })) return null;
      }
      if (o.phase === 'draw' && !a) return null;
      return { phase:o.phase, names:n, excl:o.excl, curses:c, assign:a, seen:sn };
    }catch(e){ return null; }
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
  function el(tag, attrs, kids){
    var e = document.createElement(tag);
    for (var k in (attrs||{})){
      if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0,2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids||[]).forEach(function(c){ if (c) e.appendChild(c); });
    return e;
  }
  function box(title, kids){ var b = el('div',{class:'box'}); if (title) b.appendChild(el('h2',{text:title})); kids.forEach(function(k){ if(k) b.appendChild(k); }); return b; }
  function para(text, cls){ return el('p', {text:text, class:cls||''}); }
  function btn(text, fn, cls, dis){ var b = el('button',{class:'btn '+(cls||''), text:text, onclick:fn, type:'button'}); if (dis) b.disabled = true; return b; }
  function errBox(){ return ui.err ? el('div',{class:'err',text:ui.err}) : null; }
  // Aleatoriedad criptográfica, sin sesgo de módulo.
  function rnd(n){ var b = new Uint32Array(1), lim = Math.floor(4294967296/n)*n; do { crypto.getRandomValues(b); } while (b[0] >= lim); return b[0] % n; }
  function shuffle(a){ a = a.slice(); for (var i=a.length-1;i>0;i--){ var j=rnd(i+1); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function excluded(a,b){ return S.excl.some(function(x){ return x[0]===a && x[1]===b; }); }

  // ---------- Solver ----------
  function solve(n, allowed){
    var order = shuffle(Array.apply(null,Array(n)).map(function(_,i){return i;}))
      .sort(function(a,b){ return allowed[a].length - allowed[b].length; });
    var res = Array.apply(null,Array(n)).map(function(){return -1;});
    var used = {}, nodes = 0;
    function dfs(k){
      if (k === n) return true;
      if (++nodes > 200000) return false;
      var g = order[k], c = shuffle(allowed[g]);
      for (var i=0;i<c.length;i++){
        var r = c[i]; if (used[r]) continue;
        used[r] = true; res[g] = r;
        if (dfs(k+1)) return true;
        used[r] = false; res[g] = -1;
      }
      return false;
    }
    return dfs(0) ? res : null;
  }

  function doDraw(){
    var n = S.names.length, allowed = [];
    for (var i=0;i<n;i++){
      allowed[i] = [];
      for (var j=0;j<n;j++) if (i!==j && !excluded(i,j)) allowed[i].push(j);
    }
    var a = solve(n, allowed);
    if (!a){ ui.err = 'Con esas exclusiones no hay ningún sorteo posible. Quita alguna exclusión.'; return false; }
    S.assign = a; S.seen = {}; S.phase = 'draw'; save(); return true;
  }

  // ---------- Pantallas ----------
  function viewNames(){
    var input = el('input',{type:'text',placeholder:'Nombre (ej. Marta)',maxlength:'24',id:'nm'});
    function add(){
      var v = input.value.trim();
      if (!v) return;
      if (S.names.length >= MAX){ ui.err = 'Máximo '+MAX+' participantes.'; return render(); }
      if (S.names.some(function(x){ return x.toLowerCase() === v.toLowerCase(); })){ ui.err = 'Ese nombre ya está. Si hay dos iguales, añade una inicial (Ana M. / Ana P.).'; return render(); }
      ui.err = ''; S.names.push(v); save(); render(); var i2 = document.getElementById('nm'); if (i2) i2.focus();
    }
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); add(); } });
    var chips = el('div',{class:'chips'}, S.names.map(function(nm,i){
      return el('span',{class:'chip'},[el('span',{text:nm}), el('button',{type:'button','aria-label':'Quitar '+nm,text:'×',onclick:function(){ S.names.splice(i,1); save(); render(); }})]);
    }));
    return [
      box('¿Quiénes juegan?',[
        para('Escribe los nombres de todos los participantes (mínimo 3).','hint'),
        el('div',{class:'row'},[input, btn('Añadir', add, 'alt fix')]),
        errBox(), chips,
        btn('Siguiente →', function(){ ui.err=''; S.phase='excl'; save(); render(); }, '', S.names.length < 3)
      ])
    ];
  }

  function viewExcl(){
    var opts = function(){ return S.names.map(function(nm,i){ return el('option',{value:String(i),text:nm}); }); };
    var selA = el('select',{'aria-label':'Quién no puede regalar'}, opts());
    var selB = el('select',{'aria-label':'A quién no puede regalar'}, opts());
    if (S.names.length > 1) selB.value = '1';
    var both = el('input',{type:'checkbox',id:'both'}); both.checked = true;
    function add(){
      var a = +selA.value, b = +selB.value;
      if (a === b){ ui.err = 'Elige dos personas distintas (nadie se regala a sí mismo, eso ya va incluido).'; return render(); }
      ui.err = '';
      if (!excluded(a,b)) S.excl.push([a,b]);
      if (both.checked && !excluded(b,a)) S.excl.push([b,a]);
      save(); render();
    }
    var list = el('div',{class:'chips'}, S.excl.map(function(x,i){
      return el('span',{class:'chip'},[el('span',{text:S.names[x[0]]+' ✗ '+S.names[x[1]]}),
        el('button',{type:'button','aria-label':'Quitar exclusión',text:'×',onclick:function(){ S.excl.splice(i,1); save(); render(); }})]);
    }));
    return [
      box('¿Quién no puede regalar a quién?',[
        para('Parejas, hermanos, quien ya se regala todo el año… Añade las exclusiones que haga falta. Si no hay ninguna, sigue adelante.','hint'),
        el('div',{class:'row'},[selA, el('span',{class:'fix',text:'no puede regalar a'}), selB]),
        el('label',{class:'check',for:'both'},[both, el('span',{text:'También al revés (ej. parejas)'})]),
        btn('Añadir exclusión', add, 'alt'),
        errBox(),
        S.excl.length ? list : para('Sin exclusiones por ahora.','hint'),
        el('div',{class:'row'},[
          btn('← Volver', function(){ S.excl=[]; ui.err=''; S.phase='names'; save(); render(); }, 'ghost'),
          btn('Siguiente →', function(){
            ui.err=''; S.phase='curses'; save(); render();
          })
        ])
      ])
    ];
  }

  function viewCurses(){
    var pend = S.names.filter(function(nm,i){ return !S.curses[i]; }).length;
    if (ui.curseWho !== null){
      var i = ui.curseWho;
      var ta = el('textarea',{maxlength:'80',placeholder:'Ej.: el cargador que nunca encuentro',id:'cu'});
      return [box('Hola, '+S.names[i],[
        para('Que nadie mire. Escribe el objeto cotidiano que te persigue (tu "maldición"). Quien te toque tendrá que regalártelo, pero mejorado.','hint'),
        ta,
        btn('🎲 No se me ocurre nada, dame una', function(){
          var used = Object.keys(S.curses).map(function(k){ return S.curses[k].toLowerCase(); }).concat(ui.tried || []);
          var free = IDEAS.filter(function(x){ return used.indexOf(x.toLowerCase()) < 0; });
          if (!free.length){ ui.err = 'Ya no quedan ideas sin usar. Escribe la tuya.'; return render(); }
          ui.err = '';
          ta.value = free[rnd(free.length)];
          ui.tried = (ui.tried || []).concat(ta.value.toLowerCase());
        }, 'alt'),
        errBox(),
        el('div',{class:'row'},[
          btn('Cancelar', function(){ ui.curseWho=null; ui.err=''; render(); }, 'ghost'),
          btn('Guardar y ocultar', function(){
            var v = ta.value.trim();
            if (!v){ ui.err = 'Escribe algo, aunque sea un calcetín.'; return render(); }
            S.curses[i] = v; ui.curseWho = null; ui.err = ''; save(); render();
          }, 'pk')
        ])
      ])];
    }
    var grid = el('div',{class:'names'}, S.names.map(function(nm,i){
      var done = !!S.curses[i];
      return btn((done ? '✓ ' : '') + nm, function(){
        if (done && !confirm('¿Cambiar la maldición de '+nm+'? Se pedirá una nueva.')) return;
        ui.curseWho = i; ui.err=''; render();
      }, done ? 'done' : '');
    }));
    return [box('Cada uno escribe su maldición',[
      para('Por turnos: toca tu nombre, escribe tu maldición y se oculta. Así nadie ve la de los demás.','hint'),
      grid, errBox(),
      pend ? para('Faltan '+pend+' por escribir.','hint') : null,
      el('div',{class:'row'},[
        btn('← Volver', function(){ ui.err=''; S.phase='excl'; save(); render(); }, 'ghost'),
        btn('🎲 Hacer el sorteo', function(){ ui.err=''; if (doDraw()) render(); else render(); }, 'pk', pend > 0)
      ])
    ])];
  }

  function viewDraw(){
    if (ui.reveal !== null){
      var i = ui.reveal, r = S.assign[i];
      return [box('Tu sorteo, '+S.names[i],[
        el('div',{class:'reveal'},[
          para('Le regalas a…'),
          el('div',{class:'who',text:S.names[r]}),
          para('Su maldición es…'),
          el('div',{class:'curse',text:S.curses[r]}),
          para('Hazle <b>dos regalos</b>: su maldición mejorada (con leyenda falsa) y un regalo normal de máx. 15 €.'.replace(/<\/?b>/g,''),'hint')
        ]),
        btn('Entendido, ocultar', function(){ ui.reveal = null; ui.who = null; render(); }, 'pk big')
      ])];
    }
    if (ui.who !== null){
      var w = ui.who;
      return [box('¿Eres '+S.names[w]+'?',[
        para('Asegúrate de que nadie más mira la pantalla.','hint'),
        el('div',{class:'row'},[
          btn('← No, volver', function(){ ui.who = null; render(); }, 'ghost'),
          btn('Sí, ver mi sorteo', function(){ S.seen[w] = true; save(); ui.reveal = w; render(); }, 'pk')
        ])
      ])];
    }
    var left = S.names.filter(function(nm,i){ return !S.seen[i]; }).length;
    var grid = el('div',{class:'names'}, S.names.map(function(nm,i){
      var seen = !!S.seen[i];
      return btn((seen ? '✓ ' : '') + nm, function(){
        if (seen){
          if (!confirm(nm+' ya lo ha visto. ¿Volver a mostrarlo? Que nadie más mire.')) return;
        }
        ui.who = i; render();
      }, seen ? 'done' : '');
    }));
    return [box('Toca tu nombre',[
      para(left ? 'Cada uno ve su sorteo cuando le toque. Faltan '+left+'.' : '¡Todos han visto su sorteo! A preparar los regalos 🎁', 'hint'),
      grid,
      el('div',{class:'row'},[
        el('a',{class:'btn pk',href:'fiesta.html',text:'🎉 Ir a la fiesta'})
      ])
    ])];
  }

  function render(){
    var app = document.getElementById('app');
    app.textContent = '';
    var views = { names:viewNames, excl:viewExcl, curses:viewCurses, draw:viewDraw };
    if (ui.restored){
      var phaseTxt = { names:'participantes', excl:'exclusiones', curses:'maldiciones', draw:'sorteo hecho' }[S.phase];
      var extra = S.phase === 'draw' ? ' '+Object.keys(S.seen).length+' de '+S.names.length+' ya han visto su sorteo.' : '';
      app.appendChild(box('👋 Tienes un sorteo guardado',[
        para('He recuperado lo que había en este dispositivo ('+S.names.length+' participantes, fase: '+phaseTxt+').'+extra+' ¿Seguimos donde estabas o empezamos de cero?','hint'),
        el('div',{class:'row'},[
          btn('Seguir', function(){ ui.restored = false; render(); }, 'alt'),
          btn('Empezar de cero', function(){ if (confirm('Se borra todo lo guardado. ¿Seguro?')){ S = fresh(); ui = { err:'', who:null, reveal:null, curseWho:null, restored:false }; save(); render(); } }, 'pk')
        ])
      ]));
    }
    (views[S.phase]() || []).forEach(function(n){ app.appendChild(n); });
    var st = document.getElementById('steps'); st.textContent = '';
    PHASES.forEach(function(p){ st.appendChild(el('span',{class:p[0]===S.phase?'on':'',text:p[1]})); });
    window.scrollTo(0,0);
  }

  document.getElementById('reset').addEventListener('click', function(){
    if (!confirm('¿Empezar de nuevo? Se borran participantes, exclusiones, maldiciones y el sorteo.')) return;
    S = fresh(); ui = { err:'', who:null, reveal:null, curseWho:null, restored:false }; save(); render();
  });

  window.addEventListener('beforeunload', function(e){
    if (S.names.length){ e.preventDefault(); e.returnValue = ''; }
  });

  render();
})();
