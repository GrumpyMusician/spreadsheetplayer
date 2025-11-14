function loadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const csvData = e.target.result;

        // Split into lines, removing empty ones
        const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);

        // Reformat with all fields quoted
        const quotedLines = lines.map(line => {
        // Match fields correctly (handles commas within quotes)
        const fields = line.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g);
        if (!fields) return '';

        // Wrap every field in quotes and escape inner quotes
        return fields.map(field => {
            let clean = field.replace(/^"|"$/g, ''); // remove existing outer quotes
            clean = clean.replace(/"/g, '""');       // escape internal quotes
            return `"${clean}"`;
        }).join(',');
        });

        const CSV = quotedLines.join('\n');

        console.log(CSV);
    };

    reader.readAsText(file);
    } else {
    alert('Please select a CSV file.');
    }
}