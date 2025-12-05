// API base URL
const API_BASE = window.location.origin;

// DOM elements
const namesGrid = document.getElementById('names-grid');
const selectedNameSelect = document.getElementById('selected-name');
const selectBtn = document.getElementById('select-btn');
const messageDiv = document.getElementById('message');
const totalNamesSpan = document.getElementById('total-names');
const selectedCountSpan = document.getElementById('selected-count');
const remainingCountSpan = document.getElementById('remaining-count');

let names = [];

// Load names and stats
async function loadNames() {
    try {
        const response = await fetch(`${API_BASE}/api/names`);
        names = await response.json();
        renderNames();
        updateSelectDropdown();
    } catch (error) {
        showMessage('Error loading names: ' + error.message, 'error');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        const stats = await response.json();
        totalNamesSpan.textContent = stats.total;
        selectedCountSpan.textContent = stats.selected;
        remainingCountSpan.textContent = stats.remaining;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render names grid
function renderNames() {
    namesGrid.innerHTML = '';
    
    names.forEach(name => {
        const card = document.createElement('div');
        card.className = `name-card ${name.isSelected ? 'selected' : ''}`;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = name.name;
        card.appendChild(nameDiv);
        
        if (name.isSelected) {
            const badge = document.createElement('div');
            badge.className = 'badge';
            badge.textContent = name.selectionCount;
            card.appendChild(badge);
        }
        
        namesGrid.appendChild(card);
    });
}

// Update select dropdown
function updateSelectDropdown() {
    selectedNameSelect.innerHTML = '<option value="">Choose a name...</option>';
    
    names.forEach(name => {
        const option = document.createElement('option');
        option.value = name.id;
        option.textContent = name.name + (name.isSelected ? ' (Already Selected)' : '');
        option.disabled = name.isSelected;
        selectedNameSelect.appendChild(option);
    });
}

// Handle selection
selectBtn.addEventListener('click', async () => {
    const selectedNameId = selectedNameSelect.value;
    
    if (!selectedNameId) {
        showMessage('Please select the name you were drawn to', 'error');
        return;
    }
    
    // Check if selected name is already taken
    const selectedName = names.find(n => n.id === parseInt(selectedNameId));
    if (selectedName && selectedName.isSelected) {
        showMessage('This name has already been selected!', 'error');
        return;
    }
    
    selectBtn.disabled = true;
    selectBtn.textContent = 'Selecting...';
    
    try {
        const response = await fetch(`${API_BASE}/api/select`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nameId: parseInt(selectedNameId)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Success! Your selection has been recorded.', 'success');
            selectedNameSelect.value = '';
            await loadNames();
            await loadStats();
        } else {
            showMessage(data.error || 'Error selecting name', 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    } finally {
        selectBtn.disabled = false;
        selectBtn.textContent = 'Select Name';
    }
});

// Show message
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// Allow Enter key to submit
selectedNameSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        selectBtn.click();
    }
});

// Initial load
loadNames();
loadStats();

// Refresh every 10 seconds to see updates from other users
setInterval(() => {
    loadNames();
    loadStats();
}, 10000);

