/* AIX · Amigo Invisible X — © 2026 xacoy — GNU GPL v3 (ver LICENSE) */
(function(){
  var SKEY = 'aix_sorteo_v1', FKEY = 'aix_fiesta_v1';
  var PHASES = [['turnos','1 · Discursos'],['votos','2 · Votaciones'],['premios','3 · Premios']];
  var CATS = [
    ['absurdo','🎁 Mejor regalo absurdo','Vota a quien lo regaló.'],
    ['inutil','🧦 Calcetín del Destino (el regalo más inútil)','El regalo más cutre, más inútil o más de mierda. Vota a quien lo regaló.']
  ];
  var MIN = 30; // segundos mínimos de discurso

  var MAX = 30;
  // Lo guardado en el navegador se valida: si está corrupto o manipulado, se descarta en vez de romper la página.
  function saneSorteo(o){
    try{
      if (!o || typeof o !== 'object') return null;
      var n = o.names, a = o.assign;
      if (!Array.isArray(n) || n.length < 3 || n.length > MAX || !Array.isArray(a) || a.length !== n.length) return null;
      for (var i=0;i<n.length;i++) if (typeof n[i] !== 'string' || !n[i] || n[i].length > 24) return null;
      var ok = function(x){ return typeof x === 'number' && x % 1 === 0 && x >= 0 && x < n.length; };
      if (!a.every(ok) || new Set(a).size !== a.length || a.some(function(x,i){ return x === i; })) return null;
      return { names:n, assign:a };
    }catch(e){ return null; }
  }
  var sorteo = null;
  try { sorteo = saneSorteo(JSON.parse(localStorage.getItem(SKEY) || 'null')); } catch(e){}
  var names = sorteo ? sorteo.names : [];
  var assign = sorteo ? sorteo.assign : null;
  var F = saneF(loadF()) || fresh();
  var ui = { err:'', voter:null, who:null, secs:0, running:false, shown:false };
  var tick = null;

  function fresh(){ return { phase:'turnos', order:null, idx:0, votes:{}, voted:{} }; }
  function saneF(o){
    try{
      if (!o || typeof o !== 'object' || !names.length) return null;
      var n = names.length, ok = function(x){ return typeof x === 'number' && x % 1 === 0 && x >= 0 && x < n; };
      if (['turnos','votos','premios'].indexOf(o.phase) < 0) return null;
      var order = o.order;
      if (order !== null){
        if (!Array.isArray(order) || order.length !== n || !order.every(ok) || new Set(order).size !== n) return null;
      }
      if (!ok(o.idx) && o.idx !== n) return null;
      var votes = {}, voted = {};
      if (o.votes && typeof o.votes === 'object' && !Array.isArray(o.votes)){
        Object.keys(o.votes).forEach(function(k){
          var v = o.votes[k];
          if (!ok(+k) || !v || typeof v !== 'object') return;
          var clean = {}, good = true;
          CATS.forEach(function(c){ if (ok(v[c[0]]) && v[c[0]] !== +k) clean[c[0]] = v[c[0]]; else good = false; });
          if (good){ votes[k] = clean; voted[k] = true; }
        });
      }
      return { phase:o.phase, order:order, idx:o.idx, votes:votes, voted:voted };
    }catch(e){ return null; }
  }
  function loadF(){ try{ var r = localStorage.getItem(FKEY); return r ? JSON.parse(r) : null; }catch(e){ return null; } }
  function save(){ try{ localStorage.setItem(FKEY, JSON.stringify(F)); }catch(e){} }
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
  function rnd(n){ var b = new Uint32Array(1), lim = Math.floor(4294967296/n)*n; do { crypto.getRandomValues(b); } while (b[0] >= lim); return b[0] % n; }
  function shuffle(a){ a = a.slice(); for (var i=a.length-1;i>0;i--){ var j=rnd(i+1); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function fmt(s){ var m = Math.floor(s/60), r = s%60; return m+':'+(r<10?'0':'')+r; }
  function stopTimer(){ if (tick){ clearInterval(tick); tick = null; } ui.running = false; }

  // ---------- 1 · Discursos ----------
  function viewTurnos(){
    if (!F.order) { F.order = shuffle(names.map(function(_,i){return i;})); save(); }
    if (F.idx >= F.order.length){
      return [box('¡Todos han hablado! 👏',[
        para('Ya están todos los discursos. Toca votar.','hint'),
        btn('Pasar a las votaciones →', function(){ F.phase='votos'; save(); render(); }, 'pk big')
      ])];
    }
    var g = F.order[F.idx], r = assign[g];
    var timerEl = el('div',{class:'timer',id:'tm',text:fmt(ui.secs)});
    var fill = el('i',{id:'fill'});
    var msg = el('p',{class:'hint',id:'tmsg',text:'Mínimo '+MIN+' segundos. Máximo: hasta que alguien aplauda por compasión.'});
    var startBtn = btn(ui.running ? '⏸ Pausar' : (ui.secs ? '▶ Seguir' : '▶ Empezar discurso'), function(){
      if (ui.running){ stopTimer(); } else {
        ui.running = true;
        tick = setInterval(function(){ ui.secs++; upd(); }, 1000);
      }
      render();
    }, 'alt');
    function upd(){
      var t = document.getElementById('tm'); if (t) t.textContent = fmt(ui.secs);
      var f = document.getElementById('fill'); if (f){ f.style.width = Math.min(100, ui.secs/MIN*100)+'%'; f.className = ui.secs>=MIN?'ok':''; }
      var m = document.getElementById('tmsg'); if (m && ui.secs>=MIN) m.textContent = '✅ Ya cumples el mínimo. Ahora, ¡que alguien aplauda!';
    }
    function next(){ stopTimer(); ui.secs = 0; ui.shown = false; F.idx++; save(); render(); }
    setTimeout(upd, 0);
    return [box('Turno '+(F.idx+1)+' de '+F.order.length,[
      el('div',{class:'stage'},[
        para('Le toca a…'),
        el('div',{class:'who',text:names[g]}),
        ui.shown
          ? el('div',{},[para('y presenta a su invisible:'), el('div',{class:'who',text:names[r]})])
          : btn('🎭 Revelar a quién presenta', function(){ ui.shown = true; render(); }, 'pk'),
        timerEl,
        el('div',{class:'bar'},[fill]),
        msg
      ]),
      el('div',{class:'row'},[startBtn, btn('👏 Aplauso por compasión', next, 'pk')]),
      el('div',{class:'row'},[btn('Saltar turno →', next, 'ghost')])
    ])];
  }

  // ---------- 2 · Votaciones ----------
  function viewVotos(){
    if (ui.voter !== null){
      var v = ui.voter;
      ui.picks = ui.picks || {};
      var COLORS = ['#ff4fa3','#ffd23f','#2de2c5','#ff8a3d','#c9b8ff'];
      var others = names.map(function(n,i){return i;}).filter(function(i){return i!==v;});
      var blocks = CATS.map(function(c){
        var emoji = c[1].split(' ')[0], title = c[1].slice(c[1].indexOf(' ')+1);
        var tags = others.map(function(i){
          var av = el('span',{class:'av',text:names[i].charAt(0).toUpperCase()});
          av.style.background = COLORS[i%COLORS.length]; // CSSOM: permitido por la CSP (sin style inline)
          var b = el('button',{type:'button',class:'tagb',role:'radio','aria-checked':ui.picks[c[0]]===i?'true':'false'},[
            av,
            el('span',{class:'nm',text:names[i]})
          ]);
          b.addEventListener('click', function(){
            ui.picks[c[0]] = i; ui.err = '';
            var er = document.querySelector('#app .err'); if (er) er.remove();
            var sib = b.parentNode.children;
            for (var q=0;q<sib.length;q++) sib[q].setAttribute('aria-checked', sib[q]===b ? 'true' : 'false');
          });
          return b;
        });
        return el('div',{class:'catx'},[
          el('div',{class:'cathead'},[el('span',{class:'ce',text:emoji}), el('div',{},[el('div',{class:'ct',text:title}), el('div',{class:'hint',text:c[2]})])]),
          el('div',{class:'tags',role:'radiogroup','aria-label':title}, tags)
        ]);
      });
      return [box('Vota, '+names[v],[
        para('Que nadie mire. Toca una etiqueta por premio. No puedes votarte a ti mismo.','hint'),
        el('div',{}, blocks),
        ui.err ? el('div',{class:'err',text:ui.err}) : null,
        el('div',{class:'row'},[
          btn('Cancelar', function(){ ui.voter=null; ui.picks={}; ui.err=''; render(); }, 'ghost'),
          btn('Guardar y ocultar', function(){
            var out = {};
            for (var k=0;k<CATS.length;k++){
              if (typeof ui.picks[CATS[k][0]] !== 'number'){ ui.err = 'Falta elegir en «'+CATS[k][1].slice(CATS[k][1].indexOf(' ')+1)+'».'; return render(); }
              out[CATS[k][0]] = ui.picks[CATS[k][0]];
            }
            F.votes[v] = out; F.voted[v] = true; ui.voter = null; ui.picks = {}; ui.err = ''; save(); render();
          }, 'pk')
        ])
      ])];
    }
    var left = names.filter(function(n,i){ return !F.voted[i]; }).length;
    return [box('Votaciones secretas',[
      para(left ? 'Por turnos: toca tu nombre y vota. Faltan '+left+'.' : '¡Todos han votado! Toca ver los premios.', 'hint'),
      el('div',{class:'names'}, names.map(function(nm,i){
        var done = !!F.voted[i];
        return btn((done?'✓ ':'')+nm, function(){
          if (done && !confirm('¿Cambiar el voto de '+nm+'?')) return;
          ui.voter = i; ui.picks = {}; ui.err=''; render();
        }, done?'done':'');
      })),
      el('div',{class:'row'},[
        btn('← Discursos', function(){ F.phase='turnos'; save(); render(); }, 'ghost'),
        btn('🏆 Ver premios', function(){ F.phase='premios'; save(); render(); }, 'pk', left>0)
      ])
    ])];
  }

  // ---------- 3 · Premios ----------
  function tally(cat){
    var c = names.map(function(){return 0;});
    Object.keys(F.votes).forEach(function(v){ var t = F.votes[v][cat]; if (typeof t === 'number') c[t]++; });
    var max = Math.max.apply(null, c);
    return { counts:c, max:max, winners: max>0 ? c.map(function(x,i){return x===max?i:-1;}).filter(function(i){return i>=0;}) : [] };
  }
  function viewPremios(){
    var cards = CATS.map(function(c){
      var t = tally(c[0]);
      var w = t.winners.map(function(i){ return names[i]; });
      var detail = names.map(function(n,i){return [n,t.counts[i]];}).filter(function(x){return x[1]>0;})
        .sort(function(a,b){return b[1]-a[1];}).map(function(x){return x[0]+' '+x[1];}).join(' · ');
      return el('div',{class:'cardx'},[
        el('span',{class:'prize',text:c[1].split(' ')[0]+' '}),
        el('span',{text:c[1].slice(c[1].indexOf(' ')+1)+': '}),
        el('span',{text: w.length ? w.join(' y ')+(w.length>1?' (¡empate!)':'') : 'sin votos'}),
        el('small',{text:detail || ''})
      ]);
    });
    return [box('🏆 Los premios',[
      para('Debajo de cada premio, los votos recibidos. En caso de empate, desempatad con un duelo de miradas.','hint')
    ].concat(cards).concat([
      el('div',{class:'row'},[btn('← Volver a votar', function(){ F.phase='votos'; save(); render(); }, 'ghost')])
    ]))];
  }

  function render(){
    var app = document.getElementById('app');
    app.textContent = '';
    var st = document.getElementById('steps'); st.textContent = '';
    if (!names.length || !assign){
      app.appendChild(box('Primero, el sorteo',[
        para('Aquí no hay ningún sorteo hecho. Haz el sorteo en este mismo dispositivo y vuelve.','hint'),
        el('a',{class:'btn pk',href:'sorteo.html',text:'🎲 Ir al sorteo'})
      ]));
      return;
    }
    PHASES.forEach(function(p){ st.appendChild(el('span',{class:p[0]===F.phase?'on':'',text:p[1]})); });
    var views = { turnos:viewTurnos, votos:viewVotos, premios:viewPremios };
    (views[F.phase]() || []).forEach(function(n){ app.appendChild(n); });
    window.scrollTo(0,0);
  }

  document.getElementById('reset').addEventListener('click', function(){
    if (!confirm('¿Reiniciar la fiesta? Se borran los turnos y las votaciones (el sorteo se conserva).')) return;
    stopTimer(); F = fresh(); ui = { err:'', voter:null, who:null, secs:0, running:false, shown:false }; save(); render();
  });
  window.addEventListener('beforeunload', function(e){
    if (F.phase !== 'turnos' || F.idx > 0 || Object.keys(F.voted).length){ e.preventDefault(); e.returnValue = ''; }
  });

  render();
})();
