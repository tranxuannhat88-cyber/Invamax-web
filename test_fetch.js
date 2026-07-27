const data = {
    formType: 'contact',
    hoTen: 'Test'
};

fetch('https://script.google.com/macros/s/AKfycbwINtrEt8nfP0lzCeTKAbmCgUzsgGs_EkGdmEKjQQfxKubCoIAnhivJK0mNnuHFd4Ds/exec', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'text/plain;charset=utf-8'
    }
})
.then(res => {
    console.log("Status:", res.status);
    return res.text();
})
.then(text => {
    console.log("Body:", text);
})
.catch(err => {
    console.error("Error:", err);
});
