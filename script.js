document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wavesForm');
  const btnCalc = document.getElementById('btnCalc');
  const btnSave = document.getElementById('btnSave');
  const btnPrint = document.getElementById('btnPrint');
  const report = document.getElementById('report');
  const reportContent = document.getElementById('reportContent');

  const STORAGE_KEY = 'ondas_consequenciais_draft';

  // Carregar rascunho salvo
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(id => {
        const el = document.getElementById(id) || form.querySelector(`[data-field="${id}"]`);
        if (el) el.value = data[id];
      });
      // Preencher inputs de ondas
      document.querySelectorAll('input[data-wave], select[data-wave]').forEach(el => {
        const key = `w${el.dataset.wave}_${el.dataset.field}`;
        if (data[key]) el.value = data[key];
      });
      // Preencher filtros
      if (data.filterPage) document.getElementById('filterPage').value = data.filterPage;
      if (data.filterRepeat) document.getElementById('filterRepeat').value = data.filterRepeat;
      if (data.filterOmission) document.getElementById('filterOmission').value = data.filterOmission;
    } catch (e) { console.warn('Erro ao carregar rascunho', e); }
  }

  // Coletar dados
  const collectData = () => {
    const data = {
      decisionTitle: document.getElementById('decisionTitle').value,
      decisionContext: document.getElementById('decisionContext').value,
      filterPage: document.getElementById('filterPage').value,
      filterRepeat: document.getElementById('filterRepeat').value,
      filterOmission: document.getElementById('filterOmission').value
    };
    for (let i = 1; i <= 3; i++) {
      data[`w${i}_consequence`] = form.querySelector(`input[data-wave="${i}"][data-field="consequence"]`).value;
      data[`w${i}_stakeholders`] = form.querySelector(`input[data-wave="${i}"][data-field="stakeholders"]`).value;
      data[`w${i}_probability`] = form.querySelector(`input[data-wave="${i}"][data-field="probability"]`).value;
      data[`w${i}_impact`] = form.querySelector(`select[data-wave="${i}"][data-field="impact"]`).value;
      data[`w${i}_mitigation`] = form.querySelector(`input[data-wave="${i}"][data-field="mitigation"]`).value;
    }
    return data;
  };

  // Gerar relatório
  const generateReport = (data) => {
    let html = `<h3>📌 ${data.decisionTitle || 'Decisão sem título'}</h3>`;
    if (data.decisionContext) html += `<p><em>Contexto:</em> ${data.decisionContext}</p>`;
    
    for (let i = 1; i <= 3; i++) {
      const bg = i === 1 ? '#dbeafe' : i === 2 ? '#fef3c7' : '#fee2e2';
      html += `<div class="wave-summary" style="background:${bg}">
        <h4>${i}ª Onda (${i===1?'0-3 meses':i===2?'3-12 meses':'1-5 anos'})</h4>
        <div class="data-row"><span class="data-label">Consequência:</span> <span>${data[`w${i}_consequence`] || '-'}</span></div>
        <div class="data-row"><span class="data-label">Stakeholders:</span> <span>${data[`w${i}_stakeholders`] || '-'}</span></div>
        <div class="data-row"><span class="data-label">Prob./Impacto:</span> <span>${data[`w${i}_probability`]||0}% / ${data[`w${i}_impact`]||0}</span></div>
        <div class="data-row"><span class="data-label">Mitigação:</span> <span>${data[`w${i}_mitigation`] || '-'}</span></div>
      </div>`;
    }

    html += `<div class="filters-summary">
      <h4>🔍 Validação Rápida</h4>
      <div class="data-row"><span class="data-label">Teste 1ª Página:</span> <span>${data.filterPage === 'sim' ? '✅ Aprovado' : '⚠️ Revisar'}</span></div>
      <div class="data-row"><span class="data-label">Teste Repetição:</span> <span>${data.filterRepeat ? data.filterRepeat.charAt(0).toUpperCase() + data.filterRepeat.slice(1) : '-'}</span></div>
      <div class="data-row"><span class="data-label">Custo Omissão:</span> <span>${data.filterOmission || '-'}</span></div>
    </div>`;

    return html;
  };

  btnCalc.addEventListener('click', () => {
    if (!form.checkValidity()) {
      alert('Preencha ao menos o título da decisão.');
      return;
    }
    const data = collectData();
    reportContent.innerHTML = generateReport(data);
    report.classList.remove('hidden');
    report.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  btnSave.addEventListener('click', () => {
    const data = collectData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    alert('💾 Rascunho salvo localmente!');
  });

  btnPrint.addEventListener('click', () => {
    if (report.classList.contains('hidden')) btnCalc.click();
    window.print();
  });

  form.addEventListener('reset', () => {
    localStorage.removeItem(STORAGE_KEY);
    setTimeout(() => report.classList.add('hidden'), 100);
  });
});
