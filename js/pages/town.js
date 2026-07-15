function updateTownGoldDisplay() {
  const goldDisplays = document.querySelectorAll("#townGoldDisplay");
  if (!goldDisplays.length) return;
  const save = getSaveData();
  const gold = save.gold || 0;
  // 添加千分位分隔: 1000 -> "1,000"
  const goldText = gold.toLocaleString('en-US');  // 或 ('' + gold).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  goldDisplays.forEach(dom => { dom.textContent = goldText; });
}

function initTownModule() {
    updateTownGoldDisplay();
    const townTab = document.getElementById('tab-town');
    if (townTab) {
        const observer = new MutationObserver(() => {
            if (townTab.classList.contains('active')) updateTownGoldDisplay();
        });
        observer.observe(townTab, { attributes: true, attributeFilter: ['class'] });
    }
}

window.updateTownGoldDisplay = updateTownGoldDisplay;
window.initTownModule = initTownModule;