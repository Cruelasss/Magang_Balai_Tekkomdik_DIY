exports.validateRegistration = (data) => {
    const errors = [];
    if (!data.email.includes('@')) errors.push("Email tidak valid");
    if (data.nama.length < 3) errors.push("Nama terlalu pendek");
    return {
        isValid: errors.length === 0,
        errors
    };
};