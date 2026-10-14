/* AIX · Amigo Invisible X — © 2026 xacoy — GNU GPL v3 (ver LICENSE) */
  const rimas = [
    "Lo que te doy no es un bollo,\nni tampoco es un pimiento.\nSi lo adivinas, te adoro;\nsi no, me río un momento.",
    "Tengo cara de inocente\ny manos de gran ladrón.\nTe regalo lo que odias,\npero con mucha pasión.",
    "No soy tu madre ni tu tía,\npero te sigo la pista.\nSi te sientas en la silla,\nme verás con cara lista.",
    "Una vez perdí un zapato\ny encontré una profecía:\nque tú vas a ser mi presa\nel día de la alegría.",
    "Ni soy rojo, ni soy verde,\nni me gusta el champiñón.\nSi me miras fijamente,\nme pongo a hacer un montón.",
    "Llevo un regalo escondido\nen el bolsillo del abrigo.\nSi me miras con sospecha,\nme río, pero no te digo.",
    "No me busques en la lista,\nni me busques en la nube.\nSoy el que te mira raro\ncada vez que el turrón sube.",
    "Ni soy ángel ni soy diablo,\nsoy un tipo con envoltorio.\nSi no adivinas mi nombre,\ntoca ir al laboratorio.",
    "Una pista, dos pistas, tres:\nsoy de los que llegan tarde.\nSi me ves con cara rara,\nes que el regalo ya arde.",
    "Tu maldición tiene dueño\ny ese dueño soy yo.\nLa mejoré con esmero,\nquién sabe si te gustó.",
    "Me han dicho que soy discreto,\npero tiemblo al disimular.\nSi me ves sudar la frente,\nes que me quiero delatar.",
    "Compré lo normal en rebajas\ny lo absurdo en el desván.\nDe tu cara al abrirlos\nme voy a reír de más.",
    "Yo no sé de poesía,\npero sé de calcetines.\nSi me tocas, ten cuidado:\ntengo planes y tengo fines.",
    "El que lee estas pistas\nya está metido en el lío.\nNo soy ni tu primo ni tu tío,\npero casi, ¡qué desvarío!",
    "Con papel de regalo viejo\ny cinta de aquel verano,\nenvolveré tu maldición\ncon todo mi cariño insano.",
    "Si tu regalo se mueve,\nno es magia, es mi sobrino.\nSi tu regalo huele raro,\nes mi estilo, es mi destino.",
    "Voy vestido de misterio\ny calzado de ironía.\nTe regalo lo que sueñas\no lo que se me ocurría."
  ];
  const quien = ["un arqueólogo borracho","una monja con muy mala leche","un pirata jubilado","un cartero con superpoderes","un tío abuelo que nadie recuerda","una cabra con título universitario","un taxista que había leído demasiado","una abuela con un detector de metales","un mago retirado sin conejo","tres gaviotas con sombrero","un notario sin ganas de notariar","el conserje del edificio de enfrente","un vendedor de enciclopedias muy convincente","un grupo de turistas perdidos"];
  const donde = ["las ruinas de Teguise","un contenedor de Santa Cruz","la cima del Teide a las 3 de la mañana","el fondo de un baúl de 1743","una gasolinera de Fuerteventura","debajo de un sofá en La Laguna","el buzón de una casa deshabitada","un ascensor averiado de un hotel de Benidorm","la sala de espera de un dentista","un mercadillo a las seis de la mañana","el maletero de un coche abandonado","el tejado de una iglesia","un faro en pleno temporal","el baño de un bar sin nombre"];
  const anio  = ["1743","1812","1969","el año 3000","el verano de 1987","un martes cualquiera","el invierno de 1923","la noche de San Juan de 1999","hace tres lunes","el día que se cayó internet","poco antes del Big Bang"];
  const extra = ["Desde entonces trae mala suerte… pero solo los jueves.","Se dice que habla en sueños.","Fue tasado por un experto que salió corriendo.","Su dueño anterior desapareció sin dejar rastro (se fue de vacaciones).","Está maldito, pero con garantía de dos años.","Lo guardaron en una vitrina y la vitrina huyó.","Quien lo toca estornuda tres veces seguidas.","Cada luna llena cambia de color, pero nadie lo ha visto.","Los expertos lo declararon «inclasificable» y se fueron a comer.","Si lo agitas, suena a una versión de Bonanza.","Tiene tres propietarios anteriores y los tres lo negaron."];
  const rnd = n => { const b = new Uint32Array(1), lim = Math.floor(4294967296/n)*n; do { crypto.getRandomValues(b); } while (b[0] >= lim); return b[0] % n; };
  const pick = a => a[rnd(a.length)];
  const gen = document.getElementById('gen'), btnGen = document.getElementById('btnGen');
  const tabs = [...document.querySelectorAll('.tab')];
  const ideas = window.AIX_IDEAS || [];
  const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const deck = (arr) => { let d = []; return () => { if (!d.length) d = shuffle(arr); return d.pop(); }; };
  const nextRima = deck(rimas), nextIdea = deck(ideas);
  const MODES = {
    ley: { label:'📜 Inventar leyenda', cls:'alt', rhyme:false, make:() => ['Este objeto fue hallado en ', {b:pick(donde)}, ' por ', {b:pick(quien)}, ' en ', {b:pick(anio)}, '. ' + pick(extra)] },
    mal: { label:'🧦 Inventar maldición', cls:'', rhyme:false, make:() => ['Tu maldición es:', {br:true}, {b:nextIdea()}] },
    pis: { label:'🎲 Dame una pista en rima', cls:'pk', rhyme:true, make:() => [nextRima()] }
  };
  // Se construye con nodos DOM (textContent): nada se interpreta como HTML.
  function show(parts){
    gen.textContent = '';
    const span = document.createElement('span');
    parts.forEach(p => {
      if (typeof p === 'string') span.appendChild(document.createTextNode(p));
      else if (p.br) span.appendChild(document.createElement('br'));
      else { const b = document.createElement('b'); b.textContent = p.b; span.appendChild(b); }
    });
    gen.appendChild(span);
  }
  const last = {};
  let mode = 'ley';
  function setMode(k){
    mode = k; const m = MODES[k];
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.k === k ? 'true' : 'false'));
    btnGen.textContent = m.label; btnGen.className = 'btn ' + m.cls;
    gen.className = 'gen' + (m.rhyme ? ' rhyme' : '');
    gen.setAttribute('aria-labelledby', 'tab-' + k);
    show(last[k] || ['Pulsa el botón…']);
  }
  tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.k)));
  btnGen.addEventListener('click', () => { last[mode] = MODES[mode].make(); show(last[mode]); });
  setMode('ley');
