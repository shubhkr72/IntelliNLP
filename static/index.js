// Word count functionality
const textArea = document.getElementById('inputText');
const wordCount = document.getElementById('word-count');
const wordCountText = document.getElementById('word-count-text');
const analyzeBtn = document.getElementById('analyze-btn');
const removeFileBtn = document.getElementById('removeFileBtn');
const fileInput = document.getElementById('file');
const modelSelect = document.getElementById('model_type');

// Initialize remove button as hidden
removeFileBtn.style.display = 'none';

// Ensure correct state on load (analyze route can render with pre-filled text)
function syncInteractionState() {
    const words = textArea.value.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length > 0) {
        // Text present: disable file upload, enable analyze based on word count
        fileInput.disabled = true;
        analyzeBtn.disabled = words.length < 4 || words.length > 300;
    } else {
        // No text: allow file upload
        fileInput.disabled = false;
    }
}
document.addEventListener('DOMContentLoaded', syncInteractionState);
// Also run immediately for SSR-loaded content
syncInteractionState();

textArea.addEventListener('input', function () {
    const words = this.value.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCountNum = words.length;

    console.log('Word count:', wordCountNum); // Debug log

    if (wordCountNum > 0) {
        wordCount.style.display = 'block';
        // Disable file upload when text is entered
        fileInput.disabled = true;

        if (wordCountNum < 4) {
            wordCountText.textContent = `Text must have at least 4 words. Current: ${wordCountNum}`;
            wordCount.style.background = 'var(--gradient-secondary)';
            analyzeBtn.disabled = true;
        } else if (wordCountNum > 300) {
            wordCountText.textContent = `Text exceeds 300 word limit. Current: ${wordCountNum}`;
            wordCount.style.background = 'var(--gradient-secondary)';
            analyzeBtn.disabled = true;
        } else {
            wordCountText.textContent = `Word count: ${wordCountNum}/300`;
            wordCount.style.background = 'var(--success-color)';
            analyzeBtn.disabled = false;
        }
    } else {
        wordCount.style.display = 'none';
        analyzeBtn.disabled = true;
        // Re-enable file upload when no text
        fileInput.disabled = false;
    }

    console.log('Analyze button disabled:', analyzeBtn.disabled); // Debug log
});

// File upload handling
removeFileBtn.addEventListener('click', function () {
    fileInput.value = '';
    this.style.display = 'none';
    // Re-enable text input when file is removed
    textArea.disabled = false;
    textArea.placeholder = "Enter your text here for sentiment analysis...";
    fileInput.disabled = false;
    // Hide word count and disable analyze button
    wordCount.style.display = 'none';
    analyzeBtn.disabled = (textArea.value.trim().split(/\s+/).filter(w => w.length > 0).length < 4);
});

fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
        removeFileBtn.style.display = 'inline-block';
        // Disable text input when file is uploaded
        textArea.disabled = true;
        textArea.placeholder = "File uploaded - text input disabled";
        // Enable analyze button when file is uploaded
        analyzeBtn.disabled = false;
        wordCount.style.display = 'block';
        wordCountText.textContent = `File uploaded: ${this.files[0].name}`;
        wordCount.style.background = 'var(--success-color)';
    } else {
        removeFileBtn.style.display = 'none';
        // Re-enable text input when no file
        textArea.disabled = false;
        textArea.placeholder = "Enter your text here for sentiment analysis...";
        wordCount.style.display = 'none';
        analyzeBtn.disabled = (textArea.value.trim().split(/\s+/).filter(w => w.length > 0).length < 4);
    }
});

// Enable analyze when user switches model and valid input exists
modelSelect.addEventListener('change', function () {
    const words = textArea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (fileInput.files.length > 0 || words >= 4) {
        analyzeBtn.disabled = false;
    }
});

// Copy sample text functionality
function copySampleText() {
    const sampleText = `I woke up today feeling pretty optimistic. The sun was shining, and I thought, "This is going to be a good day" (positive). However, as soon as I checked my phone, I saw a message from my boss about a mistake in yesterday's report. I felt an immediate rush of anxiety and disappointment (negative). I quickly logged in and fixed the issue, but the weight of that mistake stuck with me throughout the morning.

Later, I went for a walk to clear my mind. The park was calm, and the fresh air helped me relax a bit (neutral). But while I was out, I ran into an old friend from school. We hadn't seen each other in years! Catching up with her brought back so many happy memories, and we laughed about the good times we shared (positive).

As the day went on, I couldn't help but feel a bit lonely after saying goodbye to her (sad). Even though our conversation was nice, it reminded me how much things have changed and how distant I feel from people lately (negative).

By the evening, I decided to focus on myself and enjoy a quiet dinner at home. While the day had its ups and downs, I realized that it's just part of life. Some moments are tough, but others bring joy and comfort. Overall, I'm learning to accept both (reflective).`;

    navigator.clipboard.writeText(sampleText).then(function () {
        // Also paste it into the textarea
        document.getElementById('inputText').value = sampleText;
        // Trigger the input event to update word count
        document.getElementById('inputText').dispatchEvent(new Event('input'));

        // Show success message
        const copyBtn = document.querySelector('[onclick="copySampleText()"]');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Copied & Pasted!';
        copyBtn.classList.add('btn-success');

        // Close the modal after a short delay
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleTextModal'));
            modal.hide();

            // Reset button after modal closes
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('btn-success');
            }, 500);
        }, 1500);
    });
}

// Add loading state to form submission
document.getElementById('sentimentForm').addEventListener('submit', function (e) {
    console.log('Form submitted!');
    const submitBtn = document.getElementById('analyze-btn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analyzing...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
});

// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Accordion functionality
function toggleAccordion(section) {
    const content = document.getElementById(section + '-content');
    const icon = document.getElementById(section + '-icon');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// Initialize charts when results are available
document.addEventListener('DOMContentLoaded', function () {
    // Sentiment Distribution Chart
    const sentimentCtx = document.getElementById('sentimentChart');
    const sentimentDataEl = document.getElementById('sentiment-data');
    const sentimentDistEl = document.getElementById('sentiment-dist');
    if (sentimentCtx && sentimentDataEl) {
        const parsed = JSON.parse(sentimentDataEl.textContent || '{}');
        const dist = sentimentDistEl ? JSON.parse(sentimentDistEl.textContent || '{}') : {};
        let counts = parsed.counts || [];
        const labels = parsed.labels || ['Positive', 'Neutral', 'Negative'];

        // Fallback: build counts from distribution object if needed
        if (!Array.isArray(counts) || counts.length !== 3) {
            const positive = Number(dist.positive || 0);
            const neutral = Number(dist.neutral || 0);
            const negative = Number(dist.negative || 0);
            counts = [positive, neutral, negative];
        }

        console.log('[Chart Debug] labels:', labels, 'counts:', counts, 'dist:', dist);

        if (counts.some(c => typeof c === 'number') && counts.reduce((a, b) => a + b, 0) > 0) {
            new Chart(sentimentCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            '#10b981',
                            '#64748b',
                            '#ef4444'
                        ],
                        borderWidth: 4,
                        borderColor: '#ffffff',
                        hoverOffset: 8,
                        borderJoinStyle: 'round'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '55%',
                    animation: { animateScale: true, duration: 900 },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 18,
                                usePointStyle: true,
                                boxWidth: 10
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `${ctx.label}: ${ctx.parsed}`
                            }
                        }
                    }
                }
            });
        } else {
            console.warn('[Chart Debug] No data to render chart');
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Emotion Distribution Chart
    const emotionCtx = document.getElementById('emotionChart');
    const dataEl = document.getElementById('emotion-data');
    if (emotionCtx && dataEl) {
        const parsed = JSON.parse(dataEl.textContent || '{}');
        const emotions = parsed.labels || [];
        const counts = parsed.counts || [];

        new Chart(emotionCtx, {
            type: 'bar',
            data: {
                labels: emotions,
                datasets: [{
                    label: 'Word Count',
                    data: counts,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
});

function copySectionText(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text.trim());
}

function downloadSection(sectionId, filename) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const text = (el.innerText || el.textContent).trim();
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function toggleExpand(btn) {
    const card = btn.closest('.step-header').nextElementSibling;
    if (!card) return;
    card.classList.toggle('expanded');
    const icon = btn.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-expand');
        icon.classList.toggle('fa-compress');
    }
}

function toggleFullscreen(btn) {
    const wrapper = btn.closest('.text-cleaning-card, .normalization-card, .tokenization-card, .stemming-lemmatization-card, .wordcloud-section, .ner-analysis-card, .pos-analysis-card, .word-sentiment-analysis, .emotion-analysis');
    if (!wrapper) return;
    wrapper.classList.toggle('fullscreen');
    const icon = btn.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-expand');
        icon.classList.toggle('fa-compress');
    }
}

window.copySampleText = copySampleText;
window.toggleAccordion = toggleAccordion;
window.copySectionText = copySectionText;
window.downloadSection = downloadSection;
window.toggleExpand = toggleExpand;
window.toggleFullscreen = toggleFullscreen;
