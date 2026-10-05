const fields = [...document.querySelectorAll('[data-field]')];
const groups = [...document.querySelectorAll('[data-field-group]')];

function getData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString()
  };

  fields.forEach(el => {
    data[el.dataset.field] = el.value;
  });

  groups.forEach(g => {
    data[g.dataset.fieldGroup] = [
      ...g.querySelectorAll('input:checked')
    ].map(x => x.value);
  });

  return data;
}

function setData(data) {
  fields.forEach(el => {
    if (data[el.dataset.field] !== undefined) {
      el.value = data[el.dataset.field] || '';
    }
  });

  groups.forEach(g => {
    const vals = data[g.dataset.fieldGroup] || [];

    g.querySelectorAll('input').forEach(x => {
      x.checked = vals.includes(x.value);
    });
  });

  updateAll();
}

function updateAll() {
  // Atualiza contadores de caracteres
  document.querySelectorAll('[data-count]').forEach(s => {
    const f = document.querySelector(
      `[data-field="${s.dataset.count}"]`
    );

    s.textContent = f ? f.value.length : 0;
  });

  // Calcula progresso do formulário
  const filled = fields.filter(
    x => x.value.trim()
  ).length;

  const pct = Math.round(
    (filled / fields.length) * 100
  );

  document.getElementById('bar').style.width = pct + '%';

  document.getElementById('progressText').textContent =
    pct + '% preenchido';

  // Recupera todos os dados
  const d = getData();

  const mec = (d.mecanicas || [])
    .concat(
      d.mecanica_extra
        ? [d.mecanica_extra]
        : []
    )
    .join(', ') || '—';

  // Cria resumo automático
  document.getElementById('preview').textContent =
`JOGO: ${d.titulo || '—'}
ALUNO: ${d.aluno || '—'} | TURMA: ${d.turma || '—'}
GÊNERO: ${d.genero || '—'}
TEMA: ${d.tema || '—'}

CONCEITO:
${d.resumo || '—'}

PERSONAGEM:
${d.personagem || '—'} — ${d.tipo_personagem || '—'}

Habilidade:
${d.habilidade || '—'}

OBJETIVO:
${d.objetivo || '—'}

DESAFIO:
${d.desafio || '—'}

MECÂNICAS:
${mec}

ITEM IMPORTANTE:
${d.item || '—'}

OBSTÁCULO/INIMIGO:
${d.obstaculo || '—'}

VITÓRIA:
${d.vitoria || '—'}

DERROTA/FALHA:
${d.derrota || '—'}`;
}


// ==================================================
// SALVAR NO NAVEGADOR
// ==================================================

function saveLocal() {
  localStorage.setItem(
    'jamtec_gameplan',
    JSON.stringify(getData())
  );

  alert('Planejamento salvo neste navegador.');
}


// ==================================================
// CARREGAR DO NAVEGADOR
// ==================================================

function loadLocal() {
  const raw = localStorage.getItem(
    'jamtec_gameplan'
  );

  if (!raw) {
    return alert(
      'Nenhum planejamento salvo neste navegador.'
    );
  }

  setData(JSON.parse(raw));
}


// ==================================================
// EXPORTAR JSON
// ==================================================

function exportJSON() {
  const d = getData();

  const safe = (
    d.titulo || 'planejamento-jogo'
  ).replace(
    /[^A-Za-z0-9_-]+/g,
    '_'
  );

  const blob = new Blob(
    [
      JSON.stringify(
        d,
        null,
        2
      )
    ],
    {
      type: 'application/json'
    }
  );

  const a = document.createElement('a');

  a.href = URL.createObjectURL(blob);

  a.download =
    safe + '.json';

  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(a.href);
  }, 1000);
}


// ==================================================
// IMPORTAR JSON
// ==================================================

document
  .getElementById('importFile')
  .addEventListener(
    'change',
    e => {

      const file =
        e.target.files[0];

      if (!file) {
        return;
      }

      const r =
        new FileReader();

      r.onload = () => {
        try {

          setData(
            JSON.parse(
              r.result
            )
          );

          alert(
            'Planejamento importado com sucesso.'
          );

        } catch (err) {

          alert(
            'Arquivo JSON inválido.'
          );

        }
      };

      r.readAsText(file);
    }
  );


// ==================================================
// LIMPAR FORMULÁRIO
// ==================================================

function clearForm() {

  if (
    !confirm(
      'Limpar todos os campos?'
    )
  ) {
    return;
  }

  fields.forEach(
    x => x.value = ''
  );

  groups.forEach(
    g =>
      g
        .querySelectorAll('input')
        .forEach(
          x => x.checked = false
        )
  );

  updateAll();
}


// ==================================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==================================================

document.addEventListener(
  'input',
  updateAll
);

document.addEventListener(
  'change',
  updateAll
);


// Atualiza a página ao abrir
updateAll();
