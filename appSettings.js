const settings = {
    clientId: process.env.ClinetID,
    tenantId: 'common',
    graphUserScopes: [
        'user.read',
        'mail.read',
        'mail.send'
    ]
};

module.exports = settings;
