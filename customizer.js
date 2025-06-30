// Dashboard Customizer Script

document.addEventListener('DOMContentLoaded', function () {
    const fontStyles = [
        'Segoe UI, sans-serif',
        'Roboto, sans-serif',
        'Open Sans, sans-serif',
        'Arial, sans-serif',
        'Courier New, monospace'
    ];
    const fontColors = [
        '#1a237e', // Dark Blue
        '#fff',    // White
        '#e53935', // Red
        '#43a047', // Green
        '#1e88e5'  // Blue
    ];
    const backgrounds = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Violet Gradient
        '#111',    // Black
        '#333',    // Dark Gray
        '#fff',    // White
        'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' // Sky Blue
    ];
    const cardBackgrounds = [
        '#fff',    // White
        '#222',    // Dark Gray
        '#708090', // Slate
        '#001f3f', // Navy
        '#191970'  // Midnight Blue
    ];
    const buttonColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Default Gradient
        '#f06292', // Pink
        '#42a5f5', // Blue
        '#66bb6a', // Green
        '#ffa726'  // Orange
    ];

    document.getElementById('applyCustomizer').addEventListener('click', function () {
        // Font Style
        const fontStyle = fontStyles[document.getElementById('fontStyle').value];
        document.body.style.fontFamily = fontStyle;

        // Font Color
        const fontColor = fontColors[document.getElementById('fontColor').value];
        document.body.style.color = fontColor;
        document.querySelectorAll('.card, .chart-header, h1, h2, h3, h4, h5, h6').forEach(el => {
            el.style.color = fontColor;
        });

        // Background
        const background = backgrounds[document.getElementById('background').value];
        document.body.style.background = background;

        // Card Background
        const cardBg = cardBackgrounds[document.getElementById('cardBackground').value];
        document.querySelectorAll('.card, .table-container, .chart-container').forEach(el => {
            el.style.background = cardBg;
        });

        // Button Color
        const buttonColor = buttonColors[document.getElementById('buttonColor').value];
        document.querySelectorAll('button, .btn-primary').forEach(btn => {
            btn.style.background = buttonColor;
            btn.style.color = '#fff';
        });
    });
}); 