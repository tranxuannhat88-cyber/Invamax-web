$file = 'C:\Users\MAY TINH 2K\Desktop\invamax-website\kham-benh-online\assets\js\admin.js'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

$startIndex = -1
$endIndex = -1

for ($i=0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'function initCharts') { $startIndex = $i; break }
}
for ($i=$startIndex; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'function exportPDF') { $endIndex = $i; break }
}

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $lines[0..($startIndex-1)] -join "`r`n"
    $after = $lines[$endIndex..($lines.Length-1)] -join "`r`n"
    
    $replacement = @"
function initCharts(res) {
    const healthScore = 100 - res.warningScore;
    const gaugeCtx = document.getElementById('gaugeChart');
    if (gaugeCtx) {
        if (window.gaugeChartInst) window.gaugeChartInst.destroy();
        
        window.gaugeChartInst = new Chart(gaugeCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [20, 20, 20, 20, 20],
                    backgroundColor: ['#10b981', '#facc15', '#f97316', '#ef4444', '#334155'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { tooltip: { enabled: false }, legend: { display: false } },
                animation: { animateRotate: true, animateScale: false }
            }
        });
    }

    const radarCtx = document.getElementById('radarChart');
    if (radarCtx && res.wasteScores) {
        if (window.radarChartInst) window.radarChartInst.destroy();
        
        const labels = res.wasteScores.map(w => w.module);
        const data = res.wasteScores.map(w => w.score);
        
        window.radarChartInst = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Điểm Lãng Phí',
                    data: data,
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    borderColor: '#f97316',
                    pointBackgroundColor: '#ea580c',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ea580c'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 9, family: "'Inter', sans-serif", weight: '600' }, color: '#475569' },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}
"@

    $combined = $before + "`r`n" + $replacement + "`r`n" + $after
    [System.IO.File]::WriteAllText($file, $combined, [System.Text.Encoding]::UTF8)
    Write-Output "Successfully updated initCharts"
} else {
    Write-Output "Could not find bounds"
}
