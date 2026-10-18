// AIX · Amigo Invisible X — © 2026 xacoy — GNU GPL v3 (ver LICENSE)
(function(){
  'use strict';

  var CATS = {
    cerebro: '🧠 Cerebro',
    curro:   '💼 Curro',
    reunion: '📅 Reuniones',
    ego:     '👑 Ego',
    estilo:  '🕶️ Estilo'
  };

  // c = categoría, f = frase corporativa, r = traducción real, v = veneno (1-5)
  var DATA = [
    {c:'cerebro', v:3, f:'Tienes un perfil muy particular, pero muy particular.', r:'No sé qué haces aquí.'},
    {c:'cerebro', v:4, f:'Admiro tu capacidad de no dejarte influir por los datos.', r:'Eres terco y no lees nada.'},
    {c:'cerebro', v:3, f:'Aportas una mirada fresca y totalmente ajena al contexto.', r:'No tienes ni idea de lo que hablamos.'},
    {c:'cerebro', v:5, f:'Tu potencial sigue siendo, a día de hoy, una gran incógnita.', r:'Llevas años sin dar un palo al agua.'},
    {c:'cerebro', v:2, f:'Es una idea muy valiente. Muy, muy valiente.', r:'Es una tontería monumental.'},
    {c:'cerebro', v:4, f:'Hay una curva de aprendizaje ahí. Una curva... larga.', r:'Eres lento aprendiendo.'},
    {c:'cerebro', v:3, f:'Vamos a bajar esto a un nivel más accesible, por ti.', r:'No lo vas a entender si lo explico normal.'},
    {c:'curro',   v:4, f:'Estoy seguro de que lo has dado todo, y ese es el problema.', r:'Esto es lo mejor que sabes hacer, y es malo.'},
    {c:'curro',   v:3, f:'Como siempre, tu entregable ha sido... un entregable.', r:'Tu trabajo es mediocre.'},
    {c:'curro',   v:3, f:'Lo hemos puesto en la categoría de «mejorable en el medio plazo».', r:'Está fatal, pero hoy no tengo ganas de pelea.'},
    {c:'curro',   v:4, f:'Agradezco que hayas tomado la iniciativa. La próxima vez, consúltame.', r:'Has liado algo gordo por tu cuenta.'},
    {c:'curro',   v:5, f:'Hemos decidido apostar por perfiles más alineados con la visión.', r:'Estás despedido, pero con PowerPoint.'},
    {c:'curro',   v:2, f:'Lo revisaré con calma cuando tenga un hueco. Quizá en el Q3.', r:'No pienso mirarlo nunca.'},
    {c:'curro',   v:4, f:'Gracias por tu proactividad. Aquí hay mucho trabajo de otras personas.', r:'Deja de meterte en mis cosas.'},
    {c:'curro',   v:3, f:'Como bien sabrás, esto ya lo dije hace dos semanas.', r:'Me ignoraste y ahora lo arreglo yo.'},
    {c:'reunion', v:2, f:'Perdona, ¿puedes ponerme al día? Es que estoy en modo escucha.', r:'No me importa lo que dices.'},
    {c:'reunion', v:3, f:'Vamos a sacar esto offline para no robarle tiempo al resto.', r:'Cállate ya, por favor.'},
    {c:'reunion', v:3, f:'Gracias por el brainstorming. Lo guardamos en la nevera de ideas.', r:'No pienso hacerte ni caso.'},
    {c:'reunion', v:4, f:'Me parece interesante, pero esta reunión podía haber sido un email. Y tu intervención, un silencio.', r:'Cada vez que hablas pierdo años de vida.'},
    {c:'reunion', v:2, f:'Aprovecho para recordar que el micrófono se silencia desde el botón.', r:'Mira que eres pesado.'},
    {c:'reunion', v:3, f:'Lo dejamos en el parking lot para tratarlo con más calma.', r:'No lo vamos a tratar jamás.'},
    {c:'reunion', v:4, f:'Qué bien que te unas, aunque sea por los últimos diez minutos.', r:'Llegas tarde, como siempre.'},
    {c:'ego',     v:4, f:'Se nota que tienes mucha seguridad en ti mismo. Mucha.', r:'Eres un creído.'},
    {c:'ego',     v:3, f:'Todos admiramos tu relación tan sana con el protagonismo.', r:'Hablas de ti sin parar.'},
    {c:'ego',     v:5, f:'Tu opinión sobre ti es lo único que no necesita presupuesto.', r:'Te quieres demasiado.'},
    {c:'ego',     v:3, f:'Qué bonito que te sientas imprescindible. Es un valor en alza.', r:'No lo eres.'},
    {c:'ego',     v:4, f:'Nos encanta cómo te has atribuido el trabajo de todo el equipo.', r:'Eres un ladrón de méritos.'},
    {c:'ego',     v:2, f:'Gracias por tu feedback, lo tendré en cuenta en el lugar que le corresponde.', r:'En la papelera.'},
    {c:'estilo',  v:3, f:'Qué atrevimiento con esa camisa. En la oficina no se ve a menudo.', r:'Qué espanto.'},
    {c:'estilo',  v:2, f:'Tienes un estilo muy tuyo, de esos que no se pueden copiar ni queriendo.', r:'Vistes fatal.'},
    {c:'estilo',  v:3, f:'Ese peinado desafía las tendencias, y la gravedad.', r:'Vas despeinado.'},
    {c:'estilo',  v:4, f:'Tu café huele a que ha sido un fin de semana intenso.', r:'Hueles a derrota.'},
    {c:'estilo',  v:2, f:'Qué corbata tan retro. Apenas queda gente que se atreva.', r:'Es de 1983 y se nota.'},
    {c:'estilo',  v:3, f:'Admiro lo cómodo que vas siempre, sin cuidar la imagen de marca.', r:'Vienes hecho un adefesio.'},
    {c:'cerebro', v:5, f:'Estamos trabajando para que tu rol deje de ser un misterio.', r:'Nadie sabe qué haces.'},
    {c:'curro',   v:3, f:'Entiendo que el email se te ha perdido. Te lo reenvío por quinta vez.', r:'Léelo ya, por favor.'}
  ];

  var FRANK_A = [
    'Con todo el cariño del mundo,',
    'Sin ánimo de ofender, y con copia a Dirección,',
    'Desde el máximo respeto profesional,',
    'Para alinearnos como equipo,',
    'Con ánimo constructivo y la sonrisa puesta,',
    'Quiero que esto quede entre nosotros y los treinta de la lista de distribución:',
    'Entre tú y yo, que somos un equipo:'
  ];
  var FRANK_B = [
    'tu forma de trabajar es muy tuya',
    'tu impuntualidad ya forma parte de la cultura de empresa',
    'tus ideas son siempre una excelente fuente de debate (generalmente perdido)',
    'tu nivel de implicación es, digamos, de bajo consumo',
    'tu criterio es de esos que hay que contrastar con otra persona',
    'tu capacidad para desaparecer justo antes de las tareas me fascina',
    'tu relación con los plazos es de las más creativas de la plantilla',
    'tus correos son un género literario propio',
    'tu seguridad hablando de lo que no sabes es admirable'
  ];
  var FRANK_C = [
    'y por eso te queremos en otro departamento.',
    'y confío en que esta vez lo escuches.',
    'y nadie quiere decírtelo, así que me ofrezco voluntario.',
    'y seguro que lo vas a gestionar con la madurez que te caracteriza.',
    'y lo recogemos como un área de mejora, la única que tienes.',
    'y eso que no es mi función decírtelo.',
    'pero ya sabes que aquí valoramos mucho la diversidad de rendimientos.',
    'y no lo digo yo, lo dice el ambiente.'
  ];

  var LEVELS = ['Brisa de aire acondicionado','Pellizco de monja','Pulla de pasillo','Memo con mala leche','Despido con confeti'];

  function $(id){ return document.getElementById(id); }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }

  var cat = 'todas';
  var current = null;
  var last = null;
  var toastT = 0;

  function toast(msg){
    var t = $('toast'); t.textContent = msg;
    clearTimeout(toastT); toastT = setTimeout(function(){ t.textContent = ''; }, 2500);
  }

  function copy(text){
    function ok(){ toast('Copiado. Úsalo con sabiduría (y con testigos).'); }
    function fail(){ toast('Tu navegador no deja copiar. Selecciona el texto a mano.'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fail);
    } else {
      fail();
    }
  }

  function renderChips(){
    var box = $('chips');
    var names = [['todas','🎰 Todas']];
    Object.keys(CATS).forEach(function(k){ names.push([k, CATS[k]]); });
    names.forEach(function(n){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = n[1];
      b.setAttribute('aria-pressed', n[0] === cat ? 'true' : 'false');
      b.addEventListener('click', function(){
        cat = n[0];
        Array.prototype.forEach.call(box.children, function(c){ c.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        next();
      });
      box.appendChild(b);
    });
  }

  function showReal(show){
    $('real').hidden = !show;
    $('meter').hidden = !show;
    $('reveal').textContent = show ? '🙈 Ocultar' : '🔍 Traducir';
  }

  function next(){
    var pool = DATA.filter(function(d){ return cat === 'todas' || d.c === cat; });
    if (!pool.length) return;
    var d;
    var tries = 0;
    do { d = pick(pool); tries++; } while (d === last && pool.length > 1 && tries < 20);
    last = current = d;
    $('phrase').textContent = '«' + d.f + '»';
    $('real').textContent = d.r;
    $('meter-bar').style.setProperty('--v', (d.v * 20) + '%');
    $('meter-txt').textContent = d.v + '/5 · ' + LEVELS[d.v - 1];
    $('memo-no').textContent = 'Nº ' + String(Math.floor(Math.random()*9000)+1000);
    $('reveal').disabled = false;
    $('copy').disabled = false;
    showReal(false);
  }

  function renderList(){
    var q = $('q').value.trim().toLowerCase();
    var box = $('list');
    box.textContent = '';
    var n = 0;
    DATA.forEach(function(d){
      if (q && (d.f + ' ' + d.r + ' ' + CATS[d.c]).toLowerCase().indexOf(q) < 0) return;
      n++;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'flip';
      b.setAttribute('aria-pressed', 'false');
      var s = document.createElement('small'); s.textContent = CATS[d.c];
      var st = document.createElement('strong'); st.textContent = '«' + d.f + '»';
      var tap = document.createElement('span'); tap.className = 'tap'; tap.textContent = 'Toca para traducir';
      b.appendChild(s); b.appendChild(st); b.appendChild(tap);
      b.addEventListener('click', function(){
        var on = b.classList.toggle('on');
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        s.textContent = on ? 'Traducción real' : CATS[d.c];
        st.textContent = on ? d.r : '«' + d.f + '»';
        tap.textContent = on ? 'Toca para volver' : 'Toca para traducir';
      });
      box.appendChild(b);
    });
    if (!n) {
      var e = document.createElement('p'); e.className = 'empty';
      e.textContent = 'Nada con ese nombre. Recursos Humanos lo ha archivado.';
      box.appendChild(e);
    }
    $('count').textContent = n + ' de ' + DATA.length + ' memorandos';
  }

  function frank(){
    var s = pick(FRANK_A) + ' ' + pick(FRANK_B) + ' ' + pick(FRANK_C);
    $('frank-out').textContent = s;
    $('frank-copy').disabled = false;
  }

  renderChips();
  renderList();
  $('next').addEventListener('click', next);
  $('reveal').addEventListener('click', function(){ showReal($('real').hidden); });
  $('copy').addEventListener('click', function(){
    if (current) copy('«' + current.f + '»' + ($('real').hidden ? '' : ' (' + current.r + ')'));
  });
  $('q').addEventListener('input', renderList);
  $('frank-go').addEventListener('click', frank);
  $('frank-copy').addEventListener('click', function(){ copy($('frank-out').textContent); });
})();
