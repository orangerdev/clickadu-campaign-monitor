
function addLeadingZero(value) {
    let newValue = '';

    if (typeof value === 'number' && value >= 0 && value < 10) {
      // Tambahkan leading zero jika nilai adalah integer 1 digit
      newValue = '0' + value;
    } else {
      newValue = value;
    }

  return newValue;
}

function findCampaignParameter(input, param) {
    // Membuat regex dinamis berdasarkan parameter yang diberikan
    const regex = new RegExp(`\\[${param}:(\\d+(\\.\\d+)?)\\]`);
    const match = input.match(regex);

    if (match) {
        const value = match[1]; // Mengambil nilai dari hasil pencocokan
        return value; // Mengembalikan nilai yang ditemukan
    } else {
        return false;
    }
}