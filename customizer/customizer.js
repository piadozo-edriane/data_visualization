const styleSettings = {
    fontFamily: ["'Segoe UI'", "'Roboto'", "'Open Sans'", "'Arial'", "'Courier New'"],
    fontColor: ['#2c3e50', '#ffffff', '#ff4757', '#2ed573', '#1e90ff'],
    backgroundColor: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '#000000', '#2c2c2c', '#ffffff', '#87ceeb'],
    cardBackground: ['#ffffff', '#1e272e', '#2f3542', '#001f3f', '#191970'],
    buttonColor: ['linear-gradient(45deg, #667eea, #764ba2)','#ff6b81', '#1e90ff', '#2ed573', '#ffa502']
};

function applyCustomizer() {
    const font = document.getElementById('fontStyle').value;
    const fontColor = document.getElementById('fontColor').value;
    const background = document.getElementById('background').value;
    const cardBg = document.getElementById('cardBackground').value;
    const btnColor = document.getElementById('buttonColor').value;

    document.body.style.fontFamily = styleSettings.fontFamily[font];
    document.body.style.color = styleSettings.fontColor[fontColor];
    document.body.style.background = styleSettings.backgroundColor[background];

    document.querySelectorAll('.card, .chart-container, .table-container').forEach(el => {
        el.style.background = styleSettings.cardBackground[cardBg];
        el.style.color = styleSettings.fontColor[fontColor];
    });

    document.querySelectorAll('.btn-primary').forEach(el => {
        el.style.background = styleSettings.buttonColor[btnColor];
        el.style.color = '#fff';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('applyCustomizer').addEventListener('click', applyCustomizer);
});