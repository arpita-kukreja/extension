
document.addEventListener('DOMContentLoaded', () => {
  const keywordsInput = document.getElementById('keywords');
  const blockShortsInput = document.getElementById('blockShorts');
  const blockTranscriptsInput = document.getElementById('blockTranscripts');
  const blockTitlesInput = document.getElementById('blockTitles');

  chrome.storage.sync.get(['keywords', 'blockShorts', 'blockTranscripts', 'blockTitles'], (data) => {
    keywordsInput.value = (data.keywords || []).join(', ');
    blockShortsInput.checked = data.blockShorts ?? true;
    blockTranscriptsInput.checked = data.blockTranscripts ?? false;
    blockTitlesInput.checked = data.blockTitles ?? true;
  });

  document.getElementById('save').addEventListener('click', () => {
    const keywords = keywordsInput.value.split(',').map(k => k.trim()).filter(k => k);
    const blockShorts = blockShortsInput.checked;
    const blockTranscripts = blockTranscriptsInput.checked;
    const blockTitles = blockTitlesInput.checked;

    chrome.storage.sync.set({ keywords, blockShorts, blockTranscripts, blockTitles }, () => {
      alert('Settings saved!');
    });
  });
});
