// Function to open quote modal
function openQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Function to close quote modal
function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.remove('active');
        // Reset form
        document.getElementById('quoteForm').style.display = 'block';
        document.getElementById('quoteForm').reset();
        document.getElementById('quoteSuccess').style.display = 'none';
        document.getElementById('quoteLoading').style.display = 'none';
        document.getElementById('btnSubmitQuote').style.display = 'block';
    }
}

// Handle form submission
async function submitQuoteForm(e) {
    e.preventDefault();
    
    // REPLACE THIS URL with your actual Google Apps Script Web App URL after deployment
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwINtrEt8nfP0lzCeTKAbmCgUzsgGs_EkGdmEKjQQfxKubCoIAnhivJK0mNnuHFd4Ds/exec';
    
    

    const form = e.target;
    const btnSubmit = document.getElementById('btnSubmitQuote');
    const loading = document.getElementById('quoteLoading');
    const successMsg = document.getElementById('quoteSuccess');
    
    // Show loading
    btnSubmit.style.display = 'none';
    loading.style.display = 'block';
    
    const formData = new FormData(form);
    const data = {
        formType: 'quote',
        name: formData.get('name'),
        company: formData.get('company'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        requirement: formData.get('requirement'),
        fileName: '',
        mimeType: '',
        fileBase64: ''
    };
    
    // Handle file input
    const fileInput = document.getElementById('quoteFile');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        data.fileName = file.name;
        data.mimeType = file.type;
        
        try {
            data.fileBase64 = await toBase64(file);
            // Remove the data:*/*;base64, prefix
            data.fileBase64 = data.fileBase64.split('base64,')[1];
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Có lỗi xảy ra khi đọc file đính kèm.');
            // Reset UI
            btnSubmit.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
    }
    
    // Send data to GAS
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Important for avoiding CORS preflight on some GAS setups
            }
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            loading.style.display = 'none';
            document.getElementById('quoteForm').style.display = 'none';
            successMsg.style.display = 'block';
            lucide.createIcons();
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
        btnSubmit.style.display = 'block';
        loading.style.display = 'none';
    }
}

// Utility function to convert file to base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
